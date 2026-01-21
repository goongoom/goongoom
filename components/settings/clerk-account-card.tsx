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
      className="mb-6 w-full rounded-xl border border-border bg-card p-6 text-left transition-colors hover:bg-muted/50 active:bg-muted"
      onClick={() => openUserProfile()}
      type="button"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-medium text-base text-foreground">
            {t("accountSettings")}
          </h3>
          <p className="text-muted-foreground text-xs">
            {t("accountSettingsDescription")}
          </p>
        </div>
        <Avatar className="size-12">
          {user?.imageUrl ? (
            <AvatarImage alt={displayName} src={user.imageUrl} />
          ) : null}
          <AvatarFallback className="rounded-xl">
            {displayName[0] || "?"}
          </AvatarFallback>
        </Avatar>
      </div>
    </button>
  )
}
