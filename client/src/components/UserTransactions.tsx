
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Transaction } from '../../../server/src/schema';

interface UserTransactionsProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

export function UserTransactions({ transactions, onRefresh }: UserTransactionsProps) {
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

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTotalSpent = () => {
    return transactions
      .filter((transaction: Transaction) => transaction.payment_status.toLowerCase() === 'paid')
      .reduce((total: number, transaction: Transaction) => total + transaction.amount, 0);
  };

  const sortedTransactions = [...transactions].sort((a: Transaction, b: Transaction) => 
    new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Your Transaction History</h3>
          <div className="flex gap-4 text-sm text-gray-600 mt-1">
            <span>📋 Total: {transactions.length}</span>
            <span>✅ Paid: {transactions.filter((t: Transaction) => t.payment_status.toLowerCase() === 'paid').length}</span>
            <span>⏳ Pending: {transactions.filter((t: Transaction) => t.payment_status.toLowerCase() === 'pending').length}</span>
          </div>
          {getTotalSpent() > 0 && (
            <div className="text-lg font-bold text-green-600 mt-2">
              💰 Total Spent: ${getTotalSpent().toFixed(2)}
            </div>
          )}
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          🔄 Refresh
        </Button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💳</div>
          <p className="text-gray-500 text-lg">No transactions yet.</p>
          <p className="text-gray-400">Your payment history will appear here after you subscribe to a package.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedTransactions.map((transaction: Transaction, index: number) => (
            <Card key={transaction.id} className={`hover:shadow-lg transition-shadow ${index === 0 ? 'border-blue-200' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPaymentStatusIcon(transaction.payment_status)}</span>
                    <div>
                      <div className="text-lg">Transaction #{transaction.id}</div>
                      <div className="text-sm text-gray-600 font-normal">
                        Subscription #{transaction.subscription_id}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`text-2xl font-bold ${getPaymentStatusColor(transaction.payment_status)}`}>
                      ${transaction.amount.toFixed(2)}
                    </div>
                    <Badge variant={getPaymentStatusVariant(transaction.payment_status)}>
                      {transaction.payment_status.toUpperCase()}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Transaction Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    📋 Transaction Details
                  </h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction Date:</span>
                      <span className="font-medium">
                        {transaction.transaction_date.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction Time:</span>
                      <span className="font-medium">
                        {transaction.transaction_date.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-green-600">
                        ${transaction.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={getPaymentStatusVariant(transaction.payment_status)}>
                        {getPaymentStatusIcon(transaction.payment_status)} {transaction.payment_status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Payment Status Information */}
                <div className={`rounded-lg p-4 ${
                  transaction.payment_status.toLowerCase() === 'paid' ? 'bg-green-50 border border-green-200' :
                  transaction.payment_status.toLowerCase() === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getPaymentStatusIcon(transaction.payment_status)}</span>
                    <span className="font-semibold">
                      {transaction.payment_status.toLowerCase() === 'paid' && 'Payment Successful'}
                      {transaction.payment_status.toLowerCase() === 'pending' && 'Payment Pending'}
                      {transaction.payment_status.toLowerCase() === 'failed' && 'Payment Failed'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {transaction.payment_status.toLowerCase() === 'paid' && 
                      'Your payment has been processed successfully. Your subscription is now active.'}
                    {transaction.payment_status.toLowerCase() === 'pending' && 
                      'Your payment is being processed. This may take a few minutes to complete.'}
                    {transaction.payment_status.toLowerCase() === 'failed' && 
                      'Your payment could not be processed. Please contact support or try again.'}
                  </p>
                </div>

                {/* Service Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    🌐 Service Information
                  </h4>
                  <div className="text-sm text-gray-700">
                    <p>This payment is for your internet subscription service.</p>
                    <p className="mt-1">Subscription ID: #{transaction.subscription_id}</p>
                    <p>Service Period: 30 days from activation</p>
                  </div>
                </div>

                <div className="text-xs text-gray-400 pt-2 border-t">
                  Record created: {transaction.created_at.toLocaleDateString()} at {transaction.created_at.toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          💡 Payment Status Guide
        </h3>
        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-500">✅</span>
            <div>
              <div className="font-medium">Paid</div>
              <div className="text-gray-600">Payment successful, service active</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-500">⏳</span>
            <div>
              <div className="font-medium">Pending</div>
              <div className="text-gray-600">Payment processing, please wait</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <div>
              <div className="font-medium">Failed</div>
              <div className="text-gray-600">Payment failed, contact support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
