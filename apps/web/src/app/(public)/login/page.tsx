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
      const userData = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        role: response.user.role,
        status: response.user.status,
      };

      setUser(userData);
      setToken(response.accessToken);

      // Give localStorage time to persist
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -right-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-4">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">✨ Wissen-Haus</div>
          </Link>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-300 mt-3 font-light">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="card-dark bg-slate-800/80 backdrop-blur-sm border border-primary-500/20">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
              <p className="text-red-300 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="mb-5">
            <label htmlFor="email" className="label text-gray-300">
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
          <div className="mb-7">
            <label htmlFor="password" className="label text-gray-300">
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
            className="w-full btn-primary-gradient disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? '🔄 Signing in...' : '🔐 Sign In'}
          </button>

          {/* Demo Credentials */}
          <div className="mt-7 p-4 bg-primary-500/20 border border-primary-500/50 rounded-lg backdrop-blur-sm">
            <p className="text-xs font-semibold text-primary-300 mb-3">🔑 Demo Credentials</p>
            <p className="text-xs text-primary-200 font-mono">Email: admin@wissen-haus.org</p>
            <p className="text-xs text-primary-200 font-mono">Password: admin@123456</p>
          </div>
        </form>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-primary-300 hover:text-primary-200 text-sm font-medium transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
