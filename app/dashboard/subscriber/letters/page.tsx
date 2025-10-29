import { requireAuth, getUserProfile } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function MyLettersPage() {
  await requireAuth();
  const profile = await getUserProfile();
  const supabase = await getServerSupabase();

  // Fetch all user's letters
  const { data: letters, error } = await supabase
    .from("letters")
    .select("id, title, status, recipient_name, created_at, completed_at, attorney_email, sent_at")
    .eq("user_id", profile!.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching letters:", error);
  }

  const allLetters = letters || [];

  // Group letters by status
  const completedLetters = allLetters.filter(l => l.status === "completed");
  const generatingLetters = allLetters.filter(l => l.status === "generating");
  const draftLetters = allLetters.filter(l => l.status === "draft");
  const failedLetters = allLetters.filter(l => l.status === "failed");

  return (
    <>
      <DashboardHeader
        userName={profile?.full_name}
        userEmail={profile?.email}
      />
      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Letters</h1>
            <p className="text-slate-600 mt-2">
              View and manage all your generated legal letters
            </p>
          </div>
          <Link href="/dashboard/subscriber/generate">
            <Button className="bg-blue-600 hover:bg-blue-700">
              + Generate New Letter
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="text-sm font-medium text-blue-700">Total Letters</div>
            <div className="text-3xl font-bold text-blue-900 mt-1">
              {allLetters.length}
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="text-sm font-medium text-green-700">Completed</div>
            <div className="text-3xl font-bold text-green-900 mt-1">
              {completedLetters.length}
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <div className="text-sm font-medium text-yellow-700">In Progress</div>
            <div className="text-3xl font-bold text-yellow-900 mt-1">
              {generatingLetters.length}
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <div className="text-sm font-medium text-purple-700">Sent via Email</div>
            <div className="text-3xl font-bold text-purple-900 mt-1">
              {allLetters.filter(l => l.sent_at).length}
            </div>
          </Card>
        </div>

        {/* Letters List */}
        {allLetters.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No Letters Yet
            </h3>
            <p className="text-slate-600 mb-6">
              You haven&apos;t generated any letters yet. Create your first one to get started!
            </p>
            <Link href="/dashboard/subscriber/generate">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Generate Your First Letter
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Completed Letters */}
            {completedLetters.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Completed Letters ({completedLetters.length})
                </h2>
                <div className="grid gap-4">
                  {completedLetters.map((letter) => (
                    <Card key={letter.id} className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {letter.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                            {letter.recipient_name && (
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>To: {letter.recipient_name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Created: {new Date(letter.created_at).toLocaleDateString()}</span>
                            </div>
                            {letter.sent_at && (
                              <div className="flex items-center gap-1 text-purple-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>Sent: {new Date(letter.sent_at).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          {letter.attorney_email && (
                            <div className="text-sm text-slate-500 mb-3">
                              Sent to: {letter.attorney_email}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Link href={`/api/letters/${letter.id}/pdf`} target="_blank">
                            <Button variant="outline" size="sm">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download PDF
                            </Button>
                          </Link>
                          <Link href={`/dashboard/subscriber/letters/${letter.id}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Generating Letters */}
            {generatingLetters.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  In Progress ({generatingLetters.length})
                </h2>
                <div className="grid gap-4">
                  {generatingLetters.map((letter) => (
                    <Card key={letter.id} className="p-6 bg-yellow-50 border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {letter.title}
                          </h3>
                          <p className="text-sm text-slate-600">
                            Creating your letter... This usually takes 30-60 seconds.
                          </p>
                        </div>
                        <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Draft Letters */}
            {draftLetters.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                  Drafts ({draftLetters.length})
                </h2>
                <div className="grid gap-4">
                  {draftLetters.map((letter) => (
                    <Card key={letter.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {letter.title}
                          </h3>
                          <p className="text-sm text-slate-600">
                            Created: {new Date(letter.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Link href={`/dashboard/subscriber/letters/${letter.id}`}>
                          <Button size="sm" variant="outline">
                            Continue Editing
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Failed Letters */}
            {failedLetters.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Failed ({failedLetters.length})
                </h2>
                <div className="grid gap-4">
                  {failedLetters.map((letter) => (
                    <Card key={letter.id} className="p-6 bg-red-50 border-red-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {letter.title}
                          </h3>
                          <p className="text-sm text-red-600">
                            Generation failed. Please try creating a new letter.
                          </p>
                        </div>
                        <Link href="/dashboard/subscriber/generate">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Try Again
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </>
  );
}
