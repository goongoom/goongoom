import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { InstagramIcon, FacebookIcon, GithubIcon, LockIcon } from "@hugeicons/core-free-icons";
import { MainContent } from "@/components/layout/main-content";
import { Card, CardPanel } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldControl } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, Radio } from "@/components/ui/radio-group";
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { ShareInstagramButton } from "@/components/questions/share-instagram-button";
import { getClerkUserByUsername } from "@/lib/clerk";
import { getOrCreateUser, getUserWithAnsweredQuestions } from "@/lib/db/queries";
import { createQuestion } from "@/lib/actions/questions";
import {
  DEFAULT_QUESTION_SECURITY_LEVEL,
  type QuestionSecurityLevel,
} from "@/lib/question-security";
import type { QuestionWithAnswers } from "@/lib/types";

interface UserProfilePageProps {
  params: Promise<{ username: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function toProfileUrl(value: string | undefined, domain: string) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.includes(domain)) return `https://${trimmed.replace(/^\/+/, "")}`;
  const handle = trimmed.replace(/^@/, "").split("/")[0];
  return handle ? `https://${domain}/${handle}` : null;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return new Date(date).toLocaleDateString("ko-KR");
}

function buildShareUrl({ question, answer, name }: { question: string; answer: string; name: string }) {
  const normalize = (value: string, max: number) =>
    value.length > max ? `${value.slice(0, max - 1)}…` : value;
  const params = new URLSearchParams({
    question: normalize(question, 160),
    answer: normalize(answer, 260),
    name: normalize(name, 40),
  });
  return `/api/instagram?${params.toString()}`;
}

