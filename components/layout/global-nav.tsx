import { Message01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { NavAuthButtons } from "@/components/auth/auth-buttons"
import { ThemeToggle } from "@/components/theme-toggle"

export function GlobalNav() {
  return (
    <nav
      aria-label="Global navigation"
      className="fixed top-0 z-50 w-full border-border border-b bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link className="flex items-center gap-2" href="/">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sunset-orange text-sunset-orange-foreground shadow-lg shadow-sunset-orange/30">
            <HugeiconsIcon icon={Message01Icon} size={20} strokeWidth={3} />
          </div>
          <span className="font-bold text-foreground text-lg tracking-tight">
            궁금닷컴
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NavAuthButtons />
        </div>
      </div>
    </nav>
  )
}
