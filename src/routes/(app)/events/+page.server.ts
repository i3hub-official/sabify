// src/routes/(app)/events/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  // Stub — add Event model to schema then replace with real queries
  return {
    events: [
      { id: '1', title: 'CEET Faculty Career Fair 2025', date: '2025-05-12T10:00:00Z', venue: 'CEET Auditorium', organizer: 'CEET SUG', category: 'CAREER', description: 'Connect with leading engineering firms.', rsvp: 124 },
      { id: '2', title: 'CPE 400L Final Exam Timetable Release', date: '2025-04-28T08:00:00Z', venue: 'Online', organizer: 'Exams Office', category: 'ACADEMIC', description: 'Official exam timetable for all 400L courses.', rsvp: 0 },
      { id: '3', title: 'Cultural Day — MOUAU 2025', date: '2025-05-20T09:00:00Z', venue: 'Main Campus', organizer: 'Student Union', category: 'SOCIAL', description: 'Annual cultural celebration.', rsvp: 512 },
    ],
    user: locals.user,
  };
};