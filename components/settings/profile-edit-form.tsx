'use client'

import { useAuth } from '@clerk/nextjs'
import { AnonymousIcon, Cancel01Icon, LockIcon, PaintBrushIcon, UserIcon, UserMultipleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { SiGithub, SiInstagram, SiNaver, SiX, SiYoutube } from '@icons-pack/react-simple-icons'
import { useAction, useMutation } from 'convex/react'
import { useTranslations } from 'next-intl'
import { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/convex/_generated/api'
import type { SignatureColor } from '@/lib/colors/signature-colors'
import { QUESTION_SECURITY_LEVELS } from '@/lib/question-security'
import type { SocialLinkEntry, SocialLinks } from '@/lib/types'
import { normalizeHandle, normalizeNaverBlogHandle, normalizeYoutubeHandle } from '@/lib/utils/social-links'
import { SignatureColorPicker } from './signature-color-picker'

const SECURITY_ICONS: Record<string, typeof AnonymousIcon> = {
  public: UserMultipleIcon,
  login: UserIcon,
  none: AnonymousIcon,
}

interface HandleRow {
  id: string
  value: string
}

interface CustomLinkRow {
  id: string
  label: string
  handle: string
}

const createId = () => Math.random().toString(36).slice(2, 10)

const createHandleRow = (value = ''): HandleRow => ({
  id: createId(),
  value,
})

const createCustomRow = (label = '', handle = ''): CustomLinkRow => ({
  id: createId(),
  label,
  handle,
})

const ensureHandleList = (list: HandleRow[]) => (list.length ? list : [createHandleRow()])

const ensureCustomList = (list: CustomLinkRow[]) => (list.length ? list : [createCustomRow()])

const extractHandle = (content: string | { handle: string; label?: string }): string =>
  typeof content === 'string' ? content : content.handle

const extractCustom = (content: string | { handle: string; label?: string }): { label: string; handle: string } =>
  typeof content === 'string'
    ? { label: content, handle: content }
    : { label: content.label ?? content.handle, handle: content.handle }

const parseInitialSocialLinks = (socialLinks: SocialLinks | null | undefined) => {
  const instagram: HandleRow[] = []
  const twitter: HandleRow[] = []
  const youtube: HandleRow[] = []
  const github: CustomLinkRow[] = []
  const naverBlog: CustomLinkRow[] = []

  if (Array.isArray(socialLinks)) {
    for (const entry of socialLinks) {
      const { platform, content } = entry
      switch (platform) {
        case 'instagram':
          instagram.push(createHandleRow(extractHandle(content)))
          break
        case 'twitter':
          twitter.push(createHandleRow(extractHandle(content)))
          break
        case 'youtube':
          youtube.push(createHandleRow(extractHandle(content)))
          break
        case 'github': {
          const { label, handle } = extractCustom(content)
          github.push(createCustomRow(label, handle))
          break
        }
        case 'naverBlog': {
          const { label, handle } = extractCustom(content)
          naverBlog.push(createCustomRow(label, handle))
          break
        }
        default:
          break
      }
    }
  }

  return {
    instagram: ensureHandleList(instagram),
    twitter: ensureHandleList(twitter),
    youtube: ensureHandleList(youtube),
    github: ensureCustomList(github),
    naverBlog: ensureCustomList(naverBlog),
  }
}

const buildSocialLinksPayload = (data: {
  instagram: HandleRow[]
  twitter: HandleRow[]
  youtube: HandleRow[]
  github: CustomLinkRow[]
  naverBlog: CustomLinkRow[]
}): SocialLinkEntry[] => {
  const links: SocialLinkEntry[] = []

  const addHandleLinks = (
    platform: 'instagram' | 'twitter' | 'youtube',
    values: HandleRow[],
    normalize: (value: string) => string
  ) => {
    for (const value of values) {
      const handle = normalize(value.value)
      if (handle) {
        links.push({ platform, content: handle, labelType: 'handle' })
      }
    }
  }

  const addCustomLinks = (
    platform: 'github' | 'naverBlog',
    values: CustomLinkRow[],
    normalize: (value: string) => string
  ) => {
    for (const value of values) {
      const handle = normalize(value.handle)
      if (!handle) {
        continue
      }
      const label = value.label.trim() || handle
      links.push({
        platform,
        content: { handle, label },
        labelType: 'custom',
      })
    }
  }

  addHandleLinks('instagram', data.instagram, normalizeHandle)
  addHandleLinks('twitter', data.twitter, normalizeHandle)
  addHandleLinks('youtube', data.youtube, normalizeYoutubeHandle)
  addCustomLinks('github', data.github, normalizeHandle)
  addCustomLinks('naverBlog', data.naverBlog, normalizeNaverBlogHandle)

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
  const t = useTranslations('settings')
  const tErrors = useTranslations('errors')
  const tSocial = useTranslations('social')
  const { userId } = useAuth()
  const updateProfile = useMutation(api.users.updateProfile)
  const fetchNaverBlogTitleAction = useAction(api.users.fetchNaverBlogTitle)

  const initialLinks = useMemo(() => parseInitialSocialLinks(initialSocialLinks), [initialSocialLinks])

  const [bio, setBio] = useState(initialBio || '')
  const [instagramRows, setInstagramRows] = useState(() => initialLinks.instagram)
  const [twitterRows, setTwitterRows] = useState(() => initialLinks.twitter)
  const [youtubeRows, setYoutubeRows] = useState(() => initialLinks.youtube)
  const [githubRows, setGithubRows] = useState(() => initialLinks.github)
  const [naverBlogRows, setNaverBlogRows] = useState(() => initialLinks.naverBlog)
  const [securityLevel, setSecurityLevel] = useState(initialQuestionSecurityLevel)

  const lastSavedBio = useRef(initialBio || '')
  const lastSavedSocialLinks = useRef(serializeSocialLinks(buildSocialLinksPayload(initialLinks)))

  const saveProfile = useCallback(
    (data: { bio?: string | null; socialLinks?: SocialLinks | null; questionSecurityLevel?: string }) => {
      if (!userId) return
      toast.promise(updateProfile({ clerkId: userId, ...data }), {
        loading: t('saving'),
        success: t('profileUpdated'),
        error: (err) => err?.message || tErrors('genericError'),
      })
    },
    [t, tErrors, userId, updateProfile]
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
      instagram: instagramRows,
      twitter: twitterRows,
      youtube: youtubeRows,
      github: githubRows,
      naverBlog: naverBlogRows,
    })
    const serialized = serializeSocialLinks(links)

    if (serialized !== lastSavedSocialLinks.current) {
      lastSavedSocialLinks.current = serialized
      saveProfile({ socialLinks: links.length ? links : null })
    }
  }, [githubRows, instagramRows, naverBlogRows, twitterRows, youtubeRows, saveProfile])

  const handleSecurityLevelChange = useCallback(
    (value: string) => {
      setSecurityLevel(value)
      saveProfile({ questionSecurityLevel: value })
    },
    [saveProfile]
  )

  const updateHandleAt = (id: string, value: string, setState: React.Dispatch<React.SetStateAction<HandleRow[]>>) => {
    setState((prev) => prev.map((item) => (item.id === id ? { ...item, value } : item)))
  }

  const addHandleRow = (setState: React.Dispatch<React.SetStateAction<HandleRow[]>>) => {
    setState((prev) => [...prev, createHandleRow()])
  }

  const removeHandleRow = (id: string, setState: React.Dispatch<React.SetStateAction<HandleRow[]>>) => {
    setState((prev) => {
      const next = prev.filter((item) => item.id !== id)
      return next.length ? next : [createHandleRow()]
    })
  }

  const updateCustomAt = (
    id: string,
    field: 'label' | 'handle',
    value: string,
    setState: React.Dispatch<React.SetStateAction<CustomLinkRow[]>>
  ) => {
    setState((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const addCustomRow = (setState: React.Dispatch<React.SetStateAction<CustomLinkRow[]>>) => {
    setState((prev) => [...prev, createCustomRow()])
  }

  const removeCustomRow = (id: string, setState: React.Dispatch<React.SetStateAction<CustomLinkRow[]>>) => {
    setState((prev) => {
      const next = prev.filter((item) => item.id !== id)
      return next.length ? next : [createCustomRow()]
    })
  }

  const handleNaverBlogHandleBlur = useCallback(
    async (rowId: string, handle: string) => {
      const normalizedHandle = normalizeNaverBlogHandle(handle)
      if (!normalizedHandle) {
        handleSocialLinksBlur()
        return
      }
      try {
        const title = await fetchNaverBlogTitleAction({ handle: normalizedHandle })
        if (title && title !== normalizedHandle) {
          setNaverBlogRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, label: title } : row)))
        }
      } catch {}
      handleSocialLinksBlur()
    },
    [handleSocialLinksBlur, fetchNaverBlogTitleAction]
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald/10 text-emerald">
              <HugeiconsIcon className="size-4" icon={UserIcon} />
            </div>
            <h3 className="font-semibold text-foreground text-sm">{t('profileSettings')}</h3>
          </div>

          <Field>
            <FieldLabel className="font-medium text-muted-foreground text-xs" htmlFor="bio">
              {t('bioLabel')}
            </FieldLabel>
            <Textarea
              className="min-h-24 resize-none rounded-xl border border-border/50 bg-background transition-all focus:border-emerald focus:ring-2 focus:ring-emerald/20"
              id="bio"
              name="bio"
              onBlur={handleBioBlur}
              onChange={(event) => setBio(event.target.value)}
              placeholder={t('bioPlaceholder')}
              rows={3}
              value={bio}
            />
            <div className="flex justify-end">
              <span className="font-medium text-muted-foreground text-xs">{bio.length}</span>
            </div>
          </Field>

          <div className="border-border/30 border-t pt-4">
            <p className="mb-3 font-medium text-muted-foreground text-xs">{t('socialLinks')}</p>
            <div className="space-y-5">
              <Field>
                <FieldLabel className="font-medium text-muted-foreground text-xs">
                  {tSocial('instagramPlaceholder')}
                </FieldLabel>
                <div className="space-y-2">
                  {instagramRows.map((row) => (
                    <div className="flex items-center gap-2" key={row.id}>
                      <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <SiInstagram className="size-5 text-muted-foreground/60" />
                        </div>
                        <Input
                          autoCapitalize="none"
                          autoCorrect="off"
                          className="min-h-11 rounded-xl border border-border/50 bg-background pl-10 transition-all focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                          onBlur={handleSocialLinksBlur}
                          onChange={(event) => updateHandleAt(row.id, event.target.value, setInstagramRows)}
                          placeholder={tSocial('instagramPlaceholder')}
                          value={row.value}
                        />
                      </div>
                      <Button
                        aria-label={tSocial('remove')}
                        className="shrink-0"
                        onClick={() => removeHandleRow(row.id, setInstagramRows)}
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <HugeiconsIcon className="size-4" icon={Cancel01Icon} />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={() => addHandleRow(setInstagramRows)} size="sm" type="button" variant="outline">
                    {tSocial('addInstagram')}
                  </Button>
                </div>
              </Field>

              <Field>
                <FieldLabel className="font-medium text-muted-foreground text-xs">
                  {tSocial('twitterPlaceholder')}
                </FieldLabel>
                <div className="space-y-2">
                  {twitterRows.map((row) => (
                    <div className="flex items-center gap-2" key={row.id}>
                      <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <SiX className="size-5 text-muted-foreground/60" />
                        </div>
                        <Input
                          autoCapitalize="none"
                          autoCorrect="off"
                          className="min-h-11 rounded-xl border border-border/50 bg-background pl-10 transition-all focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                          onBlur={handleSocialLinksBlur}
                          onChange={(event) => updateHandleAt(row.id, event.target.value, setTwitterRows)}
                          placeholder={tSocial('twitterPlaceholder')}
                          value={row.value}
                        />
                      </div>
                      <Button
                        aria-label={tSocial('remove')}
                        className="shrink-0"
                        onClick={() => removeHandleRow(row.id, setTwitterRows)}
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <HugeiconsIcon className="size-4" icon={Cancel01Icon} />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={() => addHandleRow(setTwitterRows)} size="sm" type="button" variant="outline">
                    {tSocial('addTwitter')}
                  </Button>
                </div>
              </Field>

              <Field>
                <FieldLabel className="font-medium text-muted-foreground text-xs">
                  {tSocial('youtubePlaceholder')}
                </FieldLabel>
                <div className="space-y-2">
                  {youtubeRows.map((row) => (
                    <div className="flex items-center gap-2" key={row.id}>
                      <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <SiYoutube className="size-5 text-muted-foreground/60" />
                        </div>
                        <Input
                          autoCapitalize="none"
                          autoCorrect="off"
                          className="min-h-11 rounded-xl border border-border/50 bg-background pl-10 transition-all focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                          onBlur={handleSocialLinksBlur}
                          onChange={(event) => updateHandleAt(row.id, event.target.value, setYoutubeRows)}
                          placeholder={tSocial('youtubePlaceholder')}
                          value={row.value}
                        />
                      </div>
                      <Button
                        aria-label={tSocial('remove')}
                        className="shrink-0"
                        onClick={() => removeHandleRow(row.id, setYoutubeRows)}
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <HugeiconsIcon className="size-4" icon={Cancel01Icon} />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={() => addHandleRow(setYoutubeRows)} size="sm" type="button" variant="outline">
                    {tSocial('addYoutube')}
                  </Button>
                </div>
              </Field>

              <Field>
                <FieldLabel className="font-medium text-muted-foreground text-xs">
                  {tSocial('githubPlaceholder')}
                </FieldLabel>
                <div className="space-y-2">
                  {githubRows.map((row) => (
                    <div className="flex items-center gap-2" key={row.id}>
                      <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <SiGithub className="size-5 text-muted-foreground/60" />
                        </div>
                        <Input
                          autoCapitalize="none"
                          autoCorrect="off"
                          className="min-h-11 rounded-xl border border-border/50 bg-background pl-10 transition-all focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                          onBlur={handleSocialLinksBlur}
                          onChange={(event) => updateCustomAt(row.id, 'handle', event.target.value, setGithubRows)}
                          placeholder={tSocial('githubPlaceholder')}
                          value={row.handle}
                        />
                      </div>
                      <Button
                        aria-label={tSocial('remove')}
                        className="shrink-0"
                        onClick={() => removeCustomRow(row.id, setGithubRows)}
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <HugeiconsIcon className="size-4" icon={Cancel01Icon} />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={() => addCustomRow(setGithubRows)} size="sm" type="button" variant="outline">
                    {tSocial('addGithub')}
                  </Button>
                </div>
              </Field>

              <Field>
                <FieldLabel className="font-medium text-muted-foreground text-xs">
                  {tSocial('naverBlogPlaceholder')}
                </FieldLabel>
                <div className="space-y-2">
                  {naverBlogRows.map((row) => (
                    <div className="flex items-center gap-2" key={row.id}>
                      <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <SiNaver className="size-5 text-muted-foreground/60" />
                        </div>
                        <Input
                          autoCapitalize="none"
                          autoCorrect="off"
                          className="min-h-11 rounded-xl border border-border/50 bg-background pl-10 transition-all focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                          onBlur={() => handleNaverBlogHandleBlur(row.id, row.handle)}
                          onChange={(event) => updateCustomAt(row.id, 'handle', event.target.value, setNaverBlogRows)}
                          placeholder={tSocial('naverBlogPlaceholder')}
                          value={row.handle}
                        />
                      </div>
                      <Button
                        aria-label={tSocial('remove')}
                        className="shrink-0"
                        onClick={() => removeCustomRow(row.id, setNaverBlogRows)}
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <HugeiconsIcon className="size-4" icon={Cancel01Icon} />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={() => addCustomRow(setNaverBlogRows)} size="sm" type="button" variant="outline">
                    {tSocial('addNaverBlog')}
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
            <h3 className="font-semibold text-foreground text-sm">{t('anonymousRestriction')}</h3>
          </div>

          <RadioGroup className="w-full space-y-2" onValueChange={handleSecurityLevelChange} value={securityLevel}>
            {QUESTION_SECURITY_LEVELS.map((level) => {
              const option = securityOptions[level]
              const IconComponent = SECURITY_ICONS[level] || AnonymousIcon
              if (!option) {
                return null
              }
              return (
                <Label
                   className="group relative flex cursor-pointer items-start gap-3 rounded-xl border-2 border-transparent bg-muted/30 p-3 transition-all has-data-checked:border-emerald/50 has-data-checked:bg-emerald/5"
                  key={level}
                >
                  <RadioGroupItem
                    className="pointer-events-none absolute opacity-0"
                    id={`qsl-${level}`}
                    value={level}
                  />
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors group-has-data-checked:bg-emerald/20 group-has-data-checked:text-emerald">
                    <HugeiconsIcon className="size-5" icon={IconComponent} strokeWidth={2} />
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
            <h3 className="font-semibold text-foreground text-sm">{t('signatureColor')}</h3>
          </div>

          <SignatureColorPicker
            currentColor={initialSignatureColor}
            labels={{
              saving: t('saving'),
              saved: t('signatureColorUpdated'),
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
