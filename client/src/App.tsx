
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { AdminPackages } from '@/components/AdminPackages';
import { AdminMembers } from '@/components/AdminMembers';
import { AdminSubscriptions } from '@/components/AdminSubscriptions';
import { AdminTransactions } from '@/components/AdminTransactions';
import { UserPackages } from '@/components/UserPackages';
import { UserTransactions } from '@/components/UserTransactions';
import { UserSubscription } from '@/components/UserSubscription';
// Using type-only imports for better TypeScript compliance
import type { Package, Member, Subscription, Transaction } from '../../server/src/schema';

function App() {
  const [userRole, setUserRole] = useState<'admin' | 'user'>('admin');
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate current user for demonstration purposes
  const simulateUser = useCallback(() => {
    const demoUser: Member = {
      id: 1,
      full_name: 'John Doe',
      address: '123 Main St',
      phone_number: '+1234567890',
      email: 'john@example.com',
      username: 'johndoe',
      password: 'hidden',
      created_at: new Date()
    };
    setCurrentUser(demoUser);
  }, []);

  // Load all data functions
  const loadPackages = useCallback(async () => {
    try {
      const result = await trpc.getPackages.query();
      setPackages(result);
    } catch (error) {
      console.error('Failed to load packages:', error);
    }
  }, []);

  const loadMembers = useCallback(async () => {
    if (userRole !== 'admin') return;
    try {
      const result = await trpc.getMembers.query();
      setMembers(result);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  }, [userRole]);

  const loadSubscriptions = useCallback(async () => {
    if (userRole !== 'admin') return;
    try {
      const result = await trpc.getSubscriptions.query();
      setSubscriptions(result);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    }
  }, [userRole]);

  const loadTransactions = useCallback(async () => {
    if (userRole !== 'admin') return;
    try {
      const result = await trpc.getTransactions.query();
      setTransactions(result);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }, [userRole]);

  const loadUserTransactions = useCallback(async () => {
    if (userRole !== 'user' || !currentUser) return;
    try {
      const result = await trpc.getTransactionsByMember.query({ member_id: currentUser.id });
      setUserTransactions(result);
    } catch (error) {
      console.error('Failed to load user transactions:', error);
    }
  }, [userRole, currentUser]);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadPackages(),
        loadMembers(),
        loadSubscriptions(),
        loadTransactions(),
        loadUserTransactions()
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [loadPackages, loadMembers, loadSubscriptions, loadTransactions, loadUserTransactions]);

  useEffect(() => {
    simulateUser();
  }, [simulateUser]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleRoleSwitch = (role: 'admin' | 'user') => {
    setUserRole(role);
  };

  const refreshData = () => {
    loadAllData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                🌐 Internet Subscription Manager
              </h1>
              <p className="text-gray-600 mt-2">
                {userRole === 'admin' ? 'Admin Dashboard' : `Welcome back, ${currentUser?.full_name || 'User'}!`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={userRole === 'admin' ? 'default' : 'secondary'} className="text-sm">
                {userRole === 'admin' ? '👨‍💼 Admin' : '👤 User'}
              </Badge>
              <Button 
                onClick={refreshData} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
              </Button>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex gap-2">
            <Button
              variant={userRole === 'admin' ? 'default' : 'outline'}
              onClick={() => handleRoleSwitch('admin')}
              className="flex items-center gap-2"
            >
              👨‍💼 Admin View
            </Button>
            <Button
              variant={userRole === 'user' ? 'default' : 'outline'}
              onClick={() => handleRoleSwitch('user')}
              className="flex items-center gap-2"
            >
              👤 User View
            </Button>
          </div>
        </div>

        {/* Admin Interface */}
        {userRole === 'admin' && (
          <Tabs defaultValue="packages" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="packages" className="flex items-center gap-2">
                📦 Packages
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center gap-2">
                👥 Members
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="flex items-center gap-2">
                📋 Subscriptions
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-2">
                💳 Transactions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="packages">
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📦 Package Management
                  </CardTitle>
                  <CardDescription>
                    Create and manage internet packages with different speeds and pricing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminPackages 
                    packages={packages} 
                    onRefresh={loadPackages}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members">
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    👥 Member Management
                  </CardTitle>
                  <CardDescription>
                    Manage customer accounts and their information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminMembers 
                    members={members} 
                    onRefresh={loadMembers}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscriptions">
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📋 Subscription Overview
                  </CardTitle>
                  <CardDescription>
                    View all active and expired subscriptions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminSubscriptions 
                    subscriptions={subscriptions}
                    packages={packages}
                    members={members}
                    onRefresh={loadSubscriptions}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    💳 Transaction History
                  </CardTitle>
                  <CardDescription>
                    View all payment transactions and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminTransactions 
                    transactions={transactions}
                    subscriptions={subscriptions}
                    packages={packages}
                    members={members}
                    onRefresh={loadTransactions}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* User Interface */}
        {userRole === 'user' && currentUser && (
          <Tabs defaultValue="packages" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="packages" className="flex items-center gap-2">
                📦 Available Packages
              </TabsTrigger>
              <TabsTrigger value="subscribe" className="flex items-center gap-2">
                ✨ Subscribe
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-2">
                💳 My Transactions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="packages">
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📦 Available Internet Packages
                  </CardTitle>
                  <CardDescription>
                    Choose from our high-speed internet packages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserPackages packages={packages} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscribe">
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    ✨ Create New Subscription
                  </CardTitle>
                  <CardDescription>
                    Subscribe to a package and start enjoying high-speed internet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserSubscription 
                    packages={packages}
                    currentUser={currentUser}
                    onSuccess={refreshData}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    💳 My Transaction History
                  </CardTitle>
                  <CardDescription>
                    View your payment history and subscription transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserTransactions 
                    transactions={userTransactions}
                    onRefresh={loadUserTransactions}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default App;
