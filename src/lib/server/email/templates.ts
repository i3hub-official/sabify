// src/lib/server/email/templates.ts
//
// All transactional email templates for Lezie.
// Each export is a function that returns { subject, html }.
//
// Usage:
//   import { passwordResetTemplate } from '$lib/server/email/templates';
//   const { subject, html } = passwordResetTemplate({ url, name: user.name });
//   await sendEmail({ to: user.email, subject, html });

import { dev } from '$app/environment';

const APP_URL  = dev ? 'http://localhost:5173' : 'https://lezie.vercel.app';
const APP_NAME = 'Lezie';
const LOGO_URL = `${APP_URL}/icons/sb_logo.png`;
const YEAR     = new Date().getFullYear();

// ─────────────────────────────────────────────────────────────────────────────
// BASE LAYOUT
// Every template renders inside this shell for consistent branding.
// ─────────────────────────────────────────────────────────────────────────────
function base({
  previewText,
  headerBadge,
  headerBadgeColor = '#6a2c91',
  title,
  body,
  cta,
  footerNote,
}: {
  previewText:       string;
  headerBadge:       string;
  headerBadgeColor?: string;
  title:             string;
  body:              string;
  cta?:              { label: string; url: string; danger?: boolean };
  footerNote?:       string;
}): string {
  const ctaColor  = cta?.danger ? '#dc2626' : 'linear-gradient(135deg,#6a2c91,#4a1d6e)';
  const ctaButton = cta ? `
    <div style="text-align:center;margin:1.75rem 0;">
      <a href="${cta.url}"
        style="display:inline-block;padding:.875rem 2.25rem;background:${ctaColor};color:white;font-weight:700;font-size:.9375rem;border-radius:.875rem;text-decoration:none;box-shadow:0 4px 14px rgba(106,44,145,.3);">
        ${cta.label}
      </a>
    </div>
    <p style="color:#94a3b8;font-size:.75rem;text-align:center;margin:.5rem 0 0;">
      Can't click the button? Copy this link:<br/>
      <span style="color:#6a2c91;word-break:break-all;">${cta.url}</span>
    </p>
  ` : '';

  const footer = footerNote ? `
    <p style="color:#94a3b8;font-size:.75rem;line-height:1.6;margin:1rem 0 0;padding-top:1rem;border-top:1px solid #f1f5f9;">
      ${footerNote}
    </p>
  ` : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <meta name="x-apple-disable-message-reformatting"/>
      <!--[if !mso]><!-->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
      <!--<![endif]-->
      <title>${previewText}</title>
    </head>
    <body style="margin:0;padding:0;background:#f3f0ff;font-family:'DM Sans',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

      <!-- Preview text (hidden, shown in inbox snippet) -->
      <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
        ${previewText}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌
      </div>

      <div style="max-width:520px;margin:2rem auto;padding:0 1rem;">

        <!-- Logo -->
        <div style="text-align:center;margin-bottom:1.25rem;">
          <a href="${APP_URL}" style="display:inline-block;">
            <img src="${LOGO_URL}" alt="${APP_NAME}" width="56" height="56"
              style="border-radius:.75rem;object-fit:contain;display:block;margin:0 auto;" />
          </a>
        </div>

        <!-- Card -->
        <div style="background:white;border-radius:1.25rem;overflow:hidden;box-shadow:0 8px 32px rgba(26,11,46,.1);border:1.5px solid #e5e7eb;">

          <!-- Coloured header strip -->
          <div style="background:linear-gradient(160deg,#1a0b2e 0%,#2d1b4e 100%);padding:1.5rem 2rem;display:flex;align-items:center;gap:.75rem;">
            <span style="background:${headerBadgeColor};color:white;font-size:.6875rem;font-weight:700;padding:.3rem .75rem;border-radius:100px;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap;">
              ${headerBadge}
            </span>
            <h1 style="color:white;font-size:1.125rem;margin:0;font-weight:700;letter-spacing:-.01em;line-height:1.3;">
              ${title}
            </h1>
          </div>

          <!-- Body -->
          <div style="padding:1.75rem 2rem 1.5rem;">
            ${body}
            ${ctaButton}
            ${footer}
          </div>
        </div>

        <!-- Global footer -->
        <div style="text-align:center;margin-top:1.25rem;">
          <p style="color:#94a3b8;font-size:.6875rem;margin:0;line-height:1.6;">
            © ${YEAR} ${APP_NAME} · Real-Time Safety & Monitoring<br/>
            <a href="${APP_URL}/unsubscribe" style="color:#c4b5fd;text-decoration:none;">Unsubscribe</a>
            &nbsp;·&nbsp;
            <a href="${APP_URL}/privacy" style="color:#c4b5fd;text-decoration:none;">Privacy Policy</a>
          </p>
        </div>

      </div>
    </body>
    </html>
  `.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — info row (used in device / profile templates)
// ─────────────────────────────────────────────────────────────────────────────
function infoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:.5rem .75rem;font-size:.8rem;font-weight:600;color:#64748b;white-space:nowrap;width:40%;">
        ${label}
      </td>
      <td style="padding:.5rem .75rem;font-size:.8rem;color:#1e1b4b;word-break:break-all;">
        ${value}
      </td>
    </tr>
  `;
}

