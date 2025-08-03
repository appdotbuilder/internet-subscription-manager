
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { Member, CreateMemberInput, UpdateMemberInput } from '../../../server/src/schema';

interface AdminMembersProps {
  members: Member[];
  onRefresh: () => void;
}

export function AdminMembers({ members, onRefresh }: AdminMembersProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [createFormData, setCreateFormData] = useState<CreateMemberInput>({
    full_name: '',
    address: '',
    phone_number: '',
    email: '',
    username: '',
    password: ''
  });

  const [editFormData, setEditFormData] = useState<UpdateMemberInput>({
    id: 0,
    full_name: '',
    address: '',
    phone_number: '',
    email: '',
    username: '',
    password: ''
  });

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await trpc.createMember.mutate(createFormData);
      setCreateFormData({
        full_name: '',
        address: '',
        phone_number: '',
        email: '',
        username: '',
        password: ''
      });
      setIsCreateDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to create member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await trpc.updateMember.mutate(editFormData);
      setEditFormData({
        id: 0,
        full_name: '',
        address: '',
        phone_number: '',
        email: '',
        username: '',
        password: ''
      });
      setIsEditDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to update member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async (id: number) => {
    setIsLoading(true);
    try {
      await trpc.deleteMember.mutate({ id });
      onRefresh();
    } catch (error) {
      console.error('Failed to delete member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (member: Member) => {
    setEditFormData({
      id: member.id,
      full_name: member.full_name,
      address: member.address,
      phone_number: member.phone_number,
      email: member.email,
      username: member.username,
      password: '' // Don't populate password for security
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Create Member Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            👥 Add New Member
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Member</DialogTitle>
            <DialogDescription>
              Add a new customer to the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateMember} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-name">Full Name</Label>
                <Input
                  id="create-name"
                  placeholder="John Doe"
                  value={createFormData.full_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateFormData((prev: CreateMemberInput) => ({ ...prev, full_name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="create-phone">Phone Number</Label>
                <Input
                  id="create-phone"
                  placeholder="+1234567890"
                  value={createFormData.phone_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateFormData((prev: CreateMemberInput) => ({ ...prev, phone_number: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="create-address">Address</Label>
              <Textarea
                id="create-address"
                placeholder="123 Main Street, City, State"
                value={createFormData.address}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setCreateFormData((prev: CreateMemberInput) => ({ ...prev, address: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  placeholder="john@example.com"
                  value={createFormData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateFormData((prev: CreateMemberInput) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="create-username">Username</Label>
                <Input
                  id="create-username"
                  placeholder="johndoe"
                  value={createFormData.username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateFormData((prev: CreateMemberInput) => ({ ...prev, username: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="create-password">Password</Label>
              <Input
                id="create-password"
                type="password"
                placeholder="Minimum 6 characters"
                value={createFormData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreateMemberInput) => ({ ...prev, password: e.target.value }))
                }
                minLength={6}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update member information. Leave password empty to keep unchanged.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditMember} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.full_name || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateMemberInput) => ({ ...prev, full_name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone_number || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateMemberInput) => ({ ...prev, phone_number: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={editFormData.address || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditFormData((prev: UpdateMemberInput) => ({ ...prev, address: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateMemberInput) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editFormData.username || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateMemberInput) => ({ ...prev, username: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-password">Password</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Leave empty to keep current password"
                value={editFormData.password || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateMemberInput) => ({ ...prev, password: e.target.value || undefined }))
                }
                minLength={6}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Members List */}
      {members.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-gray-500 text-lg">No members registered yet.</p>
          <p className="text-gray-400">Add your first customer above!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member: Member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    👤 {member.full_name}
                  </span>
                  <Badge variant="outline">
                    ID: {member.id}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500">📧</span>
                    <span className="break-all">{member.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500">📞</span>
                    <span>{member.phone_number}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500">🏠</span>
                    <span className="text-gray-600">{member.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">🔑</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {member.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>📅</span>
                    <span>Joined: {member.created_at.toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(member)}
                    className="flex-1"
                  >
                    ✏️ Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex-1">
                        🗑️ Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{member.full_name}"? This will also delete all their subscriptions and transactions. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteMember(member.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