export default async function UserProfilePage({ params, searchParams }: UserProfilePageProps) {
  const { username } = await params;
  const [clerkUser, authResult, query] = await Promise.all([
    getClerkUserByUsername(username),
    auth(),
    searchParams,
  ]);

  if (!clerkUser) notFound();

  const [dbUser, { answeredQuestions }] = await Promise.all([
    getOrCreateUser(clerkUser.clerkId),
    getUserWithAnsweredQuestions(clerkUser.clerkId),
  ]);

  const displayName = clerkUser.displayName || clerkUser.username || username;
  const { userId } = authResult;

  const error = typeof query?.error === "string" ? decodeURIComponent(query.error) : null;
  const sent = query?.sent === "1";
  const status = error
    ? { type: "error" as const, message: error }
    : sent
      ? { type: "success" as const, message: "질문이 전송되었습니다!" }
      : null;

  const socialLinks = [
    { key: "instagram", label: "Instagram", icon: InstagramIcon, href: toProfileUrl(dbUser?.socialLinks?.instagram, "instagram.com") },
    { key: "facebook", label: "Facebook", icon: FacebookIcon, href: toProfileUrl(dbUser?.socialLinks?.facebook, "facebook.com") },
    { key: "github", label: "GitHub", icon: GithubIcon, href: toProfileUrl(dbUser?.socialLinks?.github, "github.com") },
  ].filter((link) => Boolean(link.href));

  const securityLevel = dbUser?.questionSecurityLevel || DEFAULT_QUESTION_SECURITY_LEVEL;
  const viewerIsVerified = Boolean(userId);
  const canAskAnonymously = securityLevel !== "public_only" && (securityLevel === "anyone" || viewerIsVerified);
  const canAskPublic = viewerIsVerified;
  const defaultQuestionType = canAskAnonymously ? "anonymous" : "public";
  const showSecurityNotice =
    securityLevel === "verified_anonymous" ||
    securityLevel === "public_only" ||
    (!viewerIsVerified && securityLevel === "anyone");
  const securityNotice =
    securityLevel === "verified_anonymous"
      ? "익명 질문은 로그인 사용자만 가능하며, 사법 기관 요청이 없는 한 이름은 공개되지 않습니다."
      : securityLevel === "public_only"
        ? "이 사용자는 공개 질문만 받습니다."
        : "로그인하면 공개 질문도 보낼 수 있어요.";

  const recipientClerkId = clerkUser.clerkId;
  const recipientUsername = clerkUser.username || username;

  async function submitQuestion(formData: FormData) {
    "use server";
    const content = String(formData.get("question") || "").trim();
    const questionType = String(formData.get("questionType") || "anonymous");

    if (!content) {
      redirect(`/${recipientUsername}?error=${encodeURIComponent("질문을 입력해주세요")}`);
    }

    const result = await createQuestion({
      recipientClerkId,
      content,
      isAnonymous: questionType !== "public",
    });

    if (!result.success) {
      redirect(`/${recipientUsername}?error=${encodeURIComponent(result.error)}`);
    }

    revalidatePath(`/${recipientUsername}`);
    redirect(`/${recipientUsername}?sent=1`);
  }

  const showLoginWarning = !viewerIsVerified && securityLevel !== "anyone";
  const warningMessage =
    securityLevel === "public_only"
      ? "이 사용자는 공개 질문만 받습니다. 로그인 후 질문해 주세요."
      : "이 사용자는 익명 질문을 로그인 사용자에게만 허용합니다. 로그인 후 질문해 주세요.";

  return (
    <MainContent>
      <Card className="mb-6">
        <CardPanel className="flex items-start gap-6">
          <Avatar className="size-24 ring-2 ring-electric-blue/50">
            {clerkUser.avatarUrl ? <AvatarImage src={clerkUser.avatarUrl} alt={displayName} /> : null}
            <AvatarFallback>{displayName[0] || "?"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3 text-left">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-foreground">{displayName}</h1>
              <p className="text-sm text-muted-foreground">@{recipientUsername}</p>
            </div>
            {dbUser?.bio && (
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{dbUser.bio}</p>
            )}
          </div>
        </CardPanel>
        {socialLinks.length > 0 && (
          <CardPanel className="flex flex-wrap gap-4 pt-0">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <div key={link.key} className="flex flex-col items-center gap-2">
                  <Button
                    aria-label={link.label}
                    className="rounded-full"
                    render={<Link href={link.href as string} rel="noopener noreferrer" target="_blank" />}
                    size="icon"
                    variant="ghost"
                  >
                    <HugeiconsIcon icon={Icon} className="size-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">{link.label}</span>
                </div>
              );
            })}
          </CardPanel>
        )}
      </Card>

      {showLoginWarning ? (
        <Card className="mb-6">
          <CardPanel className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{recipientUsername} 님에게 새 질문을 남겨보세요</h2>
            {status?.type === "error" && (
              <Alert variant="error">
                <AlertDescription className="text-center">{status.message}</AlertDescription>
              </Alert>
            )}
            <Alert variant="warning">
              <AlertDescription>{warningMessage}</AlertDescription>
              <AlertAction>
                <Button render={<Link href="/sign-in" />} size="sm">로그인</Button>
              </AlertAction>
            </Alert>
          </CardPanel>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardPanel>
            <form action={submitQuestion} className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">{recipientUsername} 님에게 새 질문을 남겨보세요</h2>
              <Field>
                <FieldControl render={<Textarea name="question" placeholder="질문을 입력하세요…" rows={4} size="lg" required />} />
              </Field>
              {showSecurityNotice && (
                <Alert variant="info">
                  <AlertDescription>{securityNotice}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">누구로 질문할까요?</p>
                <RadioGroup name="questionType" defaultValue={defaultQuestionType}>
                  {canAskAnonymously && (
                    <Label className="flex items-start gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 has-[data-checked]:border-primary/48 has-[data-checked]:bg-accent/50">
                      <Radio id="r-anonymous" value="anonymous" />
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-foreground">익명</p>
                        <p className="text-xs text-muted-foreground">익명으로 질문합니다</p>
                      </div>
                    </Label>
                  )}
                  {canAskPublic && (
                    <Label className="flex items-start gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 has-[data-checked]:border-primary/48 has-[data-checked]:bg-accent/50">
                      <Radio id="r-public" value="public" />
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-foreground">공개</p>
                        <p className="text-xs text-muted-foreground">내 이름으로 질문합니다</p>
                      </div>
                    </Label>
                  )}
                </RadioGroup>
              </div>
              {status?.type === "success" && (
                <Alert variant="success">
                  <AlertDescription className="text-center">{status.message}</AlertDescription>
                </Alert>
              )}
              {status?.type === "error" && (
                <Alert variant="error">
                  <AlertDescription className="text-center">{status.message}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" size="lg">
                <HugeiconsIcon icon={LockIcon} className="size-4" aria-hidden="true" />
                질문 보내기
              </Button>
              <p className="text-center text-xs text-muted-foreground">질문 시 사용 약관에 동의하게 됩니다</p>
            </form>
          </CardPanel>
        </Card>
      )}

      {answeredQuestions.length > 0 ? (
        <div className="space-y-6">
          {answeredQuestions.map((qa) => {
            const answer = (qa as QuestionWithAnswers).answers[0];
            if (!answer) return null;
            const shareUrl = buildShareUrl({ question: qa.content, answer: answer.content, name: displayName });
            return (
              <Card key={qa.id}>
                <CardPanel className="flex flex-col gap-4">
                  <div className="flex w-full items-start gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=anon_${qa.id}`} alt="Avatar" />
                      <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Card className="max-w-prose bg-muted/40 px-4 py-3">
                        <p className="text-foreground leading-relaxed">{qa.content}</p>
                      </Card>
                      <p className="mt-1 ml-1 text-xs text-muted-foreground">
                        {qa.isAnonymous === 1 ? "익명" : "공개"} · {formatRelativeTime(qa.createdAt)} 질문
                      </p>
                    </div>
                  </div>
                  <div className="flex w-full items-start justify-end gap-3">
                    <div className="flex flex-1 flex-col items-end">
                      <Card className="max-w-prose border-primary/20 bg-primary px-4 py-3 text-primary-foreground">
                        <p className="leading-relaxed">{answer.content}</p>
                      </Card>
                      <div className="mt-1 mr-1 flex flex-col items-end gap-1">
                        <p className="text-xs text-muted-foreground">
                          {displayName} · {formatRelativeTime(answer.createdAt)} 답변
                        </p>
                        <ShareInstagramButton shareUrl={shareUrl} />
                      </div>
                    </div>
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      {clerkUser.avatarUrl ? <AvatarImage src={clerkUser.avatarUrl} alt={displayName} /> : null}
                      <AvatarFallback>{displayName[0] || "?"}</AvatarFallback>
                    </Avatar>
                  </div>
                </CardPanel>
              </Card>
            );
          })}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>아직 답변된 질문이 없습니다.</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}
    </MainContent>
  );
}
