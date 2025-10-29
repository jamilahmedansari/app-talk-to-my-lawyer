"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const pricingTiers = [
  {
    id: "one-time",
    name: "One-Time Letter",
    price: 199,
    priceLabel: "$199",
    description: "Perfect for a single legal matter",
    features: [
      "1 Professional Legal Letter",
      "AI-Powered Generation",
      "PDF Download",
      "Email to Attorney",
      "Valid for 30 Days",
      "No Recurring Charges"
    ],
    highlighted: false,
    cta: "Get Started"
  },
  {
    id: "annual-basic",
    name: "Annual Basic",
    price: 2388,
    priceLabel: "$2,388/year",
    priceSubtext: "($199/month)",
    description: "For ongoing legal needs",
    features: [
      "4 Letters Per Month",
      "48 Letters Per Year",
      "AI-Powered Generation",
      "PDF Downloads",
      "Email to Attorneys",
      "Priority Support",
      "Monthly Refills",
      "Cancel Anytime"
    ],
    highlighted: true,
    cta: "Most Popular"
  },
  {
    id: "annual-premium",
    name: "Annual Premium",
    price: 7200,
    priceLabel: "$7,200/year",
    priceSubtext: "($600/month)",
    description: "For businesses and heavy users",
    features: [
      "8 Letters Per Month",
      "96 Letters Per Year",
      "AI-Powered Generation",
      "PDF Downloads",
      "Email to Attorneys",
      "VIP Priority Support",
      "Monthly Refills",
      "Dedicated Account Manager",
      "Cancel Anytime"
    ],
    highlighted: false,
    cta: "Go Premium"
  }
];

export default function PricingPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (tierId: string) => {
    setLoading(true);
    setSelectedTier(tierId);

    try {
      // Check if user is authenticated
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: tierId }),
      });

      if (response.status === 401) {
        // Not authenticated, redirect to auth
        router.push(`/auth?redirect=/pricing&plan=${tierId}`);
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process subscription");
      }

      const data = await response.json();
      
      // Redirect to dashboard with success message
      router.push("/dashboard/subscriber?success=true");
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setSelectedTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-slate-900">
              Talk To My Lawyer
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-2">
            Professional AI-generated legal letters delivered instantly.
          </p>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            All plans include PDF downloads and attorney email delivery.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.id}
                className={`p-8 relative ${
                  tier.highlighted
                    ? "border-2 border-blue-500 shadow-xl scale-105"
                    : "border border-slate-200"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {tier.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-slate-900">
                      {tier.priceLabel}
                    </span>
                    {tier.priceSubtext && (
                      <p className="text-sm text-slate-500 mt-1">
                        {tier.priceSubtext}
                      </p>
                    )}
                  </div>
                  <p className="text-slate-600">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    tier.highlighted
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-slate-900 hover:bg-slate-800"
                  }`}
                  onClick={() => handleSelectPlan(tier.id)}
                  disabled={loading}
                >
                  {loading && selectedTier === tier.id ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    tier.cta
                  )}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                How does the AI letter generation work?
              </h3>
              <p className="text-slate-600">
                Our AI analyzes your situation and generates a professional legal letter
                tailored to your specific needs. Simply provide the details, and we&apos;ll
                create a letter ready to send to attorneys or other parties.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                What happens to unused letters?
              </h3>
              <p className="text-slate-600">
                For annual plans, unused letters do not roll over to the next month.
                Your letter quota refills on the same day each month. One-time letters
                expire after 30 days if unused.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Can I cancel my subscription?
              </h3>
              <p className="text-slate-600">
                Yes! Annual subscriptions can be canceled at any time. You&apos;ll continue
                to have access until the end of your billing period. No refunds for
                unused time or letters.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Is this a replacement for a lawyer?
              </h3>
              <p className="text-slate-600">
                No. Our service generates professional letters based on your input,
                but this is not legal advice. For complex legal matters, always
                consult with a licensed attorney.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400">
            © {new Date().getFullYear()} Talk To My Lawyer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
