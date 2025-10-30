"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LetterActionsProps {
  letterId: string;
  attorneyEmail?: string | null;
  attorneyName?: string | null;
}

export function LetterActions({ letterId, attorneyEmail: initialEmail, attorneyName: initialName }: LetterActionsProps) {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [attorneyEmail, setAttorneyEmail] = useState(initialEmail || "");
  const [attorneyName, setAttorneyName] = useState(initialName || "");
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!attorneyEmail || !attorneyEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    const sendPromise = fetch(`/api/letters/${letterId}/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attorneyEmail, attorneyName }),
    }).then(res => {
      if (!res.ok) throw new Error("Failed to send email");
      return res.json();
    });

    toast.promise(sendPromise, {
      loading: "Sending email...",
      success: () => {
        setIsEmailModalOpen(false);
        setIsSending(false);
        return "Email sent successfully!";
      },
      error: () => {
        setIsSending(false);
        return "Failed to send email. Please try again.";
      },
    });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <a href={`/api/letters/${letterId}/pdf`} target="_blank" rel="noopener noreferrer">
        <Button variant="outline">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </Button>
      </a>

      <Button onClick={() => setIsEmailModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Send via Email
      </Button>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Send Letter via Email</h3>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                disabled={isSending}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label htmlFor="attorneyEmail" className="block text-sm font-medium text-slate-700 mb-2">
                  Attorney Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="attorneyEmail"
                  type="email"
                  value={attorneyEmail}
                  onChange={(e) => setAttorneyEmail(e.target.value)}
                  placeholder="attorney@example.com"
                  required
                  disabled={isSending}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="attorneyName" className="block text-sm font-medium text-slate-700 mb-2">
                  Attorney Name (optional)
                </label>
                <input
                  id="attorneyName"
                  type="text"
                  value={attorneyName}
                  onChange={(e) => setAttorneyName(e.target.value)}
                  placeholder="John Doe"
                  disabled={isSending}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  📧 The letter will be sent as a PDF attachment with a professional email template.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEmailModalOpen(false)}
                  disabled={isSending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSending ? "Sending..." : "Send Email"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
