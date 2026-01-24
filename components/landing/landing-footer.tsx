import { Ultralink } from "@/components/navigation/ultralink"
import { Logo } from "@/components/ui/logo"

interface LandingFooterProps {
  tNav: (key: string) => string
  tFooter: (key: string) => string
  tLegal: (key: string) => string
}

export function LandingFooter({ tNav, tFooter, tLegal }: LandingFooterProps) {
  return (
    <footer className="border-border border-t bg-background py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="font-semibold text-muted-foreground text-sm">
            {tNav("appName")}
          </span>
        </div>
        <div className="flex gap-6 text-muted-foreground text-sm">
          <Ultralink
            className="inline-flex min-h-11 items-center rounded transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            href="/terms"
          >
            {tFooter("terms")}
          </Ultralink>
          <Ultralink
            className="inline-flex min-h-11 items-center rounded transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            href="/privacy"
          >
            {tFooter("privacy")}
          </Ultralink>
          <Ultralink
            className="inline-flex min-h-11 items-center rounded transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            href="/contact"
          >
            {tFooter("contact")}
          </Ultralink>
        </div>
        <div className="text-muted-foreground text-sm">
          {tLegal("copyright")}
        </div>
      </div>
    </footer>
  )
}
