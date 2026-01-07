import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TeamMember, InviteTeamMemberDto, UpdateTeamMemberDto } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Fetch all team members
async function fetchTeamMembers(): Promise<TeamMember[]> {
  const response = await fetch(`${API_URL}/api/team`);
  if (!response.ok) {
    throw new Error('Failed to fetch team members');
  }
  return response.json();
}

// Invite a new team member
async function inviteTeamMember(dto: InviteTeamMemberDto): Promise<TeamMember> {
  const response = await fetch(`${API_URL}/api/team/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to invite team member');
  }
  return response.json();
}

// Update team member
async function updateTeamMember(params: {
  id: string;
  role?: 'admin' | 'manager' | 'viewer';
  status?: 'active' | 'pending' | 'inactive';
}): Promise<TeamMember> {
  const { id, ...dto } = params;
  const response = await fetch(`${API_URL}/api/team/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!response.ok) {
    throw new Error('Failed to update team member');
  }
  return response.json();
}

// Delete team member
async function deleteTeamMember(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/team/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete team member');
  }
}

// Resend invitation
async function resendInvitation(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/team/${id}/resend-invite`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to resend invitation');
  }
}

// Hooks
export function useTeamMembers() {
  return useQuery({
    queryKey: ['team'],
    queryFn: fetchTeamMembers,
  });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

export function useDeleteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resendInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}
