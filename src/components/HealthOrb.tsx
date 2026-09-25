import { useEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";

/** score → colour band */
export function scoreBand(score: number) {
  if (score >= 80) return { key: "excellent", label: "Excellent", color: "#5FD3A9", text: "text-emerald-600", pill: "bg-emerald-50 text-emerald-700" };
  if (score >= 65) return { key: "good", label: "Good", color: "#F3C56B", text: "text-amber-600", pill: "bg-amber-50 text-amber-700" };
  if (score >= 50) return { key: "attention", label: "Needs attention", color: "#F5A27A", text: "text-orange-600", pill: "bg-orange-50 text-orange-700" };
  return { key: "critical", label: "Critical", color: "#F08A9B", text: "text-red-600", pill: "bg-red-50 text-red-700" };
}

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const VERT = /* glsl */ `
${NOISE}
uniform float uTime;
uniform float uAmp;
uniform float uPixel;
uniform float uBreath;
uniform vec3 uMouse;
uniform float uPush;
attribute float aSeed;
varying float vRim;
void main(){
  vec3 dir = normalize(position);
  float n = snoise(dir * 1.5 + vec3(0.0, 0.0, uTime * 0.38)) * 0.62
          + snoise(dir * 3.1 - vec3(uTime * 0.26, 0.0, 0.0)) * 0.26
          + snoise(dir * 6.0 + vec3(0.0, uTime * 0.2, 0.0)) * 0.09;
  float r = 1.0 + n * uAmp;
  r *= 1.0 + uBreath * sin(uTime * 1.25);
  vec3 p = dir * r;
  // pointer: the surface swells towards the cursor
  vec3 wp = (modelMatrix * vec4(p, 1.0)).xyz;
  float dm = distance(wp, uMouse);
  p += dir * uPush * exp(-dm * dm * 2.2);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vec3 nrm = normalize(normalMatrix * dir);
  vRim = 1.0 - abs(nrm.z);
  gl_PointSize = uPixel * (0.7 + aSeed * 0.9) * (1.0 + vRim * 0.9) * (3.6 / -mv.z);
}`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vRim;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.05, d);
  float alpha = (0.04 + 0.62 * pow(vRim, 1.5)) * soft;
  vec3 col = mix(uColor * 1.1, uColor * 0.85, pow(vRim, 1.2));
  gl_FragColor = vec4(pow(col, vec3(1.0 / 2.2)), alpha); // back to sRGB so the pastel reads as pastel
}`;

/** fine grain drifting left to right, parting around the orb */
const STREAM_VERT = /* glsl */ `
uniform float uTime;
uniform float uHalfW;
uniform float uPixel;
uniform vec2 uCenter;
attribute float aSeed;
varying float vFade;
varying float vSeed;
void main(){
  float speed = 0.14 + aSeed * 0.24;
  float x = mod(position.x + uTime * speed + uHalfW, 2.0 * uHalfW) - uHalfW;
  float y = position.y
          + sin(uTime * 0.45 + x * 1.1 + aSeed * 6.283) * 0.10
          + sin(uTime * 0.23 + x * 2.3 + aSeed * 12.0) * 0.05;
  vec2 c = vec2(x, y) - uCenter;
  float d = length(c);
  vec2 dir = d > 0.001 ? c / d : vec2(0.0, 1.0);
  c += dir * exp(-d * d * 0.85) * 0.6;   // flow parts around the orb
  vec3 p = vec3(c + uCenter, position.z);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float u = (x + uHalfW) / (2.0 * uHalfW);
  vFade = smoothstep(0.0, 0.16, u) * (1.0 - smoothstep(0.84, 1.0, u));
  vSeed = aSeed;
  gl_PointSize = uPixel * (0.55 + aSeed * 1.0) * (3.4 / -mv.z);
}`;

const STREAM_FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vFade;
varying float vSeed;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.1, d);
  float alpha = (0.18 + 0.5 * vSeed) * vFade * soft;
  gl_FragColor = vec4(pow(uColor, vec3(1.0 / 2.2)), alpha);
}`;

