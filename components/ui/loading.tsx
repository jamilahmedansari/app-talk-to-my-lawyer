export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-slate-200 border-t-blue-600`} />
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="border rounded-lg p-6 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-slate-600">Loading...</p>
    </div>
  );
}

export function LoadingTable() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-200 rounded w-1/4"></div>
            </div>
            <div className="h-6 w-20 bg-slate-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
