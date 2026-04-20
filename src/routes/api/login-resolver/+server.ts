import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
  let body: { identifier?: string };
  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid JSON body');
  }

  const identifier = body.identifier?.trim();
  if (!identifier) throw error(400, 'identifier is required');

  // Determine type
  const isEmail = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(identifier);
  const isPhone = /^[\+]?[\d\s\-().]{7,15}$/.test(identifier);

  let user: { email: string } | null = null;

  try {
    if (isEmail) {
      // Direct email lookup — just return it (Better-Auth handles the rest)
      user = { email: identifier.toLowerCase() };
    } else if (isPhone) {
      // TODO: look up phone in your users table
      // user = await db.query.users.findFirst({
      //   where: (u, { eq }) => eq(u.phone, identifier),
      //   columns: { email: true },
      // });
      throw error(422, 'Phone sign-in is not yet supported');
    } else {
      // Username lookup
      // TODO: look up username in your users table
      // user = await db.query.users.findFirst({
      //   where: (u, { eq }) => eq(u.username, identifier),
      //   columns: { email: true },
      // });
      throw error(422, 'Username sign-in is not yet supported');
    }
  } catch (e) {
    // Re-throw SvelteKit errors as-is
    if (e && typeof e === 'object' && 'status' in e) throw e;
    console.error('[login-resolver]', e);
    throw error(500, 'Internal error resolving account');
  }

  if (!user) throw error(404, 'Account not found');

  return json({ email: user.email });
};