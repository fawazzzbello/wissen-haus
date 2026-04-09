'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { logoutUser } from '@/lib/api-client';
import { useState } from 'react';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: '📊',
  },
  {
    label: 'Donations',
    href: '/admin/donations',
    icon: '💝',
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: '👥',
  },
  {
    label: 'Content',
    href: '/admin/content',
    icon: '📄',
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: '⚙️',
  },
  {
    label: 'Notifications',
    href: '/admin/notifications',
    icon: '🔔',
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      await logoutUser();
      logout();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      router.push('/admin/login');
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="text-2xl">🏫</div>
            {isOpen && <span className="text-xl font-bold">Wissen</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                title={item.label}
              >
                <span className="text-xl">{item.icon}</span>
                {isOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-800 p-4 space-y-3">
          {isOpen && (
            <div className="px-2">
              <p className="text-xs text-gray-400">Logged in as</p>
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            title="Toggle sidebar"
          >
            {isOpen ? '←' : '→'}
          </button>

          <button
            onClick={handleLogout}
            disabled={isLogoutLoading}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <span className="text-lg">🚪</span>
            {isOpen && (isLogoutLoading ? 'Logging out...' : 'Logout')}
          </button>
        </div>
      </div>

      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:hidden fixed bottom-4 right-4 z-40 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center"
      >
        {isOpen ? '✕' : '☰'}
      </button>
    </>
  );
}
