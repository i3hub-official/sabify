// src/routes/(app)/verify-receipt/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params }) => {
  const ref = decodeURIComponent(params.id);

  const payment = await prisma.payment.findUnique({
    where: { reference: ref },
    include: {
      due: { include: { department: true } },
      user: { select: { name: true, matricNumber: true, email: true } },
    },
  });

  if (!payment) {
    return { status: 'NOT_FOUND' as const, ref, payment: null };
  }

  if (payment.status !== 'SUCCESS') {
    return { status: 'INVALID' as const, ref, payment };
  }

  return { status: 'VALID' as const, ref, payment };
};