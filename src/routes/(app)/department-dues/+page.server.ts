// src/routes/(app)/department-dues/+page.server.ts
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
  const student = await prisma.user.findUnique({
    where: { id: locals.user!.id },
    include: { department: true },
  });

  const [dues, payments] = await Promise.all([
    prisma.departmentalDue.findMany({
      where: { departmentId: student?.departmentId ?? undefined, isActive: true },
      include: { payments: { where: { userId: locals.user!.id } } },
      orderBy: { deadline: 'asc' },
    }),
    prisma.payment.findMany({
      where: { userId: locals.user!.id },
      include: { due: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return { dues, payments, department: student?.department };
};