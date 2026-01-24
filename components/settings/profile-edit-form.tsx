import {
  AnonymousIcon,
  BloggerIcon,
  Cancel01Icon,
  GithubIcon,
  InstagramIcon,
  LockIcon,
  NewTwitterIcon,
  PaintBrushIcon,
  UserIcon,
  UserMultipleIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import { useCallback, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile } from "@/lib/actions/profile"
import type { SignatureColor } from "@/lib/colors/signature-colors"
import { QUESTION_SECURITY_LEVELS } from "@/lib/question-security"
import type { SocialLinkEntry, SocialLinks } from "@/lib/types"
import {
  normalizeHandle,
  normalizeNaverBlogHandle,
  normalizeYoutubeHandle,
} from "@/lib/utils/social-links"
import { SignatureColorPicker } from "./signature-color-picker"

const SECURITY_ICONS: Record<string, typeof AnonymousIcon> = {
  public: UserMultipleIcon,
  login: UserIcon,
  none: AnonymousIcon,
}

type CustomLinkInput = { label: string; handle: string }

const createEmptyCustomLink = (): CustomLinkInput => ({ label: "", handle: "" })

const ensureHandleList = (list: string[]) => (list.length ? list : [""])

const ensureCustomList = (list: CustomLinkInput[]) =>
  list.length ? list : [createEmptyCustomLink()]

const parseInitialSocialLinks = (
  socialLinks: SocialLinks | null | undefined
) => {
  const parsed = {
    instagram: [] as string[],
    twitter: [] as string[],
    youtube: [] as string[],
    github: [] as CustomLinkInput[],
    naverBlog: [] as CustomLinkInput[],
  }

  if (Array.isArray(socialLinks)) {
    socialLinks.forEach((entry) => {
      if (entry.platform === "instagram" && typeof entry.content === "string") {
        parsed.instagram.push(entry.content)
      }
      if (entry.platform === "twitter" && typeof entry.content === "string") {
        parsed.twitter.push(entry.content)
      }
      if (entry.platform === "youtube" && typeof entry.content === "string") {
        parsed.youtube.push(entry.content)
      }
      if (entry.platform === "github") {
        if (typeof entry.content === "string") {
          parsed.github.push({ label: entry.content, handle: entry.content })
        } else {
          parsed.github.push({
            label: entry.content.label,
            handle: entry.content.handle,
          })
        }
      }
      if (entry.platform === "naverBlog") {
        if (typeof entry.content === "string") {
          parsed.naverBlog.push({ label: entry.content, handle: entry.content })
        } else {
          parsed.naverBlog.push({
            label: entry.content.label,
            handle: entry.content.handle,
          })
        }
      }
    })
  }

  return {
    instagram: ensureHandleList(parsed.instagram),
    twitter: ensureHandleList(parsed.twitter),
    youtube: ensureHandleList(parsed.youtube),
    github: ensureCustomList(parsed.github),
    naverBlog: ensureCustomList(parsed.naverBlog),
  }
}

const buildSocialLinksPayload = (data: {
  instagram: string[]
  twitter: string[]
  youtube: string[]
  github: CustomLinkInput[]
  naverBlog: CustomLinkInput[]
}): SocialLinkEntry[] => {
  const links: SocialLinkEntry[] = []

  const addHandleLinks = (
    platform: "instagram" | "twitter" | "youtube",
    values: string[],
    normalize: (value: string) => string
  ) => {
    values.forEach((value) => {
      const handle = normalize(value)
      if (handle) {
        links.push({ platform, content: handle, labelType: "handle" })
      }
    })
  }

  const addCustomLinks = (
    platform: "github" | "naverBlog",
    values: CustomLinkInput[],
    normalize: (value: string) => string
  ) => {
    values.forEach((value) => {
      const handle = normalize(value.handle)
      if (!handle) {
        return
      }
      const label = value.label.trim() || handle
      links.push({
        platform,
        content: { handle, label },
        labelType: "custom",
      })
    })
  }

  addHandleLinks("instagram", data.instagram, normalizeHandle)
  addHandleLinks("twitter", data.twitter, normalizeHandle)
  addHandleLinks("youtube", data.youtube, normalizeYoutubeHandle)
  addCustomLinks("github", data.github, normalizeHandle)
  addCustomLinks("naverBlog", data.naverBlog, normalizeNaverBlogHandle)

  return links
}

const serializeSocialLinks = (links: SocialLinkEntry[]) => JSON.stringify(links)

interface ProfileEditFormProps {
  initialBio: string | null
  initialQuestionSecurityLevel: string
  initialSignatureColor: SignatureColor
  initialSocialLinks: SocialLinks | null
  securityOptions: Record<string, { label: string; description: string }>
}

export function ProfileEditForm({
  initialBio,
  initialQuestionSecurityLevel,
  initialSignatureColor,
  initialSocialLinks,
  securityOptions,
}: ProfileEditFormProps) {
  const t = useTranslations("settings")
  const tErrors = useTranslations("errors")
  const tSocial = useTranslations("social")

  const initialLinks = useMemo(
    () => parseInitialSocialLinks(initialSocialLinks),
    [initialSocialLinks]
  )

  const [bio, setBio] = useState(initialBio || "")
  const [instagramHandles, setInstagramHandles] = useState(
    () => initialLinks.instagram
  )
  const [twitterHandles, setTwitterHandles] = useState(
    () => initialLinks.twitter
  )
  const [youtubeHandles, setYoutubeHandles] = useState(
    () => initialLinks.youtube
  )
  const [githubLinks, setGithubLinks] = useState(() => initialLinks.github)
  const [naverBlogLinks, setNaverBlogLinks] = useState(
    () => initialLinks.naverBlog
  )
  const [securityLevel, setSecurityLevel] = useState(
    initialQuestionSecurityLevel
  )

  const lastSavedBio = useRef(initialBio || "")
  const lastSavedSocialLinks = useRef(
    serializeSocialLinks(buildSocialLinksPayload(initialLinks))
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
    const links = buildSocialLinksPayload({
      instagram: instagramHandles,
      twitter: twitterHandles,
      youtube: youtubeHandles,
      github: githubLinks,
      naverBlog: naverBlogLinks,
    })
    const serialized = serializeSocialLinks(links)

    if (serialized !== lastSavedSocialLinks.current) {
      lastSavedSocialLinks.current = serialized
      saveProfile({ socialLinks: links.length ? links : null })
    }
  }, [
    githubLinks,
    instagramHandles,
    naverBlogLinks,
    twitterHandles,
    youtubeHandles,
    saveProfile,
  ])

  const handleSecurityLevelChange = useCallback(
    (value: string) => {
      setSecurityLevel(value)
      saveProfile({ questionSecurityLevel: value })
    },
    [saveProfile]
  )

  const updateHandleAt = (
    index: number,
    value: string,
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setState((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? value : item))
    )
  }

  const addHandleRow = (
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setState((prev) => [...prev, ""])
  }

  const removeHandleRow = (
    index: number,
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setState((prev) => {
      const next = prev.filter((_, itemIndex) => itemIndex !== index)
      return next.length ? next : [""]
    })
  }

  const updateCustomAt = (
    index: number,
    field: "label" | "handle",
    value: string,
    setState: React.Dispatch<React.SetStateAction<CustomLinkInput[]>>
  ) => {
    setState((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    )
  }

  const addCustomRow = (
    setState: React.Dispatch<React.SetStateAction<CustomLinkInput[]>>
  ) => {
    setState((prev) => [...prev, createEmptyCustomLink()])
  }

  const removeCustomRow = (
    index: number,
    setState: React.Dispatch<React.SetStateAction<CustomLinkInput[]>>
  ) => {
    setState((prev) => {
      const next = prev.filter((_, itemIndex) => itemIndex !== index)
      return next.length ? next : [createEmptyCustomLink()]
    })
  }

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
              onChange={(event) => setBio(event.target.value)}
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
            <div className="space-y-5">
              <Field>
                <FieldLabel className="font-medium text-muted-foreground text-xs">
                  {tSocial("instagramPlaceholder")}
                </FieldLabel>
                <div className="space-y-2">
                  {instagramHandles.map((value, index) => (
                    <div
                      className="flex items-center gap-2"
                      key={`ig-${index}`}
                    >
                      <div className="relative flex-1">
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
                          onBlur={handleSocialLinksBlur}
                          onChange={(event) =>
                            updateHandleAt(
                              index,
                              event.target.value,
                              setInstagramHandles
                            )
                          }
                          placeholder={tSocial("instagramPlaceholder")}
                          value={value}
                        />
                      </div>
                      <Button
                        aria-label={tSocial("remove")}
                        className="shrink-0"
                        onClick={() =>
                          removeHandleRow(index, setInstagramHandles)
                        }
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <HugeiconsIcon className="size-4" icon={Cancel01Icon} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => addHandleRow(setInstagramHandles)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {tSocial("addInstagram")}
                  </Button>
                </div>
              </Field>

              <Field>
                <FieldLabel className="font-medium text-muted-foreground text-xs">
                  {tSocial("twitterPlaceholder")}
                </FieldLabel>
                <div className="space-y-2">
                  {twitterHandles.map((value, index) => (
                    <div
                      className="flex items-center gap-2"
                      key={`tw-${index}`}
                    >
                      <div className="relative flex-1">
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
                          onBlur={handleSocialLinksBlur}
                          onChange={(event) =>
                            updateHandleAt(
                              index,
                              event.target.value,
                              setTwitterHandles
                            )
                          }
                          placeholder={tSocial("twitterPlaceholder")}
                          value={value}
                        />
                      </div>
                      <Button
                        aria-label={tSocial("remove")}
                        className="shrink-0"
                        onClick={() =>
                          removeHandleRow(index, setTwitterHandles)
                        }
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <HugeiconsIcon className="size-4" icon={Cancel01Icon} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => addHandleRow(setTwitterHandles)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {tSocial("addTwitter")}
                  </Button>
                </div>
              </Field>

              <Field>
                <FieldLabel className="font-medium text-muted-foreground text-xs">
                  {tSocial("youtubePlaceholder")}
                </FieldLabel>
                <div className="space-y-2">
                  {youtubeHandles.map((value, index) => (
                    <div
                      className="flex items-center gap-2"
                      key={`yt-${index}`}
                    >
                      <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <HugeiconsIcon
                            className="size-5 text-muted-foreground/60"
                            icon={YoutubeIcon}
                            strokeWidth={2}
                          />
                        </div>
                        <Input
                          autoCapitalize="none"
                          autoCorrect="off"
                          className="min-h-11 rounded-xl border border-border/50 bg-background pl-10 transition-all focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                          onBlur={handleSocialLinksBlur}
                          onChange={(event) =>
                            updateHandleAt(
                              index,
                              event.target.value,
                              setYoutubeHandles
                            )
                          }
                          placeholder={tSocial("youtubePlaceholder")}
                          value={value}
                        />
                      </div>
                      <Button
                        aria-label={tSocial("remove")}
                        className="shrink-0"
                        onClick={() =>
                          removeHandleRow(index, setYoutubeHandles)
                        }
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <HugeiconsIcon className="size-4" icon={Cancel01Icon} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => addHandleRow(setYoutubeHandles)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {tSocial("addYoutube")}
                  </Button>
                </div>
              </Field>

              <Field>
                <FieldLabel className="font-medium text-muted-foreground text-xs">
                  {tSocial("githubPlaceholder")}
                </FieldLabel>
                <div className="space-y-2">
                  {githubLinks.map((value, index) => (
                    <div
                      className="flex flex-col gap-2 sm:flex-row sm:items-center"
                      key={`gh-${index}`}
                    >
                      <Input
                        autoCapitalize="words"
                        className="min-h-11 rounded-xl border border-border/50 bg-background transition-all focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                        onBlur={handleSocialLinksBlur}
                        onChange={(event) =>
                          updateCustomAt(
                            index,
                            "label",
                            event.target.value,
                            setGithubLinks
                          )
                        }
                        placeholder={tSocial("labelPlaceholder")}
                        value={value.label}
                      />
                      <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <HugeiconsIcon
                            className="size-5 text-muted-foreground/60"
                            icon={GithubIcon}
                            strokeWidth={2}
                          />
                        </div>
                        <Input
                          autoCapitalize="none"
                          autoCorrect="off"
                          className="min-h-11 rounded-xl border border-border/50 bg-background pl-10 transition-all focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                          onBlur={handleSocialLinksBlur}
                          onChange={(event) =>
                            updateCustomAt(
                              index,
                              "handle",
                              event.target.value,
                              setGithubLinks
                            )
                          }
                          placeholder={tSocial("githubPlaceholder")}
                          value={value.handle}
                        />
                      </div>
                      <Button
                        aria-label={tSocial("remove")}
                        className="self-start sm:self-auto"
                        onClick={() => removeCustomRow(index, setGithubLinks)}
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <HugeiconsIcon className="size-4" icon={Cancel01Icon} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => addCustomRow(setGithubLinks)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {tSocial("addGithub")}
                  </Button>
                </div>
              </Field>

              <Field>
                <FieldLabel className="font-medium text-muted-foreground text-xs">
                  {tSocial("naverBlogPlaceholder")}
                </FieldLabel>
                <div className="space-y-2">
                  {naverBlogLinks.map((value, index) => (
                    <div
                      className="flex flex-col gap-2 sm:flex-row sm:items-center"
                      key={`nv-${index}`}
                    >
                      <Input
                        autoCapitalize="words"
                        className="min-h-11 rounded-xl border border-border/50 bg-background transition-all focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                        onBlur={handleSocialLinksBlur}
                        onChange={(event) =>
                          updateCustomAt(
                            index,
                            "label",
                            event.target.value,
                            setNaverBlogLinks
                          )
                        }
                        placeholder={tSocial("labelPlaceholder")}
                        value={value.label}
                      />
                      <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <HugeiconsIcon
                            className="size-5 text-muted-foreground/60"
                            icon={BloggerIcon}
                            strokeWidth={2}
                          />
                        </div>
                        <Input
                          autoCapitalize="none"
                          autoCorrect="off"
                          className="min-h-11 rounded-xl border border-border/50 bg-background pl-10 transition-all focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                          onBlur={handleSocialLinksBlur}
                          onChange={(event) =>
                            updateCustomAt(
                              index,
                              "handle",
                              event.target.value,
                              setNaverBlogLinks
                            )
                          }
                          placeholder={tSocial("naverBlogPlaceholder")}
                          value={value.handle}
                        />
                      </div>
                      <Button
                        aria-label={tSocial("remove")}
                        className="self-start sm:self-auto"
                        onClick={() =>
                          removeCustomRow(index, setNaverBlogLinks)
                        }
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <HugeiconsIcon className="size-4" icon={Cancel01Icon} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => addCustomRow(setNaverBlogLinks)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {tSocial("addNaverBlog")}
                  </Button>
                </div>
              </Field>
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
