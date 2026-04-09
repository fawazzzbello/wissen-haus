'use client';

import { useState, FormEvent } from 'react';
import { getApiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

const presetAmounts = [25, 50, 100, 250, 500, 1000];

export default function DonationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    amount: 100,
    customAmount: '',
    currency: 'USD',
    message: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePresetAmount = (amount: number) => {
    setFormData(prev => ({
      ...prev,
      amount,
      customAmount: '',
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.email || !formData.firstName || !formData.lastName) {
        throw new Error('Please fill in all required fields');
      }

      const amount = formData.customAmount ? parseFloat(formData.customAmount) : formData.amount;

      if (amount < 1) {
        throw new Error('Donation amount must be at least $1.00');
      }

      // Create checkout session
      const apiClient = getApiClient();
      const response = await apiClient.post('/donations/create-checkout-session', {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        country: formData.country || undefined,
        amount,
        currency: formData.currency,
        description: formData.message || 'Donation to Wissen-Haus',
        type: 'one_time',
      });

      // Store donation info and redirect to payment
      sessionStorage.setItem('donation_intent', response.data.sessionId);
      sessionStorage.setItem('client_secret', response.data.clientSecret);

      router.push('/donate/checkout');
    } catch (err: any) {
      setError(err.message || 'Failed to process donation');
    } finally {
      setIsLoading(false);
    }
  };

  const donationAmount = formData.customAmount ? parseFloat(formData.customAmount) : formData.amount;

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Donation Details</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {/* Donation Amount */}
      <div className="mb-6">
        <label className="label">Donation Amount *</label>
        <p className="text-sm text-gray-600 mb-3">Select an amount or enter a custom amount</p>

        {/* Preset Amounts */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {presetAmounts.map(amount => (
            <button
              key={amount}
              type="button"
              onClick={() => handlePresetAmount(amount)}
              className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                formData.customAmount === '' && formData.amount === amount
                  ? 'bg-primary-600 text-white border border-primary-600'
                  : 'bg-gray-100 text-gray-900 border border-gray-300 hover:border-primary-600'
              }`}
            >
              ${amount}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
              <input
                type="number"
                name="customAmount"
                value={formData.customAmount}
                onChange={handleInputChange}
                placeholder="Enter custom amount"
                min="1"
                step="0.01"
                className="input pl-8"
              />
            </div>
          </div>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
            className="input w-24"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <p className="text-sm text-gray-600 mt-2">
          Total: <span className="font-semibold text-primary-600">${donationAmount.toFixed(2)} {formData.currency}</span>
        </p>
      </div>

      {/* Personal Information */}
      <div className="mb-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Your Information</h3>

        <div>
          <label htmlFor="email" className="label">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="input"
            placeholder="you@example.com"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="label">
              First Name *
            </label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="input"
              placeholder="John"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="label">
              Last Name *
            </label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="input"
              placeholder="Smith"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="label">
            Phone (optional)
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="input"
            placeholder="+1 (555) 123-4567"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="country" className="label">
            Country (optional)
          </label>
          <input
            id="country"
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="input"
            placeholder="United States"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Message */}
      <div className="mb-6">
        <label htmlFor="message" className="label">
          Message (optional)
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          className="input"
          placeholder="Share why you support our mission..."
          rows={3}
          disabled={isLoading}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : `Proceed to Payment - $${donationAmount.toFixed(2)}`}
      </button>

      {/* Privacy Notice */}
      <p className="text-xs text-gray-500 mt-4 text-center">
        Your information is secure. We process payments through Stripe and never store credit card data.
      </p>
    </form>
  );
}
