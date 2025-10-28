"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function GenerateLetterPage() {
  const router = useRouter();
  const [quota, setQuota] = useState({ remaining: 0, total: 0, canGenerate: false });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  useEffect(() => {
    checkQuota();
  }, []);

  const checkQuota = async () => {
    try {
      const response = await fetch("/api/letters/quota");
      if (response.ok) {
        const quotaData = await response.json();
        setQuota(quotaData);
      }
    } catch (error) {
      console.error("Error checking quota:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quota.canGenerate) {
      alert("You have reached your monthly letter limit. Please upgrade your subscription.");
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch("/api/letters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          recipient_name: recipientName,
          recipient_address: recipientAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate letter");
      }

      const { letterId } = await response.json();
      
      alert("Letter generated successfully!");
      router.push(`/dashboard/subscriber/letters/${letterId}`);
    } catch (error: any) {
      console.error("Error generating letter:", error);
      alert(error.message || "An error occurred while generating the letter");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
        </div>

        {/* Quota Alert */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Letter Quota</h3>
              <p className="text-sm text-blue-700 mt-1">
                {quota.remaining} of {quota.total} letters remaining this month
              </p>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {quota.remaining}/{quota.total}
            </div>
          </div>
          {!quota.canGenerate && (
            <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
              <p className="text-yellow-800 text-sm font-medium">
                ⚠️ You&apos;ve used all your letters this month. Please upgrade your plan.
              </p>
            </div>
          )}
        </Card>

        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-2">Generate Legal Letter</h1>
          <p className="text-gray-600 mb-8">
            Fill out the details below and our AI will generate a professional legal letter for you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Letter Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Lease Dispute Resolution, Debt Collection Notice"
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                A brief title describing the purpose of the letter
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Letter Content <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full min-h-[250px] p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe the situation in detail. Include relevant facts, dates, amounts, and what action you want the recipient to take. The more detail you provide, the better the letter will be."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide as much detail as possible about your situation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Recipient Name
                </label>
                <Input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Recipient Address
                </label>
                <Input
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                  className="w-full"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Best Results</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Include specific dates, amounts, and names</li>
                <li>Explain what has happened and what you want</li>
                <li>Mention any previous communications or attempts to resolve</li>
                <li>Be clear about deadlines or next steps</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={generating || !quota.canGenerate}
                className="flex-1"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Letter...
                  </>
                ) : (
                  "Generate Letter"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={generating}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
