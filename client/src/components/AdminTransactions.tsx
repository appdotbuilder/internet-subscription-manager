
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Transaction, Subscription, Package, Member } from '../../../server/src/schema';

interface AdminTransactionsProps {
  transactions: Transaction[];
  subscriptions: Subscription[];
  packages: Package[];
  members: Member[];
  onRefresh: () => void;
}

export function AdminTransactions({ transactions, subscriptions, packages, members, onRefresh }: AdminTransactionsProps) {
  // Helper functions to get related data
  const getSubscriptionById = (id: number) => subscriptions.find((sub: Subscription) => sub.id === id);
  const getPackageById = (id: number) => packages.find((pkg: Package) => pkg.id === id);
  const getMemberById = (id: number) => members.find((member: Member) => member.id === id);

  const getPaymentStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getTotalRevenue = () => {
    return transactions
      .filter((transaction: Transaction) => transaction.payment_status.toLowerCase() === 'paid')
      .reduce((total: number, transaction: Transaction) => total + transaction.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Total Transactions: {transactions.length}</h3>
          <div className="flex gap-4 text-sm text-gray-600 mt-1">
            <span>✅ Paid: {transactions.filter((t: Transaction) => t.payment_status.toLowerCase() === 'paid').length}</span>
            <span>⏳ Pending: {transactions.filter((t: Transaction) => t.payment_status.toLowerCase() === 'pending').length}</span>
            <span>❌ Failed: {transactions.filter((t: Transaction) => t.payment_status.toLowerCase() === 'failed').length}</span>
          </div>
          <div className="text-lg font-bold text-green-600 mt-2">
            💰 Total Revenue: ${getTotalRevenue().toFixed(2)}
          </div>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          🔄 Refresh
        </Button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💳</div>
          <p className="text-gray-500 text-lg">No transactions found.</p>
          <p className="text-gray-400">Transactions will appear here when users create subscriptions.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {transactions.map((transaction: Transaction) => {
            const subscriptionData = getSubscriptionById(transaction.subscription_id);
            const packageData = subscriptionData ? getPackageById(subscriptionData.package_id) : null;
            const memberData = subscriptionData ? getMemberById(subscriptionData.member_id) : null;

            return (
              <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getPaymentStatusIcon(transaction.payment_status)}</span>
                      <div>
                        <div className="text-lg">Transaction #{transaction.id}</div>
                        <div className="text-sm text-gray-600 font-normal">
                          {memberData ? `👤 ${memberData.full_name}` : 'Unknown Member'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-2xl font-bold text-green-600">
                        ${transaction.amount.toFixed(2)}
                      </div>
                      <Badge variant={getPaymentStatusVariant(transaction.payment_status)}>
                        {transaction.payment_status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Subscription Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      📋 Subscription Details
                    </h4>
                    {subscriptionData ? (
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span>Subscription #{subscriptionData.id}</span>
                          <Badge variant={subscriptionData.status === 'active' ? 'default' : 'secondary'}>
                            {subscriptionData.status}
                          </Badge>
                        </div>
                        <div className="text-gray-600">
                          📅 {subscriptionData.start_date.toLocaleDateString()} - {subscriptionData.end_date.toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Subscription not found (ID: {transaction.subscription_id})</p>
                    )}
                  </div>

                  {/* Package Information */}
                  <div className="bg-blue-50 rounded-lg p-4">
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
                      <p className="text-gray-500 text-sm">Package information not available</p>
                    )}
                  </div>

                  {/* Member Information */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      👤 Customer Details
                    </h4>
                    {memberData ? (
                      <div className="space-y-1 text-sm">
                        <div className="font-medium">{memberData.full_name}</div>
                        <div className="text-gray-600">📧 {memberData.email}</div>
                        <div className="text-gray-600">📞 {memberData.phone_number}</div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Customer information not available</p>
                    )}
                  </div>

                  {/* Transaction Date */}
                  <div className="text-sm">
                    <div className="font-medium text-gray-700">📅 Transaction Date</div>
                    <div className="text-gray-600">
                      {transaction.transaction_date.toLocaleDateString()} at {transaction.transaction_date.toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 pt-2 border-t">
                    Created: {transaction.created_at.toLocaleDateString()} at {transaction.created_at.toLocaleTimeString()}
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
