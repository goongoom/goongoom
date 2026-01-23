"use client"

import { useClerk, useUser } from "@clerk/nextjs"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AccountSettingsButton() {
  const t = useTranslations("settings")
  const { openUserProfile } = useClerk()
  const { user } = useUser()

  const displayName = user?.firstName || user?.username || "?"

  return (
    <button
      className="group flex w-full items-center gap-4 rounded-2xl bg-card p-5 text-left ring-1 ring-foreground/10 transition-all hover:bg-accent/50 hover:ring-electric-blue/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
      onClick={() => openUserProfile()}
      type="button"
    >
      <Avatar className="size-12 shrink-0 ring-2 ring-electric-blue/20">
        {user?.imageUrl && (
          <AvatarImage alt={displayName} src={user.imageUrl} />
        )}
        <AvatarFallback className="bg-electric-blue/10 font-semibold text-electric-blue">
          {displayName[0] || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-foreground">{displayName}</h3>
        <p className="truncate text-muted-foreground text-sm">
          {t("accountSettingsDescription")}
        </p>
      </div>
      <HugeiconsIcon
        className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-electric-blue"
        icon={ArrowRight01Icon}
        strokeWidth={2}
      />
    </button>
  )
}
