import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 border-r border-border bg-background lg:block lg:w-80">
      <div className="p-6">
        <Skeleton className="h-8 w-28 mb-8 rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-full">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
