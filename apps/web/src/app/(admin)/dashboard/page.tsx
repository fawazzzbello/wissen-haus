'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-gray-600 mt-3 text-lg">Welcome back, <span className="font-semibold text-primary-600">{user?.firstName}</span>! 👋</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-dark bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-sm font-medium text-gray-400 mb-3">💰 Total Donations</div>
            <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text">$24,500</div>
            <p className="text-xs text-green-400 mt-3 font-semibold">↑ +12% from last month</p>
          </div>

          <div className="card-dark bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-sm font-medium text-gray-400 mb-3">👥 Donors</div>
            <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text">128</div>
            <p className="text-xs text-green-400 mt-3 font-semibold">↑ +8 new this month</p>
          </div>

          <div className="card-dark bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-sm font-medium text-gray-400 mb-3">📊 Avg Donation</div>
            <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text">$191</div>
            <p className="text-xs text-gray-400 mt-3">Monthly average</p>
          </div>

          <div className="card-dark bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-sm font-medium text-gray-400 mb-3">🎯 Recipients</div>
            <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text">2,450</div>
            <p className="text-xs text-gray-400 mt-3">Young people helped</p>
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
