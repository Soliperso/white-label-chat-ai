import { http, HttpResponse } from 'msw';
import { db, generateId } from '../db';
import type { InviteTeamMemberDto, UpdateTeamMemberDto, TeamMember } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const teamHandlers = [
  // GET /api/team - Get all team members
  http.get(`${API_URL}/api/team`, () => {
    console.log('[MSW] GET /api/team - Fetching team members');
    return HttpResponse.json(db.teamMembers);
  }),

  // POST /api/team/invite - Invite new team member
  http.post(`${API_URL}/api/team/invite`, async ({ request }) => {
    console.log('[MSW] POST /api/team/invite - Inviting team member');
    const dto = (await request.json()) as InviteTeamMemberDto;

    // Check if email already exists
    const existingMember = db.teamMembers.find((m) => m.email === dto.email);
    if (existingMember) {
      return HttpResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const newMember: TeamMember = {
      id: generateId('member'),
      email: dto.email,
      name: dto.name,
      role: dto.role,
      status: 'pending',
      organizationId: 'org-1',
      createdAt: new Date().toISOString(),
    };

    db.teamMembers.push(newMember);
    console.log('[MSW] Created new team member:', newMember);

    return HttpResponse.json(newMember, { status: 201 });
  }),

  // PATCH /api/team/:id - Update team member
  http.patch(`${API_URL}/api/team/:id`, async ({ params, request }) => {
    const { id } = params;
    console.log(`[MSW] PATCH /api/team/${id} - Updating team member`);

    const dto = (await request.json()) as UpdateTeamMemberDto;
    const memberIndex = db.teamMembers.findIndex((m) => m.id === id);

    if (memberIndex === -1) {
      return HttpResponse.json({ message: 'Team member not found' }, { status: 404 });
    }

    db.teamMembers[memberIndex] = {
      ...db.teamMembers[memberIndex],
      ...dto,
    };

    console.log('[MSW] Updated team member:', db.teamMembers[memberIndex]);
    return HttpResponse.json(db.teamMembers[memberIndex]);
  }),

  // DELETE /api/team/:id - Remove team member
  http.delete(`${API_URL}/api/team/:id`, ({ params }) => {
    const { id } = params;
    console.log(`[MSW] DELETE /api/team/${id} - Removing team member`);

    const memberIndex = db.teamMembers.findIndex((m) => m.id === id);

    if (memberIndex === -1) {
      return HttpResponse.json({ message: 'Team member not found' }, { status: 404 });
    }

    db.teamMembers.splice(memberIndex, 1);
    console.log('[MSW] Removed team member');

    return HttpResponse.json({ message: 'Team member removed successfully' });
  }),

  // POST /api/team/:id/resend-invite - Resend invitation
  http.post(`${API_URL}/api/team/:id/resend-invite`, ({ params }) => {
    const { id } = params;
    console.log(`[MSW] POST /api/team/${id}/resend-invite - Resending invitation`);

    const member = db.teamMembers.find((m) => m.id === id);

    if (!member) {
      return HttpResponse.json({ message: 'Team member not found' }, { status: 404 });
    }

    if (member.status !== 'pending') {
      return HttpResponse.json(
        { message: 'Can only resend invitations to pending members' },
        { status: 400 }
      );
    }

    console.log('[MSW] Invitation resent to:', member.email);
    return HttpResponse.json({ message: 'Invitation resent successfully' });
  }),
];
