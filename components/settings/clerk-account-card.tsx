"use client"

import { useClerk, useUser } from "@clerk/nextjs"
import { useTranslations } from "next-intl"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ClerkAccountCard() {
  const t = useTranslations("settings")
  const { openUserProfile } = useClerk()
  const { user } = useUser()

  const displayName = user?.fullName || user?.username || "?"

  return (
    <button
      className="group min-h-11 w-full rounded-2xl border border-border bg-gradient-to-br from-electric-blue/5 to-purple/5 p-6 text-left transition-all hover:scale-[1.01] hover:border-electric-blue/30 hover:shadow-lg active:scale-[0.99]"
      onClick={() => openUserProfile()}
      type="button"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-base text-foreground">
            {t("accountSettings")}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("accountSettingsDescription")}
          </p>
        </div>
        <Avatar className="size-14 shrink-0 transition-transform group-hover:scale-105">
          {user?.imageUrl ? (
            <AvatarImage alt={displayName} src={user.imageUrl} />
          ) : null}
          <AvatarFallback className="rounded-2xl bg-electric-blue font-semibold text-electric-blue-foreground">
            {displayName[0] || "?"}
          </AvatarFallback>
        </Avatar>
      </div>
    </button>
  )
}
