import { Skeleton } from "@/components/ui/skeleton";

export function QuestionFormSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <Skeleton className="h-6 w-40 mb-4" />
      <Skeleton className="h-32 w-full rounded-lg mb-4" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}
