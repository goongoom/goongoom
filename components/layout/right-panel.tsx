import type { ReactNode } from "react";

interface RightPanelProps {
  children: ReactNode;
}

export function RightPanel({ children }: RightPanelProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-96 overflow-y-auto border-l border-border bg-background lg:block">
      <div className="p-6">{children}</div>
    </aside>
  );
}
