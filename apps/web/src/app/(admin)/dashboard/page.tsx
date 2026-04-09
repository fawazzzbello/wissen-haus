'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.firstName}!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-sm font-medium text-gray-600 mb-2">Total Donations</div>
            <div className="text-3xl font-bold text-primary-600">$24,500</div>
            <p className="text-xs text-gray-500 mt-2">+12% from last month</p>
          </div>

          <div className="card">
            <div className="text-sm font-medium text-gray-600 mb-2">Donors</div>
            <div className="text-3xl font-bold text-primary-600">128</div>
            <p className="text-xs text-gray-500 mt-2">+8 new this month</p>
          </div>

          <div className="card">
            <div className="text-sm font-medium text-gray-600 mb-2">Avg Donation</div>
            <div className="text-3xl font-bold text-primary-600">$191</div>
            <p className="text-xs text-gray-500 mt-2">Monthly average</p>
          </div>

          <div className="card">
            <div className="text-sm font-medium text-gray-600 mb-2">Recipients</div>
            <div className="text-3xl font-bold text-primary-600">2,450</div>
            <p className="text-xs text-gray-500 mt-2">Young people helped</p>
          </div>
        </div>

        {/* Content Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Donations</h2>
              <div className="space-y-4">
                {[
                  { donor: 'John Smith', amount: '$500', date: 'Today' },
                  { donor: 'Sarah Johnson', amount: '$1,000', date: 'Yesterday' },
                  { donor: 'Mike Davis', amount: '$250', date: '2 days ago' },
                  { donor: 'Emily Wilson', amount: '$750', date: '3 days ago' },
                ].map((donation, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{donation.donor}</p>
                      <p className="text-sm text-gray-500">{donation.date}</p>
                    </div>
                    <p className="font-semibold text-gray-900">{donation.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full btn-primary text-sm">
                  View All Donations
                </button>
                <button className="w-full btn-secondary text-sm">
                  Manage Users
                </button>
                <button className="w-full btn-secondary text-sm">
                  Edit Content
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">API Status</span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Database</span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Connected
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Email Service</span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Pending
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
