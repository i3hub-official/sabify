// src/routes/(app)/past-questions/+page.server.ts
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = locals.user!;
  const category  = url.searchParams.get('category') ?? 'TEST';
  const courseId  = url.searchParams.get('course')   ?? '';
  const search    = url.searchParams.get('q')        ?? '';

  // Get user's department for default filtering
  const student = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      department: {
        include: {
          college: { include: { university: true } },
          courses: true,
        },
      },
    },
  });

  const where: Record<string, unknown> = {
    category: category as 'TEST' | 'ASSIGNMENT' | 'TEXTBOOK',
    ...(courseId ? { courseId } : {
      course: {
        departmentId: student?.departmentId ?? undefined,
      },
    }),
    ...(search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { ocrText: { contains: search, mode: 'insensitive' } },
      ],
    } : {}),
  };

  const [documents, courses] = await Promise.all([
    prisma.vaultDocument.findMany({
      where,
      include: { course: true, uploader: { select: { name: true } } },
      orderBy: { uploadedAt: 'desc' },
      take: 40,
    }),
    prisma.course.findMany({
      where: { departmentId: student?.departmentId ?? undefined },
      orderBy: { code: 'asc' },
    }),
  ]);

  return { documents, courses, department: student?.department, category, courseId, search };
};