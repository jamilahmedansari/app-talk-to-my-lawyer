"use client";

import { useState } from "react";

interface EmployeeDashboardClientProps {
  couponCode: string;
  discountPercent: number;
  points: number;
  revenue: number;
}

export function EmployeeDashboardClient({
  couponCode,
  discountPercent,
  points,
  revenue,
}: EmployeeDashboardClientProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
      {/* Coupon Code Card with Animation */}
      <div className="relative col-span-full md:col-span-1 border-2 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
        {/* Animated Border Effect */}
        <div className="absolute inset-0 rounded-lg animate-pulse-border" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-600">Your Coupon Code</h3>
            <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
              {discountPercent}% OFF
            </div>
          </div>

          <div className="bg-white border-2 border-blue-200 rounded-lg p-4 mb-3">
            <code className="text-2xl font-bold text-blue-600 tracking-wider block text-center">
              {couponCode}
            </code>
          </div>

          <button
            onClick={handleCopy}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Code
              </>
            )}
          </button>
        </div>

        <style jsx>{`
          @keyframes pulse-border {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4),
                          0 0 0 0 rgba(99, 102, 241, 0.4);
            }
            50% {
              box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2),
                          0 0 0 8px rgba(99, 102, 241, 0.1);
            }
          }
          .animate-pulse-border {
            animation: pulse-border 2s ease-in-out infinite;
          }
        `}</style>
      </div>

      {/* Points Card */}
      <div className="border rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-600">Total Points</p>
            <p className="text-3xl font-bold text-slate-900">{points}</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Earned from successful signups
        </p>
      </div>

      {/* Revenue Card */}
      <div className="border rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-600">Total Revenue</p>
            <p className="text-3xl font-bold text-slate-900">${revenue.toFixed(2)}</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          5% commission from subscriptions
        </p>
      </div>
    </>
  );
}