function infoTable(rows: { label: string; value: string }[]): string {
  return `
    <table style="width:100%;border-collapse:collapse;background:#fafafa;border:1.5px solid #f1f5f9;border-radius:.875rem;overflow:hidden;margin:1.25rem 0;">
      <tbody>
        ${rows.map(r => infoRow(r.label, r.value)).join('')}
      </tbody>
    </table>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. EMAIL VERIFICATION  (wired into auth.ts → sendVerificationEmail)
// ─────────────────────────────────────────────────────────────────────────────
export function verificationEmailTemplate({ url, name }: { url: string; name?: string }) {
  const firstName = name?.split(' ')[0] ?? 'there';
  return {
    subject: `Verify your ${APP_NAME} account`,
    html: base({
      previewText:  `Hi ${firstName}, please verify your email to activate your Lezie account.`,
      headerBadge:  'Action required',
      title:        'Verify your email address',
      body: `
        <p style="color:#374151;font-size:.9375rem;line-height:1.6;margin:0 0 1rem;">
          Hi <strong>${firstName}</strong>, welcome to ${APP_NAME}! 👋<br/>
          Click the button below to verify your email address and activate your account.
        </p>
        <p style="color:#64748b;font-size:.8rem;line-height:1.6;margin:0;">
          This link expires in <strong>24 hours</strong>.
        </p>
      `,
      cta: { label: 'Verify my email', url },
      footerNote: `If you didn't create a ${APP_NAME} account you can safely ignore this email.`,
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. WELCOME  (send after emailVerified flips to true — from your verify callback)
// ─────────────────────────────────────────────────────────────────────────────
export function welcomeEmailTemplate({ name }: { name?: string }) {
  const firstName = name?.split(' ')[0] ?? 'there';
  return {
    subject: `Welcome to ${APP_NAME} — you're all set! 🎉`,
    html: base({
      previewText:  `Your account is verified. Welcome to the Lezie community, ${firstName}!`,
      headerBadge:  'Welcome',
      headerBadgeColor: '#15803d',
      title:        `You're in, ${firstName}!`,
      body: `
        <p style="color:#374151;font-size:.9375rem;line-height:1.6;margin:0 0 1.25rem;">
          Your email is verified and your account is ready to go.
          Here's what you can do right now:
        </p>

        <table style="width:100%;border-collapse:collapse;">
          ${[
            ['📍', 'Live Incident Map',  'See real-time safety events near you'],
            ['🔔', 'Instant Alerts',     'Get notified the moment something happens nearby'],
            ['🛡️', 'Report Incidents',   'Help keep your community informed and safe'],
            ['👤', 'Complete Your Profile', 'Add a photo and bio so neighbours recognise you'],
          ].map(([icon, title, desc]) => `
            <tr>
              <td style="padding:.625rem 0;vertical-align:top;width:2rem;font-size:1.125rem;">${icon}</td>
              <td style="padding:.625rem 0 .625rem .5rem;">
                <strong style="display:block;font-size:.875rem;color:#1e1b4b;">${title}</strong>
                <span style="font-size:.8rem;color:#64748b;">${desc}</span>
              </td>
            </tr>
          `).join('')}
        </table>
      `,
      cta: { label: `Go to my dashboard`, url: `${APP_URL}/dashboard` },
      footerNote: `You'll only receive emails that matter — safety alerts, security notices, and account updates.`,
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PASSWORD RESET  (wired into auth.ts → sendResetPassword)
// ─────────────────────────────────────────────────────────────────────────────
export function passwordResetTemplate({ url, name }: { url: string; name?: string }) {
  const firstName = name?.split(' ')[0] ?? 'there';
  return {
    subject: `Reset your ${APP_NAME} password`,
    html: base({
      previewText:  `Hi ${firstName}, we received a request to reset your Lezie password.`,
      headerBadge:  'Security',
      title:        'Reset your password',
      body: `
        <p style="color:#374151;font-size:.9375rem;line-height:1.6;margin:0 0 1rem;">
          Hi <strong>${firstName}</strong>, we received a request to reset the password
          for your ${APP_NAME} account.
        </p>
        <p style="color:#64748b;font-size:.8rem;line-height:1.6;margin:0 0 .5rem;">
          This link expires in <strong>1 hour</strong>.
          If you didn't request a reset, you can safely ignore this email —
          your password will not change.
        </p>
      `,
      cta: { label: 'Reset my password', url },
      footerNote: `For your security, this link can only be used once. After clicking it you'll be prompted to choose a new password.`,
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PASSWORD CHANGED  (send after a successful password reset)
// ─────────────────────────────────────────────────────────────────────────────
export function passwordChangedTemplate({
  name,
  changedAt,
  ip,
}: {
  name?:      string;
  changedAt?: Date;
  ip?:        string;
}) {
  const firstName = name?.split(' ')[0] ?? 'there';
  const time = (changedAt ?? new Date()).toUTCString();
  return {
    subject: `Your ${APP_NAME} password was changed`,
    html: base({
      previewText:  `Your Lezie password was successfully changed. If this wasn't you, act now.`,
      headerBadge:  'Security alert',
      headerBadgeColor: '#d97706',
      title:        'Your password was changed',
      body: `
        <p style="color:#374151;font-size:.9375rem;line-height:1.6;margin:0 0 1.25rem;">
          Hi <strong>${firstName}</strong>, your ${APP_NAME} password was successfully changed.
        </p>
        ${infoTable([
          { label: 'When', value: time },
          ...(ip ? [{ label: 'IP address', value: ip }] : []),
        ])}
        <div style="background:#fef3c7;border:1.5px solid #fde68a;border-radius:.75rem;padding:.875rem 1rem;margin-top:1rem;">
          <p style="color:#92400e;font-size:.8125rem;font-weight:600;margin:0 0 .25rem;">
            ⚠️ Wasn't you?
          </p>
          <p style="color:#92400e;font-size:.8rem;margin:0;line-height:1.5;">
            If you didn't make this change, your account may be compromised.
            Reset your password immediately and contact our support team.
          </p>
        </div>
      `,
      cta: { label: 'Secure my account', url: `${APP_URL}/forgot-password`, danger: true },
      footerNote: `If you made this change yourself, no action is required.`,
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. NEW DEVICE / LOCATION LOGIN  (send from your login route after session create)
// ─────────────────────────────────────────────────────────────────────────────
export function newDeviceLoginTemplate({
  name,
  device,
  browser,
  os,
  location,
  ip,
  loginAt,
}: {
  name?:     string;
  device?:   string;
  browser?:  string;
  os?:       string;
  location?: string;
  ip?:       string;
  loginAt?:  Date;
}) {
  const firstName = name?.split(' ')[0] ?? 'there';
  const time = (loginAt ?? new Date()).toUTCString();
  return {
    subject: `New sign-in to your ${APP_NAME} account`,
    html: base({
      previewText:  `A new sign-in was detected on your Lezie account. If this wasn't you, act now.`,
      headerBadge:  'Security alert',
      headerBadgeColor: '#d97706',
      title:        'New sign-in detected',
      body: `
        <p style="color:#374151;font-size:.9375rem;line-height:1.6;margin:0 0 1.25rem;">
          Hi <strong>${firstName}</strong>, we noticed a sign-in to your ${APP_NAME} account
          from a new device or location.
        </p>
        ${infoTable([
          { label: 'When',     value: time },
          { label: 'Device',   value: device   ?? 'Unknown device' },
          { label: 'Browser',  value: browser  ?? 'Unknown browser' },
          { label: 'OS',       value: os       ?? 'Unknown OS' },
          { label: 'Location', value: location ?? 'Unknown location' },
          { label: 'IP',       value: ip       ?? 'Unknown' },
        ])}
        <div style="background:#fef3c7;border:1.5px solid #fde68a;border-radius:.75rem;padding:.875rem 1rem;margin-top:1rem;">
          <p style="color:#92400e;font-size:.8125rem;font-weight:600;margin:0 0 .25rem;">
            ⚠️ Wasn't you?
          </p>
          <p style="color:#92400e;font-size:.8rem;margin:0;line-height:1.5;">
            If you don't recognise this sign-in, secure your account immediately
            by resetting your password.
          </p>
        </div>
      `,
      cta: { label: 'Secure my account', url: `${APP_URL}/forgot-password`, danger: true },
      footerNote: `If this was you signing in, no action is required. You can manage trusted devices in your security settings.`,
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. PROFILE UPDATED  (send from your profile update server route)
// ─────────────────────────────────────────────────────────────────────────────
export function profileUpdatedTemplate({
  name,
  changes,
  updatedAt,
}: {
  name?:      string;
  changes:    { field: string; oldValue?: string; newValue: string }[];
  updatedAt?: Date;
}) {
  const firstName = name?.split(' ')[0] ?? 'there';
  const time = (updatedAt ?? new Date()).toUTCString();

  const changeRows = changes.map(c => `
    <tr>
      <td style="padding:.5rem .75rem;font-size:.8rem;font-weight:600;color:#64748b;white-space:nowrap;width:35%;">
        ${c.field}
      </td>
      <td style="padding:.5rem .75rem;font-size:.8rem;">
        ${c.oldValue
          ? `<span style="color:#94a3b8;text-decoration:line-through;margin-right:.5rem;">${c.oldValue}</span>
             <span style="color:#6a2c91;font-weight:600;">→ ${c.newValue}</span>`
          : `<span style="color:#1e1b4b;">${c.newValue}</span>`
        }
      </td>
    </tr>
  `).join('');

  return {
    subject: `Your ${APP_NAME} profile was updated`,
    html: base({
      previewText:  `Your Lezie profile was updated on ${time}.`,
      headerBadge:  'Account update',
      headerBadgeColor: '#0284c7',
      title:        'Your profile was updated',
      body: `
        <p style="color:#374151;font-size:.9375rem;line-height:1.6;margin:0 0 1.25rem;">
          Hi <strong>${firstName}</strong>, the following changes were made to your profile.
        </p>
        <table style="width:100%;border-collapse:collapse;background:#fafafa;border:1.5px solid #f1f5f9;border-radius:.875rem;overflow:hidden;margin:0 0 1rem;">
          <thead>
            <tr style="background:#f8f5ff;">
              <th style="padding:.625rem .75rem;font-size:.75rem;font-weight:700;color:#6a2c91;text-align:left;text-transform:uppercase;letter-spacing:.05em;">Field</th>
              <th style="padding:.625rem .75rem;font-size:.75rem;font-weight:700;color:#6a2c91;text-align:left;text-transform:uppercase;letter-spacing:.05em;">Change</th>
            </tr>
          </thead>
          <tbody>${changeRows}</tbody>
        </table>
        <p style="color:#64748b;font-size:.8rem;margin:0;">Updated at: ${time}</p>
      `,
      cta: { label: 'Review my profile', url: `${APP_URL}/profile` },
      footerNote: `If you didn't make these changes, please secure your account immediately.`,
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. PASSKEY ADDED  (send when user registers a new passkey)
// ─────────────────────────────────────────────────────────────────────────────
export function passkeyAddedTemplate({
  name,
  deviceName,
  addedAt,
}: {
  name?:       string;
  deviceName?: string;
  addedAt?:    Date;
}) {
  const firstName = name?.split(' ')[0] ?? 'there';
  const time = (addedAt ?? new Date()).toUTCString();
  return {
    subject: `New passkey added to your ${APP_NAME} account`,
    html: base({
      previewText:  `A new passkey was registered on your Lezie account.`,
      headerBadge:  'Security',
      headerBadgeColor: '#0284c7',
      title:        'New passkey registered',
      body: `
        <p style="color:#374151;font-size:.9375rem;line-height:1.6;margin:0 0 1.25rem;">
          Hi <strong>${firstName}</strong>, a new passkey was added to your ${APP_NAME} account.
          You can now sign in without a password on this device.
        </p>
        ${infoTable([
          { label: 'Device', value: deviceName ?? 'Unknown device' },
          { label: 'Added',  value: time },
        ])}
        <div style="background:#fef3c7;border:1.5px solid #fde68a;border-radius:.75rem;padding:.875rem 1rem;margin-top:1rem;">
          <p style="color:#92400e;font-size:.8125rem;font-weight:600;margin:0 0 .25rem;">
            ⚠️ Wasn't you?
          </p>
          <p style="color:#92400e;font-size:.8rem;margin:0;line-height:1.5;">
            If you didn't add this passkey, remove it from your security settings immediately.
          </p>
        </div>
      `,
      cta: { label: 'Manage my passkeys', url: `${APP_URL}/settings/security` },
      footerNote: `Passkeys are a secure, phishing-resistant alternative to passwords.`,
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. ACCOUNT SUSPENDED  (send from your admin/moderation route)
// ─────────────────────────────────────────────────────────────────────────────
export function accountSuspendedTemplate({
  name,
  reason,
  until,
  appealUrl,
}: {
  name?:      string;
  reason?:    string;
  until?:     Date | 'permanent';
  appealUrl?: string;
}) {
  const firstName = name?.split(' ')[0] ?? 'there';
  const untilText = !until
    ? 'until further notice'
    : until === 'permanent'
    ? 'permanently'
    : `until ${(until as Date).toUTCString()}`;

  return {
    subject: `Your ${APP_NAME} account has been suspended`,
    html: base({
      previewText:  `Your Lezie account has been suspended ${untilText}.`,
      headerBadge:  'Account suspended',
      headerBadgeColor: '#dc2626',
      title:        'Your account has been suspended',
      body: `
        <p style="color:#374151;font-size:.9375rem;line-height:1.6;margin:0 0 1.25rem;">
          Hi <strong>${firstName}</strong>, your ${APP_NAME} account has been suspended
          <strong>${untilText}</strong>.
        </p>
        ${reason ? `
          ${infoTable([{ label: 'Reason', value: reason }])}
        ` : ''}
        <p style="color:#64748b;font-size:.8rem;line-height:1.6;margin:1rem 0 0;">
          If you believe this is a mistake or would like to appeal this decision,
          please contact our support team.
        </p>
      `,
      cta: appealUrl
        ? { label: 'Appeal this decision', url: appealUrl, danger: true }
        : { label: 'Contact support', url: `${APP_URL}/support`, danger: true },
      footerNote: `${APP_NAME} reserves the right to suspend accounts that violate our community guidelines.`,
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. ACCOUNT REACTIVATED  (send when a suspension is lifted)
// ─────────────────────────────────────────────────────────────────────────────
export function accountReactivatedTemplate({ name }: { name?: string }) {
  const firstName = name?.split(' ')[0] ?? 'there';
  return {
    subject: `Your ${APP_NAME} account has been reactivated`,
    html: base({
      previewText:  `Good news — your Lezie account is active again.`,
      headerBadge:  'Account restored',
      headerBadgeColor: '#15803d',
      title:        'Your account is active again',
      body: `
        <p style="color:#374151;font-size:.9375rem;line-height:1.6;margin:0 0 1.25rem;">
          Hi <strong>${firstName}</strong>, your ${APP_NAME} account has been reviewed
          and reactivated. You can sign in and access all features again.
        </p>
        <p style="color:#64748b;font-size:.8rem;line-height:1.6;margin:0;">
          Please review our
          <a href="${APP_URL}/community-guidelines" style="color:#6a2c91;font-weight:600;">community guidelines</a>
          to ensure your continued access to the platform.
        </p>
      `,
      cta: { label: 'Sign back in', url: `${APP_URL}/signin` },
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. CRITICAL SAFETY ALERT  (send for high-severity incidents near user)
// ─────────────────────────────────────────────────────────────────────────────
export function safetyAlertTemplate({
  name,
  incidentType,
  location,
  distance,
  reportedAt,
  incidentUrl,
}: {
  name?:        string;
  incidentType: string;
  location:     string;
  distance?:    string;
  reportedAt?:  Date;
  incidentUrl:  string;
}) {
  const firstName = name?.split(' ')[0] ?? 'there';
  const time = (reportedAt ?? new Date()).toUTCString();
  return {
    subject: `⚠️ Safety alert near you — ${incidentType}`,
    html: base({
      previewText:  `A ${incidentType} was reported ${distance ? `${distance} from you` : 'near your area'}.`,
      headerBadge:  '⚠️ Safety alert',
      headerBadgeColor: '#dc2626',
      title:        `${incidentType} reported nearby`,
      body: `
        <p style="color:#374151;font-size:.9375rem;line-height:1.6;margin:0 0 1.25rem;">
          Hi <strong>${firstName}</strong>, a safety incident was reported in your area.
        </p>
        ${infoTable([
          { label: 'Incident',  value: incidentType },
          { label: 'Location',  value: location },
          ...(distance ? [{ label: 'Distance', value: distance }] : []),
          { label: 'Reported',  value: time },
        ])}
        <p style="color:#64748b;font-size:.8rem;line-height:1.6;margin:1rem 0 0;">
          Stay safe and avoid the area if possible. Check the live map for updates.
        </p>
      `,
      cta: { label: 'View incident on map', url: incidentUrl },
      footerNote: `You received this because you have safety alerts enabled for this area. Manage your alert preferences in your account settings.`,
    }),
  };
}
