import { Skeleton } from "@/components/ui/skeleton";

export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
      <div className="flex items-start gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-4 w-full max-w-md mb-2" />
          <Skeleton className="h-4 w-2/3 max-w-md" />
        </div>
      </div>
    </div>
  );
}
