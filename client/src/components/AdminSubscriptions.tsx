
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Subscription, Package, Member } from '../../../server/src/schema';

interface AdminSubscriptionsProps {
  subscriptions: Subscription[];
  packages: Package[];
  members: Member[];
  onRefresh: () => void;
}

export function AdminSubscriptions({ subscriptions, packages, members, onRefresh }: AdminSubscriptionsProps) {
  // Helper functions to get related data
  const getPackageById = (id: number) => packages.find((pkg: Package) => pkg.id === id);
  const getMemberById = (id: number) => members.find((member: Member) => member.id === id);

  const getStatusIcon = (status: string) => {
    return status === 'active' ? '✅' : '❌';
  };

  const getStatusVariant = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  const isExpiringSoon = (endDate: Date) => {
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Total Subscriptions: {subscriptions.length}</h3>
          <div className="flex gap-4 text-sm text-gray-600 mt-1">
            <span>✅ Active: {subscriptions.filter((sub: Subscription) => sub.status === 'active').length}</span>
            <span>❌ Expired: {subscriptions.filter((sub: Subscription) => sub.status === 'expired').length}</span>
          </div>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          🔄 Refresh
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg">No subscriptions found.</p>
          <p className="text-gray-400">Subscriptions will appear here when users subscribe to packages.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map((subscription: Subscription) => {
            const packageData = getPackageById(subscription.package_id);
            const memberData = getMemberById(subscription.member_id);
            const expiringSoon = isExpiringSoon(subscription.end_date);

            return (
              <Card key={subscription.id} className={`hover:shadow-lg transition-shadow ${expiringSoon ? 'border-yellow-400' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getStatusIcon(subscription.status)}</span>
                      <div>
                        <div className="text-lg">Subscription #{subscription.id}</div>
                        <div className="text-sm text-gray-600 font-normal">
                          {memberData ? `👤 ${memberData.full_name}` : `Member ID: ${subscription.member_id}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={getStatusVariant(subscription.status)}>
                        {subscription.status.toUpperCase()}
                      </Badge>
                      {expiringSoon && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-400">
                          ⚠️ Expires Soon
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Package Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      📦 Package Details
                    </h4>
                    {packageData ? (
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{packageData.name}</span>
                          <Badge variant="outline">${packageData.price.toFixed(2)}/month</Badge>
                        </div>
                        <div className="text-gray-600">⚡ {packageData.speed}</div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Package not found (ID: {subscription.package_id})</p>
                    )}
                  </div>

                  {/* Member Information */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      👤 Member Details
                    </h4>
                    {memberData ? (
                      <div className="space-y-1 text-sm">
                        <div className="font-medium">{memberData.full_name}</div>
                        <div className="text-gray-600">📧 {memberData.email}</div>
                        <div className="text-gray-600">📞 {memberData.phone_number}</div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Member not found (ID: {subscription.member_id})</p>
                    )}
                  </div>

                  {/* Subscription Dates */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-700">📅 Start Date</div>
                      <div className="text-gray-600">{subscription.start_date.toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">📅 End Date</div>
                      <div className={`${subscription.status === 'expired' ? 'text-red-600' : expiringSoon ? 'text-yellow-600' : 'text-gray-600'}`}>
                        {subscription.end_date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 pt-2 border-t">
                    Created: {subscription.created_at.toLocaleDateString()} at {subscription.created_at.toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
