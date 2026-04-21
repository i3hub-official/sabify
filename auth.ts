// auth.ts
// better-auth 1.6.4 · prisma 7.7 · sveltekit

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { prisma } from './src/lib/server/prisma';


export const auth = betterAuth({
  // ── Database ─────────────────────────────────────────
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // ── Email + password ──────────────────────────────────
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Set to true once you have an email provider configured
    requireEmailVerification: false,
  },

  // ── Session ───────────────────────────────────────────
  session: {
    // 30-day sessions with a sliding window
    expiresIn:        60 * 60 * 24 * 30,
    updateAge:        60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge:  60 * 5,   // re-validate from DB every 5 min
    },
  },

  // ── User ─────────────────────────────────────────────
  user: {
    // Expose matricNumber to the session so the client can read it
    additionalFields: {
      matricNumber: {
        type:     'string',
        required: false,
        input:    true,           // allow setting on sign-up
      },
      role: {
        type:     'string',
        required: false,
        input:    false,          // server-only — never from client
        defaultValue: 'STUDENT',
      },
    },
  },

  // ── Plugins ───────────────────────────────────────────
  plugins: [
    // Passkey (WebAuthn) — shown in sign-in page
    // passkey(),

    // SvelteKit cookie helper — must be last
    // Ensures Set-Cookie works correctly in server actions & load functions
    sveltekitCookies(getRequestEvent),
  ],

  // ── Trusted origins ───────────────────────────────────
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? 'http://localhost:5173',
  ],
});

// Re-export inferred types for use throughout the app
export type Auth    = typeof auth;
export type Session = typeof auth.$Infer.Session;