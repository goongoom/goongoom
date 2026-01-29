'use client'

import { SignUpButton, useUser } from '@clerk/nextjs'
import { LockIcon, SentIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import posthog from 'posthog-js'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { PasskeySignInButton } from '@/components/auth/passkey-sign-in-button'
import { SignupPromptModal } from '@/components/auth/signup-prompt-modal'
import { CHAR_LIMITS } from '@/lib/charLimits'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

function generateAvatarSeed() {
  return Math.random().toString(36).substring(2, 15)
}

function getAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&flip=true`
}

interface SubmitResult {
  success: boolean
  error?: string
}

interface QuestionDrawerProps {
  recipientName: string
  recipientClerkId: string
  canAskAnonymously: boolean
  canAskPublic: boolean
  submitAction: (formData: FormData) => Promise<SubmitResult>
  successMessage: string
  requiresSignIn?: boolean
}

function SubmitButton({ pending, overLimit }: { pending: boolean; overLimit: boolean }) {
  const t = useTranslations('questions')
  return (
    <Button
      className="h-14 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 font-semibold transition-all disabled:opacity-70"
      disabled={pending || overLimit}
      size="lg"
      type="submit"
    >
      {pending ? t('sending') : t('sendQuestion')}
    </Button>
  )
}

function SignInPrompt() {
  const tAuth = useTranslations('auth')
  const tCommon = useTranslations('common')
  const tRestrictions = useTranslations('restrictions')

  return (
    <div className="space-y-6 py-4">
      <div className="rounded-2xl border border-border/50 bg-muted/30 p-6 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-orange-500/20">
          <HugeiconsIcon className="size-7 text-pink-500" icon={LockIcon} strokeWidth={2} />
        </div>
        <p className="mb-1 font-semibold text-foreground">{tAuth('loginRequired')}</p>
        <p className="text-muted-foreground text-sm">{tRestrictions('anonymousLoginRequired')}</p>
      </div>
      <div className="flex gap-3">
        <PasskeySignInButton>
          <Button className="h-14 flex-1 rounded-2xl font-semibold" size="lg" variant="outline">
            {tCommon('login')}
          </Button>
        </PasskeySignInButton>
        <SignUpButton mode="modal">
          <Button
            className="h-14 flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 font-semibold"
            size="lg"
          >
            {tCommon('start')}
          </Button>
        </SignUpButton>
      </div>
    </div>
  )
}

interface QuestionTypeSelectorProps {
  questionType: 'anonymous' | 'public'
  avatarSeed: string
  canAskAnonymously: boolean
  canAskPublic: boolean
  onAnonymousClick: () => void
  onPublicClick: () => void
}

function QuestionTypeSelector({
  questionType,
  avatarSeed,
  canAskAnonymously,
  canAskPublic,
  onAnonymousClick,
  onPublicClick,
}: QuestionTypeSelectorProps) {
  const t = useTranslations('questions')
  const tCommon = useTranslations('common')
  const tRestrictions = useTranslations('restrictions')
  const { user } = useUser()
  const isAnonymous = questionType === 'anonymous'

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        className={`group flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 bg-background p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          canAskAnonymously
            ? `cursor-pointer ${
                isAnonymous ? 'border-pink-500/50 bg-pink-500/5 ring-2 ring-pink-500/10' : 'border-border/50'
              }`
            : 'cursor-not-allowed border-border/20 opacity-50'
        }`}
        disabled={!canAskAnonymously}
        onClick={onAnonymousClick}
        type="button"
      >
        <Avatar className={`size-12 ring-2 ring-background transition-all ${isAnonymous ? 'ring-pink-500/20' : ''}`}>
          <AvatarImage alt={tCommon('anonymous')} src={getAvatarUrl(avatarSeed)} />
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <div className="space-y-1 text-center">
          <p className="font-bold text-foreground text-sm">{t('anonymousOption')}</p>
          <p
            className={`font-medium text-xs leading-relaxed ${
              isAnonymous ? 'bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent' : 'text-muted-foreground/70'
            }`}
          >
            {t('anonymousDescription')}
          </p>
        </div>
      </button>

      <button
        className={`group flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 bg-background p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          canAskPublic
            ? `cursor-pointer ${
                isAnonymous ? 'border-border/50' : 'border-pink-500/50 bg-pink-500/5 ring-2 ring-pink-500/10'
              }`
            : 'cursor-not-allowed border-border/20 opacity-50'
        }`}
        disabled={!canAskPublic}
        onClick={onPublicClick}
        type="button"
      >
        <Avatar className={`size-12 ring-2 ring-background transition-all ${isAnonymous ? '' : 'ring-pink-500/20'}`}>
          {user?.imageUrl && <AvatarImage alt={user?.firstName || tCommon('you')} src={user.imageUrl} />}
          <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 font-semibold text-muted-foreground">
            {user?.firstName?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1 text-center">
          <p className="font-bold text-foreground text-sm">{t('publicOption')}</p>
          <p
            className={`font-medium text-xs leading-relaxed ${
              isAnonymous ? 'text-muted-foreground/70' : 'bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent'
            }`}
          >
            {canAskPublic ? t('publicDescription') : tRestrictions('loginForPublic')}
          </p>
        </div>
      </button>
    </div>
  )
}

export function QuestionDrawer({
  recipientName,
  canAskAnonymously,
  canAskPublic,
  submitAction,
  successMessage,
  requiresSignIn = false,
}: QuestionDrawerProps) {
  const t = useTranslations('questions')
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const { isSignedIn } = useUser()

  const [open, setOpen] = useState(false)
  const [questionType, setQuestionType] = useState<'anonymous' | 'public'>(canAskAnonymously ? 'anonymous' : 'public')
  const [avatarSeed, setAvatarSeed] = useState(generateAvatarSeed)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shouldRefreshOnClose, setShouldRefreshOnClose] = useState(false)
  const [question, setQuestion] = useState('')
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)

  const handleAnonymousClick = () => {
    if (questionType === 'anonymous') {
      setAvatarSeed(generateAvatarSeed())
    } else {
      setQuestionType('anonymous')
    }
  }

  const handlePublicClick = () => {
    setQuestionType('public')
  }

  function handleAnimationEnd(isOpen: boolean) {
    if (!isOpen) {
      formRef.current?.reset()
      setAvatarSeed(generateAvatarSeed())
      setQuestion('')
      if (shouldRefreshOnClose) {
        setShouldRefreshOnClose(false)
        router.refresh()
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)
      const result = await submitAction(formData)

      if (result.success) {
        posthog.capture('question_submitted', {
          recipient_name: recipientName,
          question_type: questionType,
          is_anonymous: questionType === 'anonymous',
          question_length: question.length,
          is_signed_in: isSignedIn,
        })
        toast.success(successMessage)
        setShouldRefreshOnClose(true)
        setOpen(false)
        if (!isSignedIn) {
          setTimeout(() => setShowSignupPrompt(true), 500)
        }
      } else {
        toast.error(result.error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isAnonymous = questionType === 'anonymous'

  return (
    <>
      <SignupPromptModal onOpenChange={setShowSignupPrompt} open={showSignupPrompt} />
      <Drawer onAnimationEnd={handleAnimationEnd} onOpenChange={setOpen} open={open} repositionInputs={false}>
        <div className="pointer-events-none fixed inset-x-0 bottom-tab-bar z-40 bg-gradient-to-t from-background via-background/80 to-transparent p-4 md:left-(--sidebar-width)">
          <button
            aria-label={t('writeQuestion')}
            className="pointer-events-auto flex min-h-12 w-full items-center justify-between gap-4 rounded-full border border-border/50 bg-background/80 px-5 py-3.5 ring-1 ring-foreground/5 backdrop-blur-md transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={() => {
              setOpen(true)
              posthog.capture('question_drawer_opened', {
                recipient_name: recipientName,
              })
            }}
            type="button"
          >
            <span className="font-medium text-muted-foreground/80 text-sm sm:text-base">{t('inputPlaceholder')}</span>
            <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-active:scale-95">
              <HugeiconsIcon className="size-5" icon={SentIcon} strokeWidth={2.5} />
            </div>
          </button>
        </div>
        <DrawerContent className="pb-safe">
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader className="pb-2 text-left">
              <DrawerTitle className="font-bold text-xl tracking-tight">
                <span className="text-foreground">{t('toRecipientPrefix')}</span>
                <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                  {recipientName}
                </span>
                <span className="text-foreground">{t('toRecipientSuffix')}</span>
              </DrawerTitle>
              <DrawerDescription className="text-base">{t('newQuestion')}</DrawerDescription>
            </DrawerHeader>

            <div className="max-h-[70vh] overflow-y-auto px-4 pb-8">
              {requiresSignIn ? (
                <SignInPrompt />
              ) : (
                <form className="space-y-6 py-2" onSubmit={handleSubmit} ref={formRef}>
                  <div className="space-y-2">
                    <Textarea
                      className="min-h-28 resize-none rounded-2xl border border-border/50 bg-muted/30 p-4 text-base transition-all focus:border-pink-500 focus:bg-background focus:ring-2 focus:ring-pink-500/20"
                      name="question"
                      onChange={(event) => setQuestion(event.target.value)}
                      placeholder={t('inputPlaceholder')}
                      required
                      value={question}
                    />
                    <div className="flex justify-end">
                      <span
                        className={cn(
                          'font-medium text-xs',
                          question.length > CHAR_LIMITS.QUESTION ? 'text-destructive' : 'text-muted-foreground'
                        )}
                      >
                        {question.length}/{CHAR_LIMITS.QUESTION}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="ml-1 font-semibold text-foreground/90 text-sm">{t('whoToAsk')}</Label>
                    <QuestionTypeSelector
                      avatarSeed={avatarSeed}
                      canAskAnonymously={canAskAnonymously}
                      canAskPublic={canAskPublic}
                      onAnonymousClick={handleAnonymousClick}
                      onPublicClick={handlePublicClick}
                      questionType={questionType}
                    />
                    <input name="questionType" type="hidden" value={questionType} />
                  </div>

                  {isAnonymous && <input name="avatarSeed" type="hidden" value={avatarSeed} />}

                  <div className="space-y-3 pt-2">
                    <SubmitButton overLimit={question.length > CHAR_LIMITS.QUESTION} pending={isSubmitting} />
                    <p className="text-balance text-center text-muted-foreground text-xs leading-relaxed">
                      {t.rich('termsAgreement', {
                        link: (chunks) => (
                          <Link className="underline" href="/terms">
                            {chunks}
                          </Link>
                        ),
                      })}
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
