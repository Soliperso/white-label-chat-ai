'use client';

import { useState } from 'react';
import { UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TeamMembersTable } from '@/components/team/team-members-table';
import { InviteTeamMemberDialog } from '@/components/team/invite-team-member-dialog';
import { useTeamMembers } from '@/hooks/use-team';

export function TeamPageClient() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { data: members, isLoading } = useTeamMembers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your team members and their permissions
          </p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)} className="text-white">
          <UserPlus className="h-4 w-4 mr-2 text-white" />
          Invite Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="text-sm font-medium text-muted-foreground">Total Members</div>
          <div className="text-3xl font-bold mt-2">{members?.length || 0}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-medium text-muted-foreground">Active Members</div>
          <div className="text-3xl font-bold mt-2">
            {members?.filter(m => m.status === 'active').length || 0}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-medium text-muted-foreground">Pending Invites</div>
          <div className="text-3xl font-bold mt-2">
            {members?.filter(m => m.status === 'pending').length || 0}
          </div>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card className="p-6">
        <TeamMembersTable members={members || []} isLoading={isLoading} />
      </Card>

      {/* Invite Dialog */}
      <InviteTeamMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
}
