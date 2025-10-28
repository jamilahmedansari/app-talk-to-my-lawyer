import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-4">
          <div className="font-semibold mb-2">Generate Letter</div>
          <Link className="underline" href="/dashboard?new=1">
            Open Generator
          </Link>
        </div>
        <div className="border rounded-lg p-4">
          <div className="font-semibold mb-2">Subscription</div>
          <p className="text-sm text-slate-600">Plan: —</p>
        </div>
      </section>
      <section className="mt-8">
        <div className="font-semibold mb-2">History</div>
        <div className="text-sm text-slate-600">No letters yet.</div>
      </section>
    </main>
  );
}
