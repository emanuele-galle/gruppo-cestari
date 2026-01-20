import { Skeleton } from '@/components/ui/skeleton';

export default function BandiLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero skeleton */}
      <div className="bg-primary py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Skeleton className="h-12 w-64 bg-white/20 mb-4" />
          <Skeleton className="h-6 w-96 max-w-full bg-white/10" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Bandi grid skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-7 w-full max-w-2xl" />
                  <Skeleton className="h-4 w-full max-w-xl" />
                  <div className="flex flex-wrap gap-4 pt-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex justify-center gap-2 mt-8">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}
