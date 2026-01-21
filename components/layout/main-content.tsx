import type { ReactNode } from "react"

interface MainContentProps {
  children: ReactNode
}

export function MainContent({ children }: MainContentProps) {
  return (
    <div className="h-full bg-muted/40 pt-16">
      <div className="mx-auto max-w-3xl p-4 sm:p-6">{children}</div>
    </div>
  )
}
