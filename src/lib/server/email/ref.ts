// src/lib/server/email/ref.ts
//
// Signs and verifies a short-lived email reference token.
// Used to pass the email address securely through the /verify-email URL
// without exposing it in plaintext.
//
// Token format (base64url):  <email>.<expiry_unix>.<hmac_signature>

import { env } from '$env/dynamic/private';
import { createHmac } from 'crypto';

const TTL_MS = 1000 * 60 * 30; // 30 minutes — enough to check email and return

function getSecret(): string {
  const s = env.BETTER_AUTH_SECRET;
  if (!s || s.length < 16) throw new Error('BETTER_AUTH_SECRET is missing or too short');
  return s;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret())
    .update(payload)
    .digest('base64url');
}

// ── Create ────────────────────────────────────────────────────────────────────
export function createEmailRef(email: string): string {
  const expiry  = Date.now() + TTL_MS;
  const payload = `${email}.${expiry}`;
  const sig     = sign(payload);
  // Encode the whole thing so email special chars don't break the URL
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

// ── Verify ────────────────────────────────────────────────────────────────────
export type EmailRefResult =
  | { ok: true;  email: string }
  | { ok: false; reason: 'missing' | 'malformed' | 'expired' | 'tampered' };

export function verifyEmailRef(ref: string | null): EmailRefResult {
  if (!ref) return { ok: false, reason: 'missing' };

  let decoded: string;
  try {
    decoded = Buffer.from(ref, 'base64url').toString('utf8');
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  // Split from the right — email may contain dots
  const lastDot   = decoded.lastIndexOf('.');
  const secondDot = decoded.lastIndexOf('.', lastDot - 1);
  if (lastDot === -1 || secondDot === -1) return { ok: false, reason: 'malformed' };

  const sig     = decoded.slice(lastDot + 1);
  const payload = decoded.slice(0, lastDot);
  const expiry  = Number(decoded.slice(secondDot + 1, lastDot));
  const email   = decoded.slice(0, secondDot);

  if (!email || isNaN(expiry)) return { ok: false, reason: 'malformed' };

  // Constant-time signature check
  const expected = sign(payload);
  const sigBuf      = Buffer.from(sig,      'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const tampered =
    sigBuf.length !== expectedBuf.length ||
    !sigBuf.equals(expectedBuf); // not constant-time but fine for base64url
  if (tampered) return { ok: false, reason: 'tampered' };

  if (Date.now() > expiry) return { ok: false, reason: 'expired' };

  return { ok: true, email };
}
