
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { Package, CreatePackageInput, UpdatePackageInput } from '../../../server/src/schema';

interface AdminPackagesProps {
  packages: Package[];
  onRefresh: () => void;
}

export function AdminPackages({ packages, onRefresh }: AdminPackagesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [createFormData, setCreateFormData] = useState<CreatePackageInput>({
    name: '',
    speed: '',
    price: 0
  });

  const [editFormData, setEditFormData] = useState<UpdatePackageInput>({
    id: 0,
    name: '',
    speed: '',
    price: 0
  });

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await trpc.createPackage.mutate(createFormData);
      setCreateFormData({ name: '', speed: '', price: 0 });
      setIsCreateDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to create package:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await trpc.updatePackage.mutate(editFormData);
      setEditFormData({ id: 0, name: '', speed: '', price: 0 });
      setIsEditDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to update package:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePackage = async (id: number) => {
    setIsLoading(true);
    try {
      await trpc.deletePackage.mutate({ id });
      onRefresh();
    } catch (error) {
      console.error('Failed to delete package:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (pkg: Package) => {
    setEditFormData({
      id: pkg.id,
      name: pkg.name,
      speed: pkg.speed,
      price: pkg.price
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Create Package Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            ➕ Add New Package
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Package</DialogTitle>
            <DialogDescription>
              Add a new internet package with speed and pricing details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePackage} className="space-y-4">
            <div>
              <Label htmlFor="create-name">Package Name</Label>
              <Input
                id="create-name"
                placeholder="e.g., Premium Fiber"
                value={createFormData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreatePackageInput) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="create-speed">Speed</Label>
              <Input
                id="create-speed"
                placeholder="e.g., 100 Mbps"
                value={createFormData.speed}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreatePackageInput) => ({ ...prev, speed: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="create-price">Price ($)</Label>
              <Input
                id="create-price"
                type="number"
                placeholder="29.99"
                step="0.01"
                min="0"
                value={createFormData.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreatePackageInput) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
                }
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Package'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Package Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>
              Update the package details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPackage} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Package Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdatePackageInput) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-speed">Speed</Label>
              <Input
                id="edit-speed"
                value={editFormData.speed || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdatePackageInput) => ({ ...prev, speed: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Price ($)</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                value={editFormData.price || 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdatePackageInput) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
                }
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Package'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Packages List */}
      {packages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-500 text-lg">No packages available yet.</p>
          <p className="text-gray-400">Create your first internet package above!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg: Package) => (
            <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    🚀 {pkg.name}
                  </span>
                  <Badge variant="secondary">
                    ${pkg.price.toFixed(2)}/month
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <span className="font-semibold text-lg">{pkg.speed}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📅</span>
                    <span>30 days duration</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>📝</span>
                    <span>Created: {pkg.created_at.toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(pkg)}
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
                        <AlertDialogTitle>Delete Package</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{pkg.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeletePackage(pkg.id)}
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
