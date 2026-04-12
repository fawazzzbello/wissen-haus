'use client';

// Ensure this page is always rendered dynamically
export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import { getApiClient } from '@/lib/api-client';

interface NotificationLog {
  id: string;
  notificationType: 'email' | 'sms';
  recipient: string;
  subject?: string;
  status: 'sent' | 'failed' | 'pending' | 'bounced';
  provider: string;
  sentAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filterType, filterStatus]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();

      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterStatus) params.append('status', filterStatus);

      const response = await api.get(`/notifications/logs?${params}`);
      setLogs(response.data.logs || []);
    } catch (error: any) {
      console.error('Error fetching notification logs:', error);
      setError(error.message || 'Failed to load notification logs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'bounced':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'email' ? 'bg-purple-100 text-purple-800' : 'bg-cyan-100 text-cyan-800';
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Notification Logs</h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">Track all sent notifications and delivery status</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 mb-3">{error}</p>
            <button
              onClick={fetchLogs}
              className="btn-secondary text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label text-sm">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input text-sm"
              >
                <option value="">All Types</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <div>
              <label className="label text-sm">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input text-sm"
              >
                <option value="">All Status</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="bounced">Bounced</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={fetchLogs} className="btn-secondary w-full text-sm">
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Notification Logs Table */}
        <div className="card">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 mb-2 border-4 border-primary-600 border-t-transparent rounded-full spinner"></div>
                <p className="text-gray-600">Loading notification logs...</p>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No notifications found</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 md:px-4 font-semibold">Type</th>
                      <th className="hidden sm:table-cell text-left py-3 px-2 md:px-4 font-semibold">Recipient</th>
                      <th className="hidden md:table-cell text-left py-3 px-2 md:px-4 font-semibold">Subject</th>
                      <th className="text-left py-3 px-2 md:px-4 font-semibold">Status</th>
                      <th className="hidden lg:table-cell text-left py-3 px-2 md:px-4 font-semibold">Provider</th>
                      <th className="text-left py-3 px-2 md:px-4 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 md:px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(log.notificationType)}`}>
                            {log.notificationType.toUpperCase()}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell py-3 px-2 md:px-4 text-xs truncate">{log.recipient}</td>
                        <td className="hidden md:table-cell py-3 px-2 md:px-4 text-xs">
                          {log.subject ? (
                            <span title={log.subject} className="truncate block max-w-xs">
                              {log.subject}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2 md:px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.status)}`}>
                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell py-3 px-2 md:px-4 text-xs text-gray-600">{log.provider || '-'}</td>
                        <td className="py-3 px-2 md:px-4 text-xs text-gray-600">
                          {formatDate(log.sentAt || log.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-4">Total: {logs.length} notifications</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
