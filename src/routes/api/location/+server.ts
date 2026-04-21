// src/routes/api/location/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

// POST — store a user's location update (safe-walk broadcasting)
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const { lat, lng, accuracy } = await request.json();
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  // Store in a lightweight ephemeral cache or dedicated table.
  // For now we log and return — expand when Location model is added to schema.
  console.log(`[location] ${locals.user.id} → ${lat}, ${lng} ±${accuracy}m`);

  return json({ ok: true, lat, lng });
};

// GET — fetch campus alert status (used by dashboard Shield card)
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const latest = await prisma.safetyAlert.findFirst({
    orderBy: { sentAt: 'desc' },
    select: { id: true, title: true, severity: true, sentAt: true },
  });

  return json({
    alert: latest ?? null,
    campusQuiet: !latest || latest.severity !== 'URGENT',
  });
};