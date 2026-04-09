'use client';

import { useEffect, useState } from 'react';
import { getApiClient } from '@/lib/api-client';

interface Donation {
  id: string;
  amount: number;
  currency: string;
  donationType: string;
  status: string;
  donorEmail: string;
  donorName: string;
  processedAt: string;
  createdAt: string;
}

interface Stats {
  totalDonations: number;
  totalAmount: number;
  uniqueDonors: number;
  recurringCount: number;
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchData();
  }, [search, filterStatus, filterType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const api = getApiClient();

      // Fetch donations
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('type', filterType);

      const [donationsRes, statsRes] = await Promise.all([
        api.get(`/donations?${params}`),
        api.get('/donations/stats'),
      ]);

      setDonations(donationsRes.data.donations || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Donations</h1>
          <p className="text-gray-600 mt-2">Manage and track all donations received</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <p className="text-gray-600 text-sm mb-1">Total Donations</p>
              <p className="text-3xl font-bold text-primary-600">{stats.totalDonations}</p>
            </div>
            <div className="card">
              <p className="text-gray-600 text-sm mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-primary-600">
                {formatCurrency(stats.totalAmount, 'USD')}
              </p>
            </div>
            <div className="card">
              <p className="text-gray-600 text-sm mb-1">Unique Donors</p>
              <p className="text-3xl font-bold text-primary-600">{stats.uniqueDonors}</p>
            </div>
            <div className="card">
              <p className="text-gray-600 text-sm mb-1">Recurring</p>
              <p className="text-3xl font-bold text-primary-600">{stats.recurringCount}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Email, name..."
                className="input"
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="label">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input"
              >
                <option value="">All Types</option>
                <option value="one_time">One-Time</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={fetchData} className="btn-secondary w-full">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Donations Table */}
        <div className="card">
          {loading ? (
            <p className="text-gray-600">Loading donations...</p>
          ) : donations.length === 0 ? (
            <p className="text-gray-600">No donations found</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Donor</th>
                      <th className="text-left py-3 px-4 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold">Type</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((donation) => (
                      <tr key={donation.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{donation.donorName}</p>
                            <p className="text-sm text-gray-600">{donation.donorEmail}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {formatCurrency(donation.amount, donation.currency)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {donation.donationType === 'one_time' ? 'One-Time' : 'Recurring'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-sm ${getStatusColor(donation.status)}`}>
                            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(donation.processedAt || donation.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-4">Total: {donations.length} donations</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
