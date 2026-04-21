// ─────────────────────────────────────────────────────────────────
// src/routes/(app)/library/+page.server.ts
// ─────────────────────────────────────────────────────────────────
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
  const userId   = locals.user!.id;
  const category = (url.searchParams.get('category') ?? '') as 'TEST' | 'ASSIGNMENT' | 'TEXTBOOK' | '';
  const search   = url.searchParams.get('q') ?? '';

  const student = await prisma.user.findUnique({
    where: { id: userId },
    include: { department: { include: { courses: true } } },
  });

  const docs = await prisma.vaultDocument.findMany({
    where: {
      ...(category ? { category } : {}),
      course: { departmentId: student?.departmentId ?? undefined },
      ...(search ? { OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { ocrText: { contains: search, mode: 'insensitive' } },
      ] } : {}),
    },
    include: { course: true, uploader: { select: { name: true } } },
    orderBy: { uploadedAt: 'desc' },
    take: 50,
  });

  const courses = student?.department?.courses ?? [];
  return { docs, courses, category, search, department: student?.department };
};

export const actions: Actions = {
  upload: async ({ request, locals }) => {
    const userId  = locals.user!.id;
    const form    = await request.formData();
    const file    = form.get('file') as File | null;
    const title   = form.get('title') as string;
    const courseId = form.get('courseId') as string;
    const category = form.get('category') as 'TEST' | 'ASSIGNMENT' | 'TEXTBOOK';

    if (!file || !title || !courseId || !category) {
      return fail(400, { error: 'All fields are required.' });
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dir    = join('static', 'uploads');
    mkdirSync(dir, { recursive: true });
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    writeFileSync(join(dir, filename), buffer);

    await prisma.vaultDocument.create({
      data: {
        title,
        category,
        courseId,
        uploadedById: userId,
        fileUrl: `/uploads/${filename}`,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    // Award contributor points
    await prisma.user.update({
      where: { id: userId },
      data: {
        contributorPoints: { increment: 25 },
        contributorBadge: true,
      },
    });

    return { success: true };
  },
};