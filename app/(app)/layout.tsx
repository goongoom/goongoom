import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarSkeleton } from "@/components/layout/sidebar-skeleton";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileNavSkeleton } from "@/components/layout/mobile-nav-skeleton";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
      {children}
      <Suspense fallback={<MobileNavSkeleton />}>
        <MobileNav />
      </Suspense>
    </div>
  );
}
