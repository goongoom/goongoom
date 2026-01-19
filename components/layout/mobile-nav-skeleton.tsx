import { Skeleton } from "@/components/ui/skeleton";

export function MobileNavSkeleton() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex flex-col items-center gap-1 px-3 py-2">
            <Skeleton className="size-5 rounded-md" />
            <Skeleton className="h-3 w-12 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
