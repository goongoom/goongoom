import { Card, CardPanel } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileHeaderSkeleton() {
  return (
    <Card className="mb-6">
      <CardPanel className="flex items-start gap-6">
        <Skeleton className="size-24 rounded-full ring-2 ring-ring" />
        <div className="flex-1 space-y-3 text-left">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-6 w-full max-w-md" />
        </div>
      </CardPanel>
      
      <CardPanel className="flex flex-wrap gap-4">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="size-9 rounded-full sm:size-8" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="size-9 rounded-full sm:size-8" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardPanel>
    </Card>
  );
}
