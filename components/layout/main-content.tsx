import type { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="min-h-screen flex-1 overflow-y-auto bg-muted/40">
      <div className="mx-auto max-w-3xl p-4 pb-24 sm:p-6 sm:pb-24 lg:pb-6">
        {children}
      </div>
    </main>
  );
}
