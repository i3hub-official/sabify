// src/routes/(app)/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user!.id;

  const [
    pinnedDocs,
    recentUploads,
    upcomingEvents,
    pendingDues,
    cgpaEntries,
    latestAlert,
  ] = await Promise.all([
    prisma.pinnedDocument.findMany({
      where: { userId },
      include: { document: { include: { course: true } } },
      orderBy: { pinnedAt: 'desc' },
      take: 5,
    }),
    prisma.vaultDocument.findMany({
      where: {
        course: {
          department: { students: { some: { id: userId } } },
        },
      },
      include: { course: true },
      orderBy: { uploadedAt: 'desc' },
      take: 6,
    }),
    // Events stub — expand when events table is added
    Promise.resolve([]),
    prisma.payment.findMany({
      where: { userId, status: 'PENDING' },
      include: { due: true },
      take: 3,
    }),
    prisma.cgpaEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.safetyAlert.findFirst({
      orderBy: { sentAt: 'desc' },
    }),
  ]);

  // Compute CGPA
  let cgpa: number | null = null;
  if (cgpaEntries.length > 0) {
    const totalUnits  = cgpaEntries.reduce((s, e) => s + e.creditUnits, 0);
    const totalPoints = cgpaEntries.reduce((s, e) => s + e.creditUnits * e.gradePoints, 0);
    cgpa = totalUnits > 0 ? Math.round((totalPoints / totalUnits) * 100) / 100 : null;
  }

  return {
    pinnedDocs,
    recentUploads,
    upcomingEvents,
    pendingDues,
    cgpa,
    latestAlert,
    user: locals.user,
  };
};