/**
 * A breathing, slowly tumbling particle orb (three.js) with the score shown inside.
 * The colour follows the score band and eases when the score changes.
 */
export function HealthOrb({ score, size = 280, wide = false, children }: { score: number; size?: number; wide?: boolean; children?: ReactNode }) {
  const mount = useRef<HTMLDivElement>(null);
  const target = useRef(new THREE.Color(scoreBand(score).color));
  const amp = useRef(0.2);

  // update targets whenever the score changes
  useEffect(() => {
    target.current.set(scoreBand(score).color);
    // a lower score makes the surface a little more agitated
    amp.current = 0.10 + (1 - Math.min(Math.max(score, 0), 100) / 100) * 0.20;
  }, [score]);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return; // WebGL unavailable — the CSS glow below still shows
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    const W0 = wide ? Math.max(el.clientWidth, size) : size;
    renderer.setSize(W0, size);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W0 / size, 0.1, 20);
    const camZ = wide ? 4.2 : 3.35; // wide mode pulls back so the orb has room to drift
    camera.position.z = camZ;

    // fibonacci sphere
    const N = 16000;
    const pos = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      pos[i * 3] = Math.cos(th) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(th) * r;
      seed[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

    const color = new THREE.Color(scoreBand(score).color);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uAmp: { value: 0.12 },
        uBreath: { value: 0.06 },
        uMouse: { value: new THREE.Vector3(9, 9, 9) },
        uPush: { value: 0 },
        uPixel: { value: dpr * (size / 160) * 1.25 },
        uColor: { value: color },
      },
    });
    const points = new THREE.Points(geo, mat);
    points.rotation.set(0.6, 0.3, 0);
    scene.add(points);

    // flowing grain, left to right (wide mode)
    const visH = 2 * camZ * Math.tan((38 / 2) * (Math.PI / 180));
    let halfW = (visH * (W0 / size)) / 2 + 0.3;
    let streamMat: THREE.ShaderMaterial | null = null;
    let streamGeo: THREE.BufferGeometry | null = null;
    if (wide) {
      const M = 1300;
      const sp = new Float32Array(M * 3);
      const ss = new Float32Array(M);
      for (let i = 0; i < M; i++) {
        sp[i * 3] = (Math.random() * 2 - 1) * 6; // spread over a long strip; wrapped by the shader
        sp[i * 3 + 1] = (Math.random() * 2 - 1) * (visH * 0.5);
        sp[i * 3 + 2] = (Math.random() * 2 - 1) * 0.7;
        ss[i] = Math.random();
      }
      streamGeo = new THREE.BufferGeometry();
      streamGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
      streamGeo.setAttribute("aSeed", new THREE.BufferAttribute(ss, 1));
      streamMat = new THREE.ShaderMaterial({
        vertexShader: STREAM_VERT,
        fragmentShader: STREAM_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uHalfW: { value: halfW },
          uPixel: { value: dpr * (size / 160) * 1.15 },
          uCenter: { value: new THREE.Vector2(0, 0) },
          uColor: { value: color },
        },
      });
      scene.add(new THREE.Points(streamGeo, streamMat));
    }

    const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 0.5 : 1; // slower, never frozen
    const vel = new THREE.Vector3(0.12, 0.2, 0.07);
    const velTarget = new THREE.Vector3(0.12, 0.2, 0.07);
    const pointer = { x: 0, y: 0, inside: false, drag: false, lastX: 0, lastY: 0 };
    let push = 0;
    let nextTurn = 0;
    let raf = 0;
    const clock = new THREE.Clock();

    const frame = () => {
      const dt = Math.min(clock.getDelta(), 0.05) * calm;
      const t = (mat.uniforms.uTime.value as number) + dt;
      mat.uniforms.uTime.value = t;

      // pick a new slow, random spin direction every few seconds and ease towards it
      if (t > nextTurn) {
        nextTurn = t + 5 + Math.random() * 5;
        velTarget.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.3);
      }
      if (!pointer.drag) vel.lerp(velTarget, 1 - Math.pow(0.5, dt / 1.2));
      points.rotation.x += vel.x * dt;
      points.rotation.y += vel.y * dt;
      points.rotation.z += vel.z * dt;

      // ease colour + agitation towards their targets
      color.lerp(target.current, 1 - Math.pow(0.5, dt / 0.35));
      mat.uniforms.uAmp.value += (amp.current - mat.uniforms.uAmp.value) * (1 - Math.pow(0.5, dt / 0.5));

      // hover bulge follows the cursor (eased)
      push += ((pointer.inside ? 0.22 : 0) - push) * (1 - Math.pow(0.5, dt / 0.25));
      mat.uniforms.uPush.value = push;
      const wx = wide ? pointer.x * (visH * (renderer.domElement.clientWidth / size)) / 2 - points.position.x : pointer.x * 1.05;
      const wy = wide ? pointer.y * (visH / 2) - points.position.y : pointer.y * 1.05;
      mat.uniforms.uMouse.value.set(wx, wy, Math.sqrt(Math.max(0, 1 - wx * wx - wy * wy)));

      if (wide) {
        // the orb wanders slowly while the grain flows past it
        points.position.set(Math.sin(t * 0.22) * 0.22, Math.sin(t * 0.17 + 1.3) * 0.12, 0);
        if (streamMat) {
          streamMat.uniforms.uTime.value = t;
          (streamMat.uniforms.uCenter.value as THREE.Vector2).set(points.position.x, points.position.y);
        }
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    // drag to spin (with inertia), hover to make the surface swell towards the cursor
    const cv = renderer.domElement;
    cv.style.cursor = "grab";
    cv.style.touchAction = "pan-y";
    const toLocal = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const down = (e: PointerEvent) => {
      pointer.drag = true;
      pointer.lastX = e.clientX;
      pointer.lastY = e.clientY;
      cv.setPointerCapture(e.pointerId);
      cv.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      toLocal(e);
      pointer.inside = true;
      if (pointer.drag) {
        const dx = e.clientX - pointer.lastX, dy = e.clientY - pointer.lastY;
        pointer.lastX = e.clientX;
        pointer.lastY = e.clientY;
        points.rotation.y += dx * 0.012;
        points.rotation.x += dy * 0.012;
        vel.set(dy * 0.35, dx * 0.35, 0); // release with a little momentum
      }
    };
    const up = (e: PointerEvent) => {
      pointer.drag = false;
      cv.releasePointerCapture?.(e.pointerId);
      cv.style.cursor = "grab";
    };
    const leave = () => { pointer.inside = false; };
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
    cv.addEventListener("pointerleave", leave);

    frame();

    let ro: ResizeObserver | null = null;
    if (wide && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        const w = Math.max(el.clientWidth, size);
        renderer.setSize(w, size);
        camera.aspect = w / size;
        camera.updateProjectionMatrix();
        halfW = (visH * (w / size)) / 2 + 0.3;
        if (streamMat) streamMat.uniforms.uHalfW.value = halfW;
      });
      ro.observe(el);
    }

    return () => {
      ro?.disconnect();
      streamGeo?.dispose();
      streamMat?.dispose();
      cancelAnimationFrame(raf);
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("pointercancel", up);
      cv.removeEventListener("pointerleave", leave);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // the scene is created once; score changes are handled through refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, wide]);

  const band = scoreBand(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: wide ? "100%" : size, height: size }}>
      {/* soft glow behind the particles */}
      <div
        className="pointer-events-none absolute left-1/2 top-[8%] aspect-square -translate-x-1/2 rounded-full opacity-[0.16] blur-2xl transition-colors duration-700"
        style={{ background: band.color, height: "84%" }}
      />
      <div ref={mount} className="absolute inset-0" />
      <div className="pointer-events-none relative text-center">{children}</div>
    </div>
  );
}
