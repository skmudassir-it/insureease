interface LoadingSkeletonProps {
  count?: number
  className?: string
}

export function LoadingSkeleton({ count = 4, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 border border-zinc-800 rounded-xl animate-pulse">
          <div className="h-4 bg-zinc-800 rounded w-1/3 mb-3" />
          <div className="h-3 bg-zinc-800 rounded w-2/3 mb-2" />
          <div className="h-3 bg-zinc-800 rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 border-b border-zinc-800">
          <div className="h-4 bg-zinc-800 rounded w-1/4" />
          <div className="h-4 bg-zinc-800 rounded w-1/6" />
          <div className="h-4 bg-zinc-800 rounded w-1/6" />
          <div className="h-4 bg-zinc-800 rounded w-1/6 ml-auto" />
        </div>
      ))}
    </div>
  )
}
