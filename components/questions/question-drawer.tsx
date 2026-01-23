"use client"

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs"
import { LockIcon, SentIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useFormStatus } from "react-dom"
import { QuestionInputTrigger } from "@/components/questions/question-input-trigger"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

function generateAvatarSeed() {
  return Math.random().toString(36).substring(2, 15)
}

function getAvatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
}

interface QuestionDrawerProps {
  recipientName: string
  recipientClerkId: string
  canAskAnonymously: boolean
  canAskPublic: boolean
  submitAction: (formData: FormData) => Promise<void>
  requiresSignIn?: boolean
}

function SubmitButton() {
  const t = useTranslations("questions")
  const { pending } = useFormStatus()
  return (
    <Button
      className="h-14 w-full rounded-2xl bg-gradient-to-r from-electric-blue to-electric-blue/90 font-semibold text-base ring-1 ring-electric-blue/50 transition-all hover:ring-2 hover:ring-electric-blue/70 disabled:opacity-70"
      disabled={pending}
      size="lg"
      type="submit"
    >
      {pending ? (
        <span className="flex items-center gap-2.5">
          <Spinner className="size-5 text-white" />
          <span>{t("sending")}</span>
        </span>
      ) : (
        <span className="flex items-center gap-2.5">
          <HugeiconsIcon className="size-5" icon={SentIcon} strokeWidth={2.5} />
          <span>{t("sendQuestion")}</span>
        </span>
      )}
    </Button>
  )
}

function SignInPrompt() {
  const tAuth = useTranslations("auth")
  const tCommon = useTranslations("common")
  const tRestrictions = useTranslations("restrictions")

  return (
    <div className="space-y-6 py-4">
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-electric-blue/20 to-purple/20">
          <HugeiconsIcon
            className="size-7 text-electric-blue"
            icon={LockIcon}
            strokeWidth={2}
          />
        </div>
        <p className="mb-1 font-semibold text-foreground">
          {tAuth("loginRequired")}
        </p>
        <p className="text-muted-foreground text-sm">
          {tRestrictions("anonymousLoginRequired")}
        </p>
      </div>
      <div className="flex gap-3">
        <SignInButton mode="modal">
          <Button
            className="h-12 flex-1 rounded-xl font-semibold"
            size="lg"
            variant="outline"
          >
            {tCommon("login")}
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button
            className="h-12 flex-1 rounded-xl bg-gradient-to-r from-electric-blue to-electric-blue/90 font-semibold ring-1 ring-electric-blue/50"
            size="lg"
          >
            {tCommon("start")}
          </Button>
        </SignUpButton>
      </div>
    </div>
  )
}

interface QuestionTypeSelectorProps {
  questionType: "anonymous" | "public"
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
  const t = useTranslations("questions")
  const tRestrictions = useTranslations("restrictions")
  const { user } = useUser()
  const isAnonymous = questionType === "anonymous"

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        className={`group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-background p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          canAskAnonymously
            ? `cursor-pointer hover:border-border hover:bg-muted/50 ${
                isAnonymous
                  ? "border-electric-blue/50 bg-electric-blue/5"
                  : "border-transparent"
              }`
            : "cursor-not-allowed border-border/20 opacity-50"
        }`}
        disabled={!canAskAnonymously}
        onClick={onAnonymousClick}
        type="button"
      >
        <Avatar
          className={`size-12 transition-all ${
            isAnonymous ? "ring-2 ring-electric-blue/50" : ""
          }`}
        >
          <AvatarImage alt="Anonymous" src={getAvatarUrl(avatarSeed)} />
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <div className="space-y-1 text-center">
          <p className="font-bold text-foreground text-sm">
            {t("anonymousOption")}
          </p>
          <p
            className={`font-medium text-xs leading-relaxed ${
              isAnonymous ? "text-muted-foreground" : "text-muted-foreground/70"
            }`}
          >
            {t("anonymousDescription")}
          </p>
        </div>
      </button>

