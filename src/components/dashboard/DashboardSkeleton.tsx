export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-8 w-48 rounded-xl" />
          <div className="skeleton h-4 w-72 rounded-lg" />
        </div>
        <div className="skeleton h-10 w-36 rounded-xl" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-base-100 rounded-3xl border border-base-300 p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="skeleton h-4 w-20 rounded-md" />
              <div className="skeleton h-8 w-8 rounded-xl" />
            </div>
            <div className="skeleton h-8 w-16 rounded-xl" />
            <div className="skeleton h-3 w-28 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Grid: Listings Skeleton & Swaps Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listings Section Skeleton (2 cols) */}
        <div className="lg:col-span-2 bg-base-100 rounded-3xl border border-base-300 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-base-200">
            <div className="skeleton h-6 w-32 rounded-lg" />
            <div className="skeleton h-4 w-20 rounded-md" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-2xl bg-base-200/50 border border-base-300/40 gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
                  <div className="space-y-1.5">
                    <div className="skeleton h-4 w-36 rounded-md" />
                    <div className="skeleton h-3 w-24 rounded-md" />
                  </div>
                </div>
                <div className="skeleton h-8 w-24 rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Swap Negotiations Skeleton (1 col) */}
        <div className="bg-base-100 rounded-3xl border border-base-300 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-base-200">
            <div className="skeleton h-6 w-28 rounded-lg" />
            <div className="skeleton h-4 w-16 rounded-md" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-base-200/50 border border-base-300/40 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="skeleton h-3 w-20 rounded-md" />
                  <div className="skeleton h-4 w-14 rounded-full" />
                </div>
                <div className="skeleton h-4 w-full rounded-md" />
                <div className="skeleton h-8 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
