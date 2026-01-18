import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSettingsSkeleton() {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm max-w-2xl">
      <div className="flex items-center gap-6 mb-8">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div>
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-4 w-12 mb-2" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full rounded-lg mb-2" />
          <Skeleton className="h-10 w-full rounded-lg mb-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-10 w-full rounded-lg mb-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      <Skeleton className="h-10 w-24 rounded-lg mt-8" />
    </div>
  );
}
