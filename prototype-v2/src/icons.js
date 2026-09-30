// Thin wrapper around lucide UMD icons so they can be used as React components
// without a build step. lucide.createElement(iconNode, attrs) returns a raw SVG DOM node.
function Icon({ name, size = 18, className = "", strokeWidth = 2, color }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!ref.current || !window.lucide) return;
    ref.current.innerHTML = "";
    const iconNode = window.lucide[name];
    if (!iconNode) return;
    const svgEl = window.lucide.createElement(iconNode, {
      width: size,
      height: size,
      "stroke-width": strokeWidth,
      color: color || "currentColor",
    });
    ref.current.appendChild(svgEl);
  }, [name, size, strokeWidth, color]);

  return <span ref={ref} className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }} />;
}

window.Icon = Icon;
