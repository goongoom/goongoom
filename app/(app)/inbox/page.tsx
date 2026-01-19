import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { MainContent } from "@/components/layout/main-content";
import { Card, CardPanel } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { getClerkUsersByIds } from "@/lib/clerk";
import { getOrCreateUser, getUnansweredQuestions } from "@/lib/db/queries";
import { createAnswer } from "@/lib/actions/answers";
import type { Question } from "@/lib/types";

interface InboxPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/");
  }

  const [, unansweredQuestions, query] = await Promise.all([
    getOrCreateUser(clerkId),
    getUnansweredQuestions(clerkId),
    searchParams,
  ]);

  const error = typeof query?.error === "string" ? decodeURIComponent(query.error) : null;

  const senderIds = Array.from(
    new Set(
      unansweredQuestions
        .filter((question) => question.isAnonymous !== 1)
        .map((question) => question.senderClerkId)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const senderMap = await getClerkUsersByIds(senderIds);

  return (
    <MainContent>
      <h1 className="mb-2 text-3xl font-bold text-foreground">받은 질문</h1>
      <p className="mb-8 text-muted-foreground">아직 답변하지 않은 질문들입니다</p>

      {error && (
        <Alert variant="error" className="mb-6">
          <AlertDescription className="text-center">{error}</AlertDescription>
        </Alert>
      )}

      {unansweredQuestions.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>새로운 질문이 없습니다</EmptyTitle>
            <EmptyDescription>질문이 오면 여기에 표시됩니다.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {unansweredQuestions.map((question: Question) => {
            const sender =
              question.isAnonymous !== 1 && question.senderClerkId
                ? senderMap.get(question.senderClerkId) || null
                : null;
            const isAnonymous = question.isAnonymous === 1 || !sender;
            const senderName = isAnonymous
              ? "익명"
              : sender.displayName || sender.username || "사용자";

            async function submitAnswer(formData: FormData) {
              "use server";
              const content = String(formData.get("answer") || "").trim();
              if (!content) {
                redirect(`/inbox?error=${encodeURIComponent("답변을 입력해주세요")}`);
              }

              const result = await createAnswer({
                questionId: question.id,
                content,
              });

              if (!result.success) {
                redirect(`/inbox?error=${encodeURIComponent(result.error)}`);
              }

              revalidatePath("/inbox");
              redirect("/inbox");
            }

            return (
              <Card key={question.id}>
                <CardPanel className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      {!isAnonymous && sender?.avatarUrl ? (
                        <AvatarImage src={sender.avatarUrl} alt={senderName} />
                      ) : null}
                      <AvatarFallback>{senderName[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-foreground leading-relaxed">{question.content}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {isAnonymous ? "익명" : "공개"} · {formatRelativeTime(question.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <form action={submitAnswer} className="space-y-3">
                    <Textarea name="answer" required placeholder="답변을 입력하세요…" rows={3} size="sm" />
                    <div className="flex justify-end">
                      <Button type="submit" size="sm">답변하기</Button>
                    </div>
                  </form>
                </CardPanel>
              </Card>
            );
          })}
        </div>
      )}
    </MainContent>
  );
}
