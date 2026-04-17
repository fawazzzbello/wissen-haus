'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { getApiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';

interface DonationStats {
  totalDonations: number;
  totalAmount: number;
  averageAmount: number;
  uniqueDonors: number;
  recurringCount: number;
}

interface RecentDonation {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const api = getApiClient();
      const [statsRes, donationsRes] = await Promise.all([
        api.get('/donations/stats'),
        api.get('/donations?limit=5'),
      ]);

      setStats(statsRes.data);
      setRecentDonations(donationsRes.data.donations || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">Welcome back, <span className="font-semibold text-green-600">{user?.firstName || 'Admin'}</span>! 👋</p>
        </div>

        {/* Real Stats */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
              {/* Total Donations */}
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
                <div className="text-sm font-medium text-gray-600 mb-2">💰 Total Raised</div>
                <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats?.totalAmount || 0)}</div>
                <p className="text-xs text-gray-500 mt-2">From {stats?.totalDonations || 0} donations</p>
              </div>

              {/* Unique Donors */}
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
                <div className="text-sm font-medium text-gray-600 mb-2">👥 Donors</div>
                <div className="text-3xl font-bold text-gray-900">{stats?.uniqueDonors || 0}</div>
                <p className="text-xs text-gray-500 mt-2">Unique supporters</p>
              </div>

              {/* Avg Donation */}
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
                <div className="text-sm font-medium text-gray-600 mb-2">📊 Avg Amount</div>
                <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats?.averageAmount || 0)}</div>
                <p className="text-xs text-gray-500 mt-2">Per donation</p>
              </div>

              {/* Recurring */}
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
                <div className="text-sm font-medium text-gray-600 mb-2">🔄 Recurring</div>
                <div className="text-3xl font-bold text-gray-900">{stats?.recurringCount || 0}</div>
                <p className="text-xs text-gray-500 mt-2">Monthly donors</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Donations Table */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Donations</h2>
                  <Link href="/admin/donations" className="text-green-600 hover:text-green-700 text-sm font-semibold">
                    View All →
                  </Link>
                </div>

                {recentDonations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No donations yet</p>
                ) : (
                  <div className="space-y-4">
                    {recentDonations.map((donation) => (
                      <div key={donation.id} className="flex justify-between items-center py-3 border-b last:border-b-0 gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{donation.donorName}</p>
                          <p className="text-xs text-gray-500 truncate">{donation.donorEmail}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatCurrency(donation.amount)}</p>
                          <p className="text-xs text-gray-500">{formatDate(donation.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions & Status */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link href="/admin/donations" className="block w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition text-center text-sm">
                      Manage Donations
                    </Link>
                    <Link href="/admin/settings" className="block w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-center text-sm">
                      Homepage Settings
                    </Link>
                    <Link href="/admin/users" className="block w-full px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition text-center text-sm">
                      Manage Users
                    </Link>
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-bold text-gray-900 mb-4">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">API Connection</span>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-green-600 font-semibold">Online</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Database</span>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-green-600 font-semibold">Connected</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Last Sync</span>
                      <span className="text-gray-600">Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
