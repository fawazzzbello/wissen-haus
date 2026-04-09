'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store/authStore';

export default function AdminLogin() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginUser(email, password);

      // Store tokens and user info
      setUser({
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        role: response.user.role,
        status: response.user.status,
      });
      setToken(response.accessToken);

      // Redirect to dashboard
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="text-3xl font-bold text-primary-600 mb-2">Wissen-Haus</div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="card">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="admin@wissen-haus.org"
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-2">Demo Credentials</p>
            <p className="text-xs text-blue-700">Email: admin@wissen-haus.org</p>
            <p className="text-xs text-blue-700">Password: admin@123456</p>
          </div>
        </form>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
