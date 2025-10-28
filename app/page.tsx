export default function Page() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="py-6 flex items-center justify-between">
        <div className="text-xl font-bold">Law Letter AI</div>
        <nav className="flex gap-4 text-sm">
          <a href="/auth">Sign In</a>
          <a href="/dashboard" className="font-medium">Dashboard</a>
        </nav>
      </header>
      <section className="py-16">
        <h1 className="text-4xl font-bold leading-tight">AI-powered Legal Letters</h1>
        <p className="mt-3 text-slate-600">Fast, formal, and ready to send.</p>
      </section>
    </main>
  );
}
