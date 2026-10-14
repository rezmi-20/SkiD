export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
        <div className="space-y-2">
          <div className="h-3 w-28 bg-surface-container rounded-md" />
          <div className="h-8 w-64 bg-surface-container-high rounded-lg" />
        </div>
        <div className="h-9 w-28 bg-surface-container rounded-lg" />
      </div>

      {/* Grid Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {/* Card 1 */}
          <div className="h-36 bg-surface-container-low rounded-2xl border border-outline-variant/30 p-5 space-y-3">
            <div className="h-4 w-1/3 bg-surface-container rounded" />
            <div className="h-3 w-full bg-surface-container/70 rounded" />
            <div className="h-3 w-4/5 bg-surface-container/70 rounded" />
          </div>
          {/* Card 2 / Chat thread */}
          <div className="h-72 bg-surface-container-low rounded-2xl border border-outline-variant/30 p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-4 w-1/4 bg-surface-container rounded" />
              <div className="h-12 w-3/5 bg-surface-container rounded-2xl" />
              <div className="h-12 w-1/2 ml-auto bg-surface-container-high rounded-2xl" />
            </div>
            <div className="h-12 w-full bg-surface-container-lowest rounded-xl border border-outline-variant/40" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-4">
          <div className="h-44 bg-surface-container-low rounded-2xl border border-outline-variant/30 p-5 space-y-3">
            <div className="h-4 w-1/2 bg-surface-container rounded" />
            <div className="h-9 w-full bg-surface-container rounded-lg" />
            <div className="h-9 w-full bg-surface-container rounded-lg" />
          </div>
          <div className="h-32 bg-surface-container-low rounded-2xl border border-outline-variant/30 p-5 space-y-2">
            <div className="h-3 w-1/3 bg-surface-container rounded" />
            <div className="h-3 w-full bg-surface-container/70 rounded" />
            <div className="h-3 w-2/3 bg-surface-container/70 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
