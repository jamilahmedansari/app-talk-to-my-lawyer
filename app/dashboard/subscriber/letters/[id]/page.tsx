"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function LetterDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [letter, setLetter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [attorneyEmail, setAttorneyEmail] = useState("");
  const [attorneyName, setAttorneyName] = useState("");
  const [sending, setSending] = useState(false);

  const fetchLetter = async () => {
    try {
      const response = await fetch(`/api/letters/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch letter");
      }
      const data = await response.json();
      setLetter(data.letter);
      
      // Pre-fill attorney email if exists
      if (data.letter.attorney_email) {
        setAttorneyEmail(data.letter.attorney_email);
      }
      if (data.letter.recipient_name) {
        setAttorneyName(data.letter.recipient_name);
      }
    } catch (error) {
      console.error("Error fetching letter:", error);
      alert("Failed to load letter");
      router.push("/dashboard/subscriber/letters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleSendEmail = async () => {
    if (!attorneyEmail) {
      alert("Please enter an attorney email address");
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`/api/letters/${params.id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attorney_email: attorneyEmail,
          attorney_name: attorneyName || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send email");
      }

      alert("Email sent successfully!");
      setEmailModalOpen(false);
      fetchLetter(); // Refresh to show sent status
    } catch (error: any) {
      console.error("Error sending email:", error);
      alert(error.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading letter...</p>
        </div>
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Letter Not Found</h2>
          <p className="text-slate-600 mb-4">The requested letter could not be found.</p>
          <Button onClick={() => router.push("/dashboard/subscriber/letters")}>
            Back to My Letters
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
          <div className="flex items-center gap-3">
            {letter.status === "completed" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setEmailModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send via Email
                </Button>
                <a href={`/api/letters/${params.id}/pdf`} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Letter Info Card */}
        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {letter.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>Created: {new Date(letter.created_at).toLocaleDateString()}</span>
                {letter.completed_at && (
                  <span>Completed: {new Date(letter.completed_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                letter.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : letter.status === "generating"
                  ? "bg-yellow-100 text-yellow-800"
                  : letter.status === "failed"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {letter.status.charAt(0).toUpperCase() + letter.status.slice(1)}
            </span>
          </div>

          {/* Recipient Info */}
          {(letter.recipient_name || letter.recipient_address) && (
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">Recipient Information</h3>
              {letter.recipient_name && (
                <p className="text-slate-700 mb-1">
                  <strong>Name:</strong> {letter.recipient_name}
                </p>
              )}
              {letter.recipient_address && (
                <p className="text-slate-700">
                  <strong>Address:</strong> {letter.recipient_address}
                </p>
              )}
            </div>
          )}

          {/* Email Status */}
          {letter.sent_at && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-purple-900 mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Email Sent</span>
              </div>
              <p className="text-purple-700 text-sm">
                Sent to {letter.attorney_email} on {new Date(letter.sent_at).toLocaleDateString()} at{" "}
                {new Date(letter.sent_at).toLocaleTimeString()}
              </p>
            </div>
          )}

          {/* Letter Content */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 text-lg">Letter Content</h3>
            <div className="bg-white border border-slate-200 rounded-lg p-6 max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-serif text-slate-800 leading-relaxed">
                {letter.content}
              </pre>
            </div>
          </div>
        </Card>
      </div>

      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Letter via Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Attorney Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={attorneyEmail}
                onChange={(e) => setAttorneyEmail(e.target.value)}
                placeholder="attorney@lawfirm.com"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                The letter will be sent to this email address
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Attorney Name (Optional)
              </label>
              <Input
                type="text"
                value={attorneyName}
                onChange={(e) => setAttorneyName(e.target.value)}
                placeholder="John Smith, Esq."
              />
              <p className="text-xs text-slate-500 mt-1">
                Used in the email greeting
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> The email will include a PDF download link and a preview of your letter content.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setEmailModalOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sending || !attorneyEmail}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                  Sending...
                </>
              ) : (
                "Send Email"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
