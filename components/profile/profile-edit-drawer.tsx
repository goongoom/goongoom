"use client"

import {
  AnonymousIcon,
  InstagramIcon,
  Link01Icon,
  LockIcon,
  NewTwitterIcon,
  PencilEdit01Icon,
  UserIcon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { isEmpty } from "es-toolkit/compat"
import { useTranslations } from "next-intl"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { updateProfile } from "@/lib/actions/profile"
import { QUESTION_SECURITY_LEVELS } from "@/lib/question-security"
import type { SocialLinks } from "@/lib/types"
import { normalizeHandle } from "@/lib/utils/social-links"

const SECURITY_ICONS: Record<string, typeof AnonymousIcon> = {
  public: UserMultipleIcon,
  login: UserIcon,
  none: AnonymousIcon,
}

const DEBOUNCE_MS = 500

interface ProfileEditDrawerProps {
  initialBio: string | null
  initialInstagramHandle: string
  initialTwitterHandle: string
  initialQuestionSecurityLevel: string
  securityOptions: Record<string, { label: string; description: string }>
}

export function ProfileEditDrawer({
  initialBio,
  initialInstagramHandle,
  initialTwitterHandle,
  initialQuestionSecurityLevel,
  securityOptions,
}: ProfileEditDrawerProps) {
  const t = useTranslations("settings")
  const tProfile = useTranslations("profile")

  const [bio, setBio] = useState(initialBio || "")
  const [instagram, setInstagram] = useState(initialInstagramHandle)
  const [twitter, setTwitter] = useState(initialTwitterHandle)
  const [securityLevel, setSecurityLevel] = useState(
    initialQuestionSecurityLevel
  )

  const saveProfile = useCallback(
    (data: {
      bio?: string | null
      socialLinks?: SocialLinks | null
      questionSecurityLevel?: string
    }) => {
      toast.promise(updateProfile(data), {
        loading: t("saving"),
        success: t("profileUpdated"),
        error: (err) => err?.message || "Error",
      })
    },
    [t]
  )

  const debouncedSaveBio = useDebouncedCallback((value: string) => {
    saveProfile({ bio: value.trim() || null })
  }, DEBOUNCE_MS)

  const debouncedSaveSocialLinks = useDebouncedCallback(
    (instagramValue: string, twitterValue: string) => {
      const normalizedInstagram = normalizeHandle(instagramValue)
      const normalizedTwitter = normalizeHandle(twitterValue)
      const links: SocialLinks = {}
      if (normalizedInstagram) {
        links.instagram = normalizedInstagram
      }
      if (normalizedTwitter) {
        links.twitter = normalizedTwitter
      }
      saveProfile({
        socialLinks: isEmpty(links) ? null : links,
      })
    },
    DEBOUNCE_MS
  )

  const handleBioChange = useCallback(
    (value: string) => {
      setBio(value)
      debouncedSaveBio(value)
    },
    [debouncedSaveBio]
  )

  const handleInstagramChange = useCallback(
    (value: string) => {
      setInstagram(value)
      debouncedSaveSocialLinks(value, twitter)
    },
    [debouncedSaveSocialLinks, twitter]
  )

  const handleTwitterChange = useCallback(
    (value: string) => {
      setTwitter(value)
      debouncedSaveSocialLinks(instagram, value)
    },
    [debouncedSaveSocialLinks, instagram]
  )

  const handleSecurityLevelChange = useCallback(
    (value: string) => {
      setSecurityLevel(value)
      saveProfile({ questionSecurityLevel: value })
    },
    [saveProfile]
  )

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="flex-1" variant="outline">
          <HugeiconsIcon className="mr-2 size-4" icon={PencilEdit01Icon} />
          {tProfile("edit")}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader className="text-center sm:text-left">
            <DrawerTitle className="text-xl">{tProfile("edit")}</DrawerTitle>
            <DrawerDescription>{t("profileSettings")}</DrawerDescription>
          </DrawerHeader>

          <div className="max-h-[85vh] animate-fade-in space-y-8 overflow-y-auto px-4 pb-8">
            <div className="space-y-4 rounded-2xl border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center gap-2 pb-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-electric-blue/10 text-electric-blue">
                  <HugeiconsIcon className="size-4" icon={UserIcon} />
                </div>
                <h3 className="font-semibold text-foreground text-sm">
                  {t("profileSettings")}
                </h3>
              </div>

              <Field>
                <FieldLabel className="font-medium text-sm" htmlFor="bio">
                  {t("bioLabel")}
                </FieldLabel>
                <Textarea
                  className="min-h-24 resize-none rounded-xl border border-border/50 bg-background transition-all focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20"
                  id="bio"
                  name="bio"
                  onChange={(e) => handleBioChange(e.target.value)}
                  placeholder={t("bioPlaceholder")}
                  rows={3}
                  value={bio}
                />
              </Field>
            </div>

            <div className="space-y-4 rounded-2xl border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center gap-2 pb-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-neon-pink/10 text-neon-pink">
                  <HugeiconsIcon className="size-4" icon={Link01Icon} />
                </div>
                <h3 className="font-semibold text-foreground text-sm">
                  {t("socialLinks")}
                </h3>
              </div>

              <div className="grid gap-4">
                <Field>
                  <FieldLabel
                    className="font-medium text-sm"
                    htmlFor="instagram"
                  >
                    Instagram
                  </FieldLabel>
                  <FieldContent>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <HugeiconsIcon
                          className="size-5 text-muted-foreground/60"
                          icon={InstagramIcon}
                          strokeWidth={2}
                        />
                      </div>
                      <Input
                        autoCapitalize="none"
                        autoCorrect="off"
                        className="min-h-12 rounded-xl border border-border/50 bg-background pl-10 transition-all focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20"
                        id="instagram"
                        name="instagram"
                        onChange={(e) => handleInstagramChange(e.target.value)}
                        placeholder="username"
                        value={instagram}
                      />
                    </div>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel className="font-medium text-sm" htmlFor="twitter">
                    Twitter / X
                  </FieldLabel>
                  <FieldContent>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <HugeiconsIcon
                          className="size-5 text-muted-foreground/60"
                          icon={NewTwitterIcon}
                          strokeWidth={2}
                        />
                      </div>
                      <Input
                        autoCapitalize="none"
                        autoCorrect="off"
                        className="min-h-12 rounded-xl border border-border/50 bg-background pl-10 transition-all focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20"
                        id="twitter"
                        name="twitter"
                        onChange={(e) => handleTwitterChange(e.target.value)}
                        placeholder="username"
                        value={twitter}
                      />
                    </div>
                  </FieldContent>
                </Field>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center gap-2 pb-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-lime/10 text-lime">
                  <HugeiconsIcon className="size-4" icon={LockIcon} />
                </div>
                <h3 className="font-semibold text-foreground text-sm">
                  {t("anonymousRestriction")}
                </h3>
              </div>

              <Field>
                <FieldContent>
                  <RadioGroup
                    className="w-full space-y-3"
                    onValueChange={handleSecurityLevelChange}
                    value={securityLevel}
                  >
                    {QUESTION_SECURITY_LEVELS.map((level) => {
                      const option = securityOptions[level]
                      const IconComponent =
                        SECURITY_ICONS[level] || AnonymousIcon
                      if (!option) {
                        return null
                      }
                      return (
                        <Label
                          className="group relative flex cursor-pointer items-start gap-3 rounded-xl border border-border/50 bg-background p-4 transition-all hover:border-lime/50 hover:bg-lime/5 has-[data-state=checked]:border-lime has-[data-state=checked]:bg-lime/5 has-[data-state=checked]:ring-2 has-[data-state=checked]:ring-lime/20"
                          key={level}
                        >
                          <RadioGroupItem
                            className="mt-1 border-muted-foreground/30 text-lime data-[state=checked]:border-lime data-[state=checked]:text-lime"
                            id={`qsl-${level}`}
                            value={level}
                          />
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50 text-muted-foreground transition-colors group-has-[data-state=checked]:from-lime group-has-[data-state=checked]:to-lime/80 group-has-[data-state=checked]:text-lime-foreground">
                            <HugeiconsIcon
                              className="size-5"
                              icon={IconComponent}
                              strokeWidth={2}
                            />
                          </div>
                          <div className="flex flex-1 flex-col gap-1">
                            <p className="font-semibold text-foreground text-sm group-has-[data-state=checked]:text-lime-foreground">
                              {option.label}
                            </p>
                            <p className="text-muted-foreground text-xs leading-relaxed group-has-[data-state=checked]:text-lime-foreground/80">
                              {option.description}
                            </p>
                          </div>
                        </Label>
                      )
                    })}
                  </RadioGroup>
                </FieldContent>
              </Field>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
