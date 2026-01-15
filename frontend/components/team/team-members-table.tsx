'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  Shield,
  Eye,
  UserCog,
  Trash2,
  Mail,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUpdateTeamMember, useDeleteTeamMember, useResendInvitation } from '@/hooks/use-team';
import type { TeamMember } from '@/types';

interface TeamMembersTableProps {
  members: TeamMember[];
  isLoading: boolean;
}

export function TeamMembersTable({ members, isLoading }: TeamMembersTableProps) {
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const { mutateAsync: updateMember } = useUpdateTeamMember();
  const { mutateAsync: deleteMember } = useDeleteTeamMember();
  const { mutateAsync: resendInvitation } = useResendInvitation();

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'manager' | 'viewer') => {
    try {
      await updateMember({ id: memberId, role: newRole });
      toast.success('Role updated successfully');
    } catch (error) {
      toast.error('Failed to update role');
      console.error('Error updating role:', error);
    }
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;

    try {
      await deleteMember(memberToDelete.id);
      toast.success('Team member removed');
      setMemberToDelete(null);
    } catch (error) {
      toast.error('Failed to remove team member');
      console.error('Error deleting member:', error);
    }
  };

  const handleResendInvite = async (memberId: string, email: string) => {
    try {
      await resendInvitation(memberId);
      toast.success(`Invitation resent to ${email}`);
    } catch (error) {
      toast.error('Failed to resend invitation');
      console.error('Error resending invitation:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'manager':
        return <UserCog className="h-4 w-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      admin: 'default',
      manager: 'secondary',
      viewer: 'outline',
    };

    const getBadgeClassName = (role: string) => {
      if (role === 'admin') {
        return 'text-white bg-gradient-to-r from-[#1976D2] to-[#2196F3] hover:from-[#1565C0] hover:to-[#1976D2] dark:from-[#1976D2] dark:to-[#1565C0] font-semibold shadow-md border-[#1976D2] ring-2 ring-[#2196F3]/20';
      }
      if (role === 'manager') {
        return 'bg-[#2196F3] text-white hover:bg-[#1976D2] dark:bg-[#1976D2] dark:hover:bg-[#1565C0] font-medium shadow-sm';
      }
      return '';
    };

    return (
      <Badge
        variant={variants[role] || 'outline'}
        className={`capitalize ${getBadgeClassName(role)}`}
      >
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="gap-1 border-[#4CAF50]/50 text-[#2E7D32] dark:text-[#66BB6A] bg-[#E8F5E9] dark:bg-[#1B5E20]/30">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1 bg-[#FFF3E0] text-[#E65100] hover:bg-[#FFE0B2] dark:bg-[#E65100]/20 dark:text-[#FFB74D] dark:hover:bg-[#E65100]/30 border-[#FFB74D] dark:border-[#E65100] font-medium shadow-sm">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="destructive" className="gap-1 bg-[#F44336] text-white hover:bg-[#D32F2F] dark:bg-[#D32F2F] dark:hover:bg-[#B71C1C] shadow-sm">
            <XCircle className="h-3 w-3" />
            Inactive
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-16 bg-muted animate-pulse rounded" />
        <div className="h-16 bg-muted animate-pulse rounded" />
        <div className="h-16 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No team members yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started by inviting your first team member.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(member.role)}
                    <span className="font-medium">{member.firstName} {member.lastName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{member.email}</TableCell>
                <TableCell>{getRoleBadge(member.role)}</TableCell>
                <TableCell>{getStatusBadge(member.status)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(member.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {member.status === 'pending' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleResendInvite(member.id, member.email)}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Resend Invitation
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}

                      <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'admin')}
                        disabled={member.role === 'admin'}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'manager')}
                        disabled={member.role === 'manager'}
                      >
                        <UserCog className="mr-2 h-4 w-4" />
                        Manager
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'viewer')}
                        disabled={member.role === 'viewer'}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Viewer
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setMemberToDelete(member)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {memberToDelete?.firstName} {memberToDelete?.lastName} from your organization. They will lose
              access to all widgets and data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
