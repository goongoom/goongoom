import { Suspense } from "react";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { InstagramIcon, FacebookIcon, GithubIcon } from "@hugeicons/core-free-icons";
import { MainContent } from "@/components/layout/main-content";
import { Card, CardPanel } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { ShareInstagramButton } from "@/components/questions/share-instagram-button";
import { QuestionDrawer } from "@/components/questions/question-drawer";
import { getClerkUserByUsername } from "@/lib/clerk";
import { getOrCreateUser, getUserWithAnsweredQuestions } from "@/lib/db/queries";
import { createQuestion } from "@/lib/actions/questions";
import { DEFAULT_QUESTION_SECURITY_LEVEL } from "@/lib/question-security";
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

async function UserProfileContent({ 
  paramsPromise, 
  searchParamsPromise,
}: { 
  paramsPromise: Promise<{ username: string }>; 
  searchParamsPromise?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ username }, searchParams = {}, { userId: viewerId }] = await Promise.all([
    paramsPromise,
    searchParamsPromise,
    auth(),
  ]) as [{ username: string }, Record<string, string | string[] | undefined> | undefined, { userId: string | null }];
  
  const clerkUser = await getClerkUserByUsername(username);

  if (!clerkUser) notFound();

  const [dbUser, { answeredQuestions }] = await Promise.all([
    getOrCreateUser(clerkUser.clerkId),
    getUserWithAnsweredQuestions(clerkUser.clerkId),
  ]);

  const displayName = clerkUser.displayName || clerkUser.username || username;

  const error = typeof searchParams?.error === "string" ? decodeURIComponent(searchParams.error) : null;
  const sent = searchParams?.sent === "1";
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
  const viewerIsVerified = Boolean(viewerId);
  const canAskAnonymously = securityLevel !== "public_only" && (securityLevel === "anyone" || viewerIsVerified);
  const canAskPublic = viewerIsVerified;
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

      {status && (
        <Alert variant={status.type === "error" ? "error" : "success"} className="mb-6">
          <AlertDescription className="text-center">{status.message}</AlertDescription>
        </Alert>
      )}

      {showLoginWarning && (
        <Card className="mb-6">
          <CardPanel className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{recipientUsername} 님에게 새 질문을 남겨보세요</h2>
            <Alert className="border-electric-blue/30 bg-electric-blue/10 text-electric-blue">
              <AlertDescription className="text-electric-blue/80">{warningMessage}</AlertDescription>
              <AlertAction>
                <Button render={<Link href="/sign-in" />} size="sm">로그인</Button>
              </AlertAction>
            </Alert>
          </CardPanel>
        </Card>
      )}

      {answeredQuestions.length > 0 ? (
        <div className="space-y-6 pb-24">
          {answeredQuestions.map((qa) => {
            const answer = (qa as QuestionWithAnswers).answers[0];
            if (!answer) return null;
            const shareUrl = buildShareUrl({ question: qa.content, answer: answer.content, name: displayName });
            return (
              <Card key={qa.id} className="relative">
                <div className="absolute right-4 top-4">
                  <ShareInstagramButton shareUrl={shareUrl} />
                </div>
                <CardPanel className="flex flex-col gap-4">
                  <div className="flex w-full items-start gap-3">
                    <Avatar className="size-10 flex-shrink-0">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=anon_${qa.id}`} alt="Avatar" />
                      <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <Card className="max-w-prose bg-muted/40 px-4 py-3">
                        <p className="leading-relaxed text-foreground">{qa.content}</p>
                      </Card>
                      <p className="ml-1 mt-1 text-xs text-muted-foreground">
                        {qa.isAnonymous === 1 ? "익명" : "공개"} · {formatRelativeTime(qa.createdAt)} 질문
                      </p>
                    </div>
                  </div>
                  <div className="flex w-full items-start justify-end gap-3">
                    <div className="flex flex-1 flex-col items-end">
                      <Card className="max-w-prose border-primary/20 bg-primary px-4 py-3 text-primary-foreground">
                        <p className="leading-relaxed">{answer.content}</p>
                      </Card>
                      <p className="mr-1 mt-1 text-xs text-muted-foreground">
                        {displayName} · {formatRelativeTime(answer.createdAt)} 답변
                      </p>
                    </div>
                    <Avatar className="size-10 flex-shrink-0">
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
        <Empty className="pb-24">
          <EmptyHeader>
            <EmptyTitle>아직 답변된 질문이 없습니다.</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}

      {!showLoginWarning && (canAskAnonymously || canAskPublic) && (
        <QuestionDrawer
          recipientUsername={recipientUsername}
          recipientClerkId={recipientClerkId}
          canAskAnonymously={canAskAnonymously}
          canAskPublic={canAskPublic}
          showSecurityNotice={showSecurityNotice}
          securityNotice={securityNotice}
          submitAction={submitQuestion}
        />
      )}
    </MainContent>
  );
}

export default function UserProfilePage({ params, searchParams }: UserProfilePageProps) {
  return (
    <Suspense fallback={null}>
      <UserProfileContent paramsPromise={params} searchParamsPromise={searchParams} />
    </Suspense>
  );
}
