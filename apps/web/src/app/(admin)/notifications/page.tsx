'use client';

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
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filterType, filterStatus]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const api = getApiClient();

      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterStatus) params.append('status', filterStatus);

      const response = await api.get(`/notifications/logs?${params}`);
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error fetching notification logs:', error);
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
    <div className="p-8">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notification Logs</h1>
          <p className="text-gray-600 mt-2">Track all sent notifications and delivery status</p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input"
              >
                <option value="">All Types</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input"
              >
                <option value="">All Status</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="bounced">Bounced</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={fetchLogs} className="btn-secondary w-full">
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Notification Logs Table */}
        <div className="card">
          {loading ? (
            <p className="text-gray-600">Loading notification logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-600">No notifications found</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Type</th>
                      <th className="text-left py-3 px-4 font-semibold">Recipient</th>
                      <th className="text-left py-3 px-4 font-semibold">Subject</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Provider</th>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getTypeColor(log.notificationType)}`}>
                            {log.notificationType.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{log.recipient}</td>
                        <td className="py-3 px-4 text-sm">
                          {log.subject ? (
                            <span title={log.subject} className="truncate block max-w-xs">
                              {log.subject}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(log.status)}`}>
                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{log.provider || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(log.sentAt || log.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-4">Total: {logs.length} notifications</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
