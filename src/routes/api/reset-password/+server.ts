import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request }) => {
  let body: { token?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid JSON body');
  }

  const { token, password } = body;

  if (!token)    throw error(400, 'Reset token is required');
  if (!password) throw error(400, 'New password is required');
  if (password.length < 8) throw error(422, 'Password must be at least 8 characters');

  try {
    // Better-Auth: reset password with the token from the email link
    await auth.api.resetPassword({
      body: { token, newPassword: password },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Reset failed';

    // Surface specific Better-Auth errors the UI can act on
    if (msg.toLowerCase().includes('expired'))
      throw error(410, 'Reset link has expired. Please request a new one.');
    if (msg.toLowerCase().includes('invalid'))
      throw error(400, 'Invalid reset link. Please request a new one.');

    console.error('[reset-password]', e);
    throw error(500, 'Something went wrong. Please try again.');
  }

  return json({ success: true });
};