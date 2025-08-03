
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { Package, Member, CreateSubscriptionInput } from '../../../server/src/schema';

interface UserSubscriptionProps {
  packages: Package[];
  currentUser: Member;
  onSuccess: () => void;
}

export function UserSubscription({ packages, currentUser, onSuccess }: UserSubscriptionProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedPackage = packages.find((pkg: Package) => pkg.id === parseInt(selectedPackageId));

  const handleSubscribe = async () => {
    if (!selectedPackage) return;

    setIsLoading(true);
    try {
      const subscriptionData: CreateSubscriptionInput = {
        member_id: currentUser.id,
        package_id: selectedPackage.id
      };

      await trpc.createSubscription.mutate(subscriptionData);
      setSelectedPackageId('');
      onSuccess();
    } catch (error) {
      console.error('Failed to create subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEndDate = () => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30); // 30 days active duration
    return endDate;
  };

  const getSpeedIcon = (speed: string) => {
    const speedNum = parseInt(speed);
    if (speedNum >= 100) return '🚀';
    if (speedNum >= 50) return '⚡';
    if (speedNum >= 25) return '🌟';
    return '📡';
  };

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          👤 Your Account Information
        </h3>
        <div className="grid gap-2 md:grid-cols-2 text-sm">
          <div><span className="font-medium">Name:</span> {currentUser.full_name}</div>
          <div><span className="font-medium">Email:</span> {currentUser.email}</div>
          <div><span className="font-medium">Phone:</span> {currentUser.phone_number}</div>
          <div><span className="font-medium">Address:</span> {currentUser.address}</div>
        </div>
      </div>

      {/* Package Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📦 Select Package
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an internet package..." />
              </SelectTrigger>
              <SelectContent>
                {packages.map((pkg: Package) => (
                  <SelectItem key={pkg.id} value={pkg.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{getSpeedIcon(pkg.speed)}</span>
                      <span>{pkg.name}</span>
                      <span className="text-gray-500">-</span>
                      <span>{pkg.speed}</span>
                      <span className="text-gray-500">-</span>
                      <span className="font-semibold">${pkg.price.toFixed(2)}/month</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Package Preview */}
          {selectedPackage && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getSpeedIcon(selectedPackage.speed)} {selectedPackage.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex justify-between items-center">
                    <span>💨 Speed:</span>
                    <Badge variant="outline" className="font-bold">
                      {selectedPackage.speed}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>💰 Monthly Price:</span>
                    <Badge className="bg-green-600">
                      ${selectedPackage.price.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>⏱️ Duration:</span>
                    <span className="font-medium">30 days</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm">📅 Subscription Timeline</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">{calculateEndDate().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    💳 Payment Summary
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Package Price:</span>
                      <span>${selectedPackage.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>30 days</span>
                    </div>
                    <div className="border-t pt-1 mt-2 flex justify-between font-bold">
                      <span>Total Amount:</span>
                      <span className="text-green-600">${selectedPackage.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? '⏳ Processing...' : '✨ Subscribe Now'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Subscription</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to subscribe to "{selectedPackage.name}" for ${selectedPackage.price.toFixed(2)}? 
                        Your subscription will be active for 30 days starting today.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubscribe}>
                        Confirm Subscription
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          ℹ️ Subscription Terms
        </h3>
        <div className="grid gap-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span className="text-blue-500">📋</span>
            <div>
              <div className="font-medium">Automatic Activation</div>
              <div>Your subscription starts immediately upon confirmation</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500">💳</span>
            <div>
              <div className="font-medium">Payment Processing</div>
              <div>A transaction record will be created for your payment</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-500">⏰</span>
            <div>
              <div className="font-medium">30-Day Period</div>
              <div>All packages include a fixed 30-day subscription period</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-500">🔄</span>
            <div>
              <div className="font-medium">Renewal</div>
              <div>You can renew your subscription before it expires</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
