// Builds the ALFON transactional emails.
//   node emails/build.mjs
// Writes:
//   emails/templates/<id>.html        production templates with {{Placeholders}} intact (inline styles, table layout)
//   emails/templates/manifest.json    the same emails plus sample data, read by the Mobile App > Email Templates tab
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/* ---------- brand tokens (from alfon-ai-admin/tailwind.config.js) ---------- */
const C = {
  brand: "#E8623A",
  brandHover: "#D4522D",
  tint: "#FFF4F0",
  tintLine: "#FBD9CC",
  ink: "#1A1A1A",
  body: "#4B5563",
  muted: "#6B7280",
  faint: "#9CA3AF",
  line: "#F0F0F0",
  subtle: "#F7F7F7",
  surface: "#F6F4EF",
  surfaceLine: "#ECE8DF",
  white: "#FFFFFF",
};
const SANS = "Inter, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const DISPLAY = "Sora, Inter, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/* ---------- building blocks ---------- */
const p = (html, extra = "") =>
  `<p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:24px;color:${C.body};${extra}">${html}</p>`;

const greeting = (name = "{{First Name}}") =>
  `<p style="margin:0 0 12px;font-family:${SANS};font-size:15px;line-height:24px;color:${C.ink};font-weight:600;">Hello ${name},</p>`;

// Bulletproof button: a table cell carries the colour so it survives clients that drop padding on <a>.
const button = (label, href) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:separate;margin:28px auto 8px;">
  <tr>
    <td align="center" bgcolor="${C.brand}" style="border-radius:10px;background:${C.brand};box-shadow:0 6px 16px rgba(232,98,58,0.28);">
      <a href="${href}" target="_blank" class="btn"
         style="display:inline-block;padding:14px 32px;font-family:${DISPLAY};font-size:15px;line-height:20px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:10px;letter-spacing:0.1px;">
        ${label}&nbsp;&nbsp;&rarr;
      </a>
    </td>
  </tr>
</table>`;

const fallbackLink = (href) => `
<p style="margin:16px 0 0;font-family:${SANS};font-size:12px;line-height:18px;color:${C.faint};text-align:center;">
  Button not working? Copy this link into your browser:<br>
  <a href="${href}" target="_blank" style="color:${C.brand};text-decoration:none;word-break:break-all;">${href}</a>
</p>`;

// Small rounded chip, used for expiry times.
const pill = (html) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:separate;margin:24px auto 0;">
  <tr>
    <td class="pill" align="center" style="text-align:center;padding:7px 14px;background:${C.tint};border:1px solid ${C.tintLine};border-radius:999px;font-family:${SANS};font-size:13px;line-height:18px;color:${C.brandHover};font-weight:600;">
      &#9201;&nbsp; ${html}
    </td>
  </tr>
</table>`;

// Muted reassurance box for "if you didn't request this".
const note = (html) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;margin:24px 0 0;">
  <tr>
    <td style="padding:14px 18px;background:${C.subtle};border-radius:12px;font-family:${SANS};font-size:13px;line-height:20px;color:${C.muted};">
      ${html}
    </td>
  </tr>
</table>`;

const otpBox = (code) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;margin:12px 0 16px;">
  <tr>
    <td align="center" style="padding:26px 16px 22px;background:${C.tint};border:1px dashed ${C.tintLine};border-radius:16px;">
      <div style="font-family:${SANS};font-size:11px;line-height:14px;color:${C.muted};text-transform:uppercase;letter-spacing:1.6px;font-weight:600;margin-bottom:10px;">Your code</div>
      <div class="otp" style="font-family:${DISPLAY};font-size:36px;line-height:44px;font-weight:700;color:${C.ink};letter-spacing:12px;padding-left:12px;">${code}</div>
    </td>
  </tr>
</table>`;

const signoff = (lead) => `
${lead ? p(lead, "margin-top:28px;") : ""}
<p style="margin:${lead ? "0" : "28px 0 0"};font-family:${SANS};font-size:15px;line-height:24px;color:${C.body};">
  Regards,<br><span style="font-family:${DISPLAY};font-weight:600;color:${C.ink};">Team ALFON</span>
</p>`;

/* ---------- the shared shell ---------- */
function layout({ subject, preheader, eyebrow, title, body, tagline }) {
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${subject}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Sora:wght@600;700&display=swap" rel="stylesheet">
<style>
  body{margin:0;padding:0;width:100%!important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;}
  img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}
  a{text-decoration:none;}
  .btn:hover{background:${C.brandHover}!important;}
  @media (max-width:620px){
    .wrap{padding:24px 12px!important;}
    .card-pad{padding:28px 22px 30px!important;}
    .hero{padding:32px 22px 4px!important;}
    .h1{font-size:22px!important;line-height:30px!important;}
    .otp{font-size:30px!important;letter-spacing:8px!important;padding-left:8px!important;}
    .btn{display:block!important;}
    .pill{border-radius:12px!important;padding:10px 16px!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.surface};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${C.surface};opacity:0;">
  ${preheader}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.surface}" style="background:${C.surface};">
  <tr>
    <td align="center" class="wrap" style="padding:40px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;max-width:560px;">

        <!-- card -->
        <tr>
          <td style="background:${C.white};border:1px solid ${C.surfaceLine};border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.04);">

            <!-- hero: the ALFON wordmark on a soft coral glow -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" class="hero" bgcolor="${C.tint}"
                    style="padding:44px 40px 4px;border-radius:16px 16px 0 0;background:${C.tint};background-image:linear-gradient(180deg,${C.tint} 0%,#FFFFFF 100%);">
                  <img src="{{Logo URL}}" width="144" alt="ALFON" style="display:block;margin:0 auto;width:144px;height:auto;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto 0;">
                    <tr><td width="32" height="2" bgcolor="${C.brand}" style="width:32px;height:2px;background:${C.brand};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
                  </table>
                  <p style="margin:20px 0 8px;font-family:${SANS};font-size:12px;line-height:16px;color:${C.brand};font-weight:600;text-transform:uppercase;letter-spacing:1.4px;">${eyebrow}</p>
                  <h1 class="h1" style="margin:0;font-family:${DISPLAY};font-size:26px;line-height:34px;font-weight:700;color:${C.ink};letter-spacing:-0.3px;">${title}</h1>
                </td>
              </tr>
            </table>

            <!-- body -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="card-pad" style="padding:28px 40px 36px;">
                  ${body}
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- footer -->
        <tr>
          <td align="center" style="padding:28px 16px 0;">
            ${
              tagline
                ? `<p style="margin:0 0 10px;font-family:${DISPLAY};font-size:15px;line-height:22px;font-weight:600;color:${C.brand};">${tagline}</p>`
                : ""
            }
            <p style="margin:0;font-family:${SANS};font-size:12px;line-height:18px;color:${C.faint};">&copy; {{Year}} ALFON. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