      <button
        className={`group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-background p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          canAskPublic
            ? `cursor-pointer hover:border-border hover:bg-muted/50 ${
                isAnonymous
                  ? "border-transparent"
                  : "border-electric-blue/50 bg-electric-blue/5"
              }`
            : "cursor-not-allowed border-border/20 opacity-50"
        }`}
        disabled={!canAskPublic}
        onClick={onPublicClick}
        type="button"
      >
        <Avatar
          className={`size-12 transition-all ${
            isAnonymous ? "" : "ring-2 ring-electric-blue/50"
          }`}
        >
          {user?.imageUrl && (
            <AvatarImage alt={user?.firstName || "You"} src={user.imageUrl} />
          )}
          <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 font-semibold text-muted-foreground">
            {user?.firstName?.[0] || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1 text-center">
          <p className="font-bold text-foreground text-sm">
            {t("identifiedOption")}
          </p>
          <p
            className={`font-medium text-xs leading-relaxed ${
              isAnonymous ? "text-muted-foreground/70" : "text-muted-foreground"
            }`}
          >
            {canAskPublic
              ? t("identifiedDescription")
              : tRestrictions("loginForIdentified")}
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
  requiresSignIn = false,
}: QuestionDrawerProps) {
  const t = useTranslations("questions")
  const [open, setOpen] = useState(false)
  const [questionType, setQuestionType] = useState<"anonymous" | "public">(
    canAskAnonymously ? "anonymous" : "public"
  )
  const [avatarSeed, setAvatarSeed] = useState(generateAvatarSeed)

  const handleAnonymousClick = () => {
    if (questionType === "anonymous") {
      setAvatarSeed(generateAvatarSeed())
    } else {
      setQuestionType("anonymous")
    }
  }

  const handlePublicClick = () => {
    setQuestionType("public")
  }

  const isAnonymous = questionType === "anonymous"

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <QuestionInputTrigger onClick={() => setOpen(true)} />
      <DrawerContent className="pb-safe">
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader className="pb-2 text-left">
            <DrawerTitle className="font-bold text-2xl tracking-tight">
              <span className="bg-gradient-to-r from-electric-blue to-purple bg-clip-text text-transparent">
                {recipientName}
              </span>
              <span className="text-foreground">
                {" "}
                {t("toRecipient", { recipientName: "" })}
              </span>
            </DrawerTitle>
            <DrawerDescription className="text-base">
              {t("newQuestion")}
            </DrawerDescription>
          </DrawerHeader>

          <div className="max-h-[70vh] overflow-y-auto px-4 pb-8">
            {requiresSignIn ? (
              <SignInPrompt />
            ) : (
              <form action={submitAction} className="space-y-6 py-2">
                <div className="space-y-2">
                  <Label className="ml-1 font-semibold text-foreground/90 text-sm">
                    {t("inputPlaceholder")}
                  </Label>
                  <Textarea
                    className="min-h-28 resize-none rounded-2xl border border-border/50 bg-muted/30 p-4 text-base transition-all focus:border-electric-blue focus:bg-background focus:ring-2 focus:ring-electric-blue/20"
                    name="question"
                    placeholder={t("inputPlaceholder")}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label className="ml-1 font-semibold text-foreground/90 text-sm">
                    {t("whoToAsk")}
                  </Label>
                  <QuestionTypeSelector
                    avatarSeed={avatarSeed}
                    canAskAnonymously={canAskAnonymously}
                    canAskPublic={canAskPublic}
                    onAnonymousClick={handleAnonymousClick}
                    onPublicClick={handlePublicClick}
                    questionType={questionType}
                  />
                  <input
                    name="questionType"
                    type="hidden"
                    value={questionType}
                  />
                </div>

                {isAnonymous && (
                  <input name="avatarSeed" type="hidden" value={avatarSeed} />
                )}

                <div className="space-y-3 pt-2">
                  <SubmitButton />
                  <p className="text-balance text-center text-muted-foreground text-xs leading-relaxed">
                    {t("termsAgreement")}
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
