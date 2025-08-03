
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Package } from '../../../server/src/schema';

interface UserPackagesProps {
  packages: Package[];
}

export function UserPackages({ packages }: UserPackagesProps) {
  const getSpeedLevel = (speed: string) => {
    const speedNum = parseInt(speed);
    if (speedNum >= 100) return { level: 'premium', icon: '🚀', color: 'bg-gradient-to-r from-purple-500 to-pink-500' };
    if (speedNum >= 50) return { level: 'high', icon: '⚡', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' };
    if (speedNum >= 25) return { level: 'medium', icon: '🌟', color: 'bg-gradient-to-r from-green-500 to-teal-500' };
    return { level: 'basic', icon: '📡', color: 'bg-gradient-to-r from-gray-500 to-slate-500' };
  };

  return (
    <div className="space-y-6">
      {packages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-500 text-lg">No packages available at the moment.</p>
          <p className="text-gray-400">Please check back later for exciting internet packages!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg: Package) => {
            const speedInfo = getSpeedLevel(pkg.speed);
            
            return (
              <Card key={pkg.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
                <div className={`h-2 ${speedInfo.color} rounded-t-lg`} />
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{speedInfo.icon}</span>
                      <span className="text-xl font-bold">{pkg.name}</span>
                    </div>
                    <Badge variant="outline" className="text-sm font-bold">
                      ${pkg.price.toFixed(2)}/mo
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Speed Display */}
                  <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                    <div className="text-4xl font-bold text-gray-800 mb-1">
                      {pkg.speed}
                    </div>
                    <div className="text-sm text-gray-600 uppercase tracking-wide">
                      Download Speed
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-green-500">✅</span>
                      <span>30 days subscription period</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-green-500">✅</span>
                      <span>24/7 customer support</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-green-500">✅</span>
                      <span>Unlimited data usage</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-green-500">✅</span>
                      <span>Free installation setup</span>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-blue-50 rounded-lg p-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        ${pkg.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-blue-600">
                        per month • 30 days coverage
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Total: ${pkg.price.toFixed(2)} for full period
                      </div>
                    </div>
                  </div>

                  {/* Best Value Badge */}
                  {speedInfo.level === 'premium' && (
                    <div className="text-center">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        🏆 Most Popular
                      </Badge>
                    </div>
                  )}
                  {speedInfo.level === 'high' && (
                    <div className="text-center">
                      <Badge variant="secondary">
                        💎 Great Value
                      </Badge>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 text-center pt-2 border-t">
                    Package available since {pkg.created_at.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Information Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          ℹ️ How It Works
        </h3>
        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-500">1️⃣</span>
            <div>
              <div className="font-medium">Choose Package</div>
              <div className="text-gray-600">Select the perfect speed for your needs</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">2️⃣</span>
            <div>
              <div className="font-medium">Subscribe</div>
              <div className="text-gray-600">Complete your subscription in seconds</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">3️⃣</span>
            <div>
              <div className="font-medium">Enjoy</div>
              <div className="text-gray-600">Get online with high-speed internet</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
