// ─── src/routes/(app)/assignments/+page.server.ts ────────────────
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
  const student = await prisma.user.findUnique({
    where: { id: locals.user!.id },
    include: { department: { include: { courses: true } } },
  });

  const assignments = await prisma.vaultDocument.findMany({
    where: {
      category: 'ASSIGNMENT',
      course: { departmentId: student?.departmentId ?? undefined },
    },
    include: {
      course: true,
      submissions: {
        where: { userId: locals.user!.id },
      },
    },
    orderBy: { uploadedAt: 'desc' },
    take: 40,
  });

  return { assignments };
};