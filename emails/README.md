# ALFON email templates

Transactional emails in the ALFON design language (coral `#E8623A`, warm surface `#F6F4EF`,
Sora headings / Inter body, 16px cards, 10px buttons, the ALFON wordmark as the hero mark).

| File | Subject |
| --- | --- |
| `templates/hotel-admin-invite.html` | You're invited to join ALFON |
| `templates/staff-invite.html` | You've been invited to join ALFON \| {{Hotel Name}} |
| `templates/password-reset.html` | Reset Your ALFON Password |
| `templates/otp-verification.html` | Your ALFON Verification Code |

## Editing

Content and styles live in `build.mjs`. After a change, run from the repo root:

```bash
node emails/build.mjs
```

It rewrites the HTML files above and `templates/manifest.json`, which the admin app reads to show the
emails under **Mobile App → Email Templates** (with sample data or raw placeholders). Commit both.

## Placeholders

From the copy: `{{First Name}}`, `{{Hotel Name}}`, `{{Hotel Admin Name}}`, `{{Invitation Link}}`,
`{{Password Reset Link}}`, `{{OTP}}`, `{{Expiry Duration}}`.

Added by the layout:
- `{{Logo URL}}`: an absolute, publicly hosted URL for `src/assets/alfon-logo.png`. Email clients block local files and most block data URIs.
- `{{Year}}`: the copyright year in the footer.

## Client notes

- Table layout with inline styles; the button is a coloured table cell, so it survives Outlook.
- Sora/Inter load in Apple Mail and iOS; Gmail and Outlook fall back to Segoe UI / Helvetica / Arial.
- The hero glow uses a CSS gradient with a solid tint fallback, so Outlook desktop shows a flat light-coral band.
