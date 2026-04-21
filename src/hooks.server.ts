// src/hooks.server.ts

import { auth } from '../auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';

const betterAuthHandle: Handle = ({ event, resolve }) =>
  svelteKitHandler({ event, resolve, auth, building });

const sessionHandle: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({
    headers: event.request.headers
  });

  event.locals.user = session?.user ?? null;
  event.locals.session = session?.session ?? null;

  return resolve(event);
};

const authGuard: Handle = async ({ event, resolve }) => {
  const pub = [
    '/',
    '/signin',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-otp'
  ];

  const pathname = event.url.pathname;

  const isPublic =
    pub.includes(pathname) ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/location');

  if (!isPublic && !event.locals.user) {
    throw redirect(303, '/signin');
  }

  return resolve(event);
};

export const handle = sequence(
  betterAuthHandle,
  sessionHandle,
  authGuard
);