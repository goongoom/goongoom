"use client"

import {
  AnonymousIcon,
  InstagramIcon,
  LockIcon,
  NewTwitterIcon,
  PaintBrushIcon,
  UserIcon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { isEmpty } from "es-toolkit/compat"
import { useTranslations } from "next-intl"
import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile } from "@/lib/actions/profile"
import type { SignatureColor } from "@/lib/colors/signature-colors"
import { QUESTION_SECURITY_LEVELS } from "@/lib/question-security"
import type { SocialLinks } from "@/lib/types"
import { normalizeHandle } from "@/lib/utils/social-links"
import { SignatureColorPicker } from "./signature-color-picker"

const SECURITY_ICONS: Record<string, typeof AnonymousIcon> = {
  public: UserMultipleIcon,
  login: UserIcon,
  none: AnonymousIcon,
}

interface ProfileEditFormProps {
  initialBio: string | null
  initialInstagramHandle: string
  initialTwitterHandle: string
  initialQuestionSecurityLevel: string
  initialSignatureColor: SignatureColor
  securityOptions: Record<string, { label: string; description: string }>
}

export function ProfileEditForm({
  initialBio,
  initialInstagramHandle,
  initialTwitterHandle,
  initialQuestionSecurityLevel,
  initialSignatureColor,
  securityOptions,
}: ProfileEditFormProps) {
  const t = useTranslations("settings")
  const tErrors = useTranslations("errors")

  const [bio, setBio] = useState(initialBio || "")
  const [instagram, setInstagram] = useState(initialInstagramHandle)
  const [twitter, setTwitter] = useState(initialTwitterHandle)
  const [securityLevel, setSecurityLevel] = useState(
    initialQuestionSecurityLevel
  )

  const lastSavedBio = useRef(initialBio || "")
  const lastSavedInstagram = useRef(initialInstagramHandle)
  const lastSavedTwitter = useRef(initialTwitterHandle)

  const saveProfile = useCallback(
    (data: {
      bio?: string | null
      socialLinks?: SocialLinks | null
      questionSecurityLevel?: string
    }) => {
      toast.promise(updateProfile(data), {
        loading: t("saving"),
        success: t("profileUpdated"),
        error: (err) => err?.message || tErrors("genericError"),
      })
    },
    [t, tErrors]
  )

  const handleBioBlur = useCallback(() => {
    const trimmedBio = bio.trim()
    if (trimmedBio !== lastSavedBio.current) {
      lastSavedBio.current = trimmedBio
      saveProfile({ bio: trimmedBio || null })
    }
  }, [bio, saveProfile])

  const handleSocialLinksBlur = useCallback(() => {
    const normalizedInstagram = normalizeHandle(instagram)
    const normalizedTwitter = normalizeHandle(twitter)

    if (
      normalizedInstagram !== lastSavedInstagram.current ||
      normalizedTwitter !== lastSavedTwitter.current
    ) {
      lastSavedInstagram.current = normalizedInstagram
      lastSavedTwitter.current = normalizedTwitter

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
    }
  }, [instagram, twitter, saveProfile])

  const handleSecurityLevelChange = useCallback(
    (value: string) => {
      setSecurityLevel(value)
      saveProfile({ questionSecurityLevel: value })
    },
    [saveProfile]
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald/10 text-emerald">
              <HugeiconsIcon className="size-4" icon={UserIcon} />
            </div>
            <h3 className="font-semibold text-foreground text-sm">
              {t("profileSettings")}
            </h3>
          </div>

          <Field>
            <FieldLabel
              className="font-medium text-muted-foreground text-xs"
              htmlFor="bio"
            >
              {t("bioLabel")}
            </FieldLabel>
            <Textarea
              className="min-h-24 resize-none rounded-xl border border-border/50 bg-background transition-all focus:border-emerald focus:ring-2 focus:ring-emerald/20"
              id="bio"
              name="bio"
              onBlur={handleBioBlur}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t("bioPlaceholder")}
              rows={3}
              value={bio}
            />
            <div className="flex justify-end">
              <span className="font-medium text-muted-foreground text-xs">
                {bio.length}
              </span>
            </div>
          </Field>

          <div className="border-border/30 border-t pt-4">
            <p className="mb-3 font-medium text-muted-foreground text-xs">
              {t("socialLinks")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative space-y-1">
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
                  className="min-h-11 rounded-xl border border-border/50 bg-background pl-10 transition-all focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                  id="instagram"
                  name="instagram"
                  onBlur={handleSocialLinksBlur}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Instagram"
                  value={instagram}
                />
                <div className="flex justify-end">
                  <span className="font-medium text-muted-foreground text-xs">
                    {instagram.length}
                  </span>
                </div>
              </div>

              <div className="relative space-y-1">
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
                  className="min-h-11 rounded-xl border border-border/50 bg-background pl-10 transition-all focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                  id="twitter"
                  name="twitter"
                  onBlur={handleSocialLinksBlur}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="Twitter"
                  value={twitter}
                />
                <div className="flex justify-end">
                  <span className="font-medium text-muted-foreground text-xs">
                    {twitter.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald/10 text-emerald">
              <HugeiconsIcon className="size-4" icon={LockIcon} />
            </div>
            <h3 className="font-semibold text-foreground text-sm">
              {t("anonymousRestriction")}
            </h3>
          </div>

          <RadioGroup
            className="w-full space-y-2"
            onValueChange={handleSecurityLevelChange}
            value={securityLevel}
          >
            {QUESTION_SECURITY_LEVELS.map((level) => {
              const option = securityOptions[level]
              const IconComponent = SECURITY_ICONS[level] || AnonymousIcon
              if (!option) {
                return null
              }
              return (
                <Label
                  className="group relative flex cursor-pointer items-start gap-3 rounded-xl border-2 border-transparent bg-muted/30 p-3 transition-all hover:border-border hover:bg-muted/50 has-data-checked:border-emerald/50 has-data-checked:bg-emerald/5"
                  key={level}
                >
                  <RadioGroupItem
                    className="pointer-events-none absolute opacity-0"
                    id={`qsl-${level}`}
                    value={level}
                  />
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors group-has-data-checked:bg-emerald/20 group-has-data-checked:text-emerald">
                    <HugeiconsIcon
                      className="size-5"
                      icon={IconComponent}
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <p className="font-semibold text-foreground text-sm transition-colors group-has-data-checked:text-foreground">
                      {option.label}
                    </p>
                    <p className="text-muted-foreground text-xs leading-relaxed transition-colors group-has-data-checked:text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </Label>
              )
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald/10 text-emerald">
              <HugeiconsIcon className="size-4" icon={PaintBrushIcon} />
            </div>
            <h3 className="font-semibold text-foreground text-sm">
              {t("signatureColor")}
            </h3>
          </div>

          <SignatureColorPicker
            currentColor={initialSignatureColor}
            labels={{
              saving: t("saving"),
              saved: t("signatureColorUpdated"),
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
