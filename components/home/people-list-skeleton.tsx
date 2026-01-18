import { Skeleton } from "@/components/ui/skeleton";

export function PeopleListSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-32" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-[62px] w-[62px] rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
