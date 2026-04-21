// src/routes/(app)/past-questions/[id]/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
  const userId = locals.user!.id;

  const doc = await prisma.vaultDocument.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      course: { include: { department: { include: { college: true } } } },
      uploader: { select: { name: true } },
    },
  });

  if (!doc) throw error(404, 'Document not found');

  const [pinned, submission] = await Promise.all([
    prisma.pinnedDocument.findUnique({ where: { userId_documentId: { userId, documentId: doc.id } } }),
    prisma.submission.findUnique({ where: { userId_documentId: { userId, documentId: doc.id } } }),
  ]);

  // Increment download count
  await prisma.vaultDocument.update({ where: { id: doc.id }, data: { downloadCount: { increment: 1 } } });

  return { doc, pinned: !!pinned, submission };
};

export const actions: Actions = {
  pin: async ({ params, locals }) => {
    const userId     = locals.user!.id;
    const documentId = parseInt(params.id);
    const existing   = await prisma.pinnedDocument.findUnique({ where: { userId_documentId: { userId, documentId } } });
    if (existing) {
      await prisma.pinnedDocument.delete({ where: { userId_documentId: { userId, documentId } } });
    } else {
      await prisma.pinnedDocument.create({ data: { userId, documentId } });
    }
    return { success: true };
  },

  submit: async ({ params, locals, request }) => {
    const userId     = locals.user!.id;
    const documentId = parseInt(params.id);
    const form       = await request.formData();
    const note       = (form.get('note') as string) ?? '';
    await prisma.submission.upsert({
      where:  { userId_documentId: { userId, documentId } },
      update: { status: 'SUBMITTED', submittedAt: new Date(), note },
      create: { userId, documentId, status: 'SUBMITTED', submittedAt: new Date(), note },
    });
    return { success: true };
  },
};