const email = (opts) => ({ html: layout(opts), preheader: opts.preheader });

/* ---------- the four emails (copy as supplied) ---------- */
const emails = [
  {
    id: "hotel-admin-invite",
    name: "Super Admin invites Hotel Admin",
    subject: "You're invited to join ALFON",
    ...email({
      subject: "You're invited to join ALFON",
      preheader: "Accept your invitation and set up your ALFON account for {{Hotel Name}}.",
      eyebrow: "Hotel Admin invitation",
      title: "Welcome to ALFON",
      tagline: "Great stays start with you!",
      body: [
        greeting(),
        p(`You've been invited to join ALFON as the <strong style="color:${C.ink};">Hotel Admin</strong> for <strong style="color:${C.ink};">{{Hotel Name}}</strong>.`),
        p("To get started, click the button below to accept your invitation and set up your account.", "margin-bottom:0;"),
        button("Accept Invitation", "{{Invitation Link}}"),
        fallbackLink("{{Invitation Link}}"),
        signoff("We look forward to having you on board!"),
      ].join(""),
    }),
  },
  {
    id: "staff-invite",
    name: "Hotel Admin invites staff",
    subject: "You've been invited to join ALFON | {{Hotel Name}}",
    ...email({
      subject: "You've been invited to join ALFON | {{Hotel Name}}",
      preheader: "{{Hotel Admin Name}} has invited you to join ALFON at {{Hotel Name}}.",
      eyebrow: "Team invitation",
      title: "Your team is on ALFON",
      tagline: "Great stays start with you!",
      body: [
        greeting(),
        p(`<strong style="color:${C.ink};">{{Hotel Admin Name}}</strong> has invited you to join ALFON at <strong style="color:${C.ink};">{{Hotel Name}}</strong>.`),
        p("Accept your invitation using the link below to get started.", "margin-bottom:0;"),
        button("Accept Invitation", "{{Invitation Link}}"),
        fallbackLink("{{Invitation Link}}"),
        signoff("We look forward to having you on board!"),
      ].join(""),
    }),
  },
  {
    id: "password-reset",
    name: "Password reset",
    subject: "Reset Your ALFON Password",
    ...email({
      subject: "Reset Your ALFON Password",
      preheader: "Use this link to create a new password. It expires in {{Expiry Duration}}.",
      eyebrow: "Account security",
      title: "Reset your password",
      body: [
        greeting(),
        p("We received a request to reset the password for your ALFON account."),
        p("Click the button below to create a new password.", "margin-bottom:0;"),
        button("Reset Password", "{{Password Reset Link}}"),
        pill("For security reasons, this link will expire in {{Expiry Duration}}."),
        fallbackLink("{{Password Reset Link}}"),
        note("If you did not request a password reset, you can safely ignore this email."),
        signoff(),
      ].join(""),
    }),
  },
  {
    id: "otp-verification",
    name: "OTP verification",
    subject: "Your ALFON Verification Code",
    ...email({
      subject: "Your ALFON Verification Code",
      preheader: "Your ALFON verification code is {{OTP}}. Valid for {{Expiry Duration}}.",
      eyebrow: "Verification",
      title: "Your verification code",
      body: [
        greeting(),
        p("Use the following One-Time Password (OTP) to verify your identity and continue with your ALFON account."),
        otpBox("{{OTP}}"),
        pill("This OTP is valid for {{Expiry Duration}}."),
        p(`<strong style="color:${C.ink};">For your security, please do not share this code with anyone.</strong>`, "margin:24px 0 0;text-align:center;font-size:14px;"),
        note("If you did not request this OTP, you can safely ignore this email."),
        signoff(),
      ].join(""),
    }),
  },
];

/* ---------- write production templates + the manifest the app reads ---------- */
const out = join(here, "templates");
mkdirSync(out, { recursive: true });
for (const e of emails) writeFileSync(join(out, `${e.id}.html`), e.html);

const sample = {
  "First Name": "Priya",
  "Hotel Name": "Layana Resort & Spa",
  "Hotel Admin Name": "Sophia Carter",
  "Invitation Link": "https://app.alfon.example/invite/7Kq9xR2mP4",
  "Password Reset Link": "https://app.alfon.example/reset/b81F0aQz",
  "Expiry Duration": "30 minutes",
  OTP: "482913",
  Year: "2026",
};
writeFileSync(
  join(out, "manifest.json"),
  JSON.stringify({ sample, emails: emails.map(({ id, name, subject, preheader, html }) => ({ id, name, subject, preheader, html })) }, null, 2) + "\n"
);

console.log(`Built ${emails.length} templates into emails/templates/`);
