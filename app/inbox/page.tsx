import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { MainContent } from "@/components/layout/main-content";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getClerkUsersByIds } from "@/lib/clerk";
import { getOrCreateUser, getUnansweredQuestions } from "@/lib/db/queries";
import { InboxList } from "./inbox-list";
import type { Question } from "@/lib/types";

interface InboxPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

async function InboxContent({ 
  searchParamsPromise 
}: { 
  searchParamsPromise?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/");

  const [, unansweredQuestions, query] = await Promise.all([
    getOrCreateUser(clerkId),
    getUnansweredQuestions(clerkId),
    searchParamsPromise,
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

  const questionsWithSenders = unansweredQuestions.map((question: Question) => {
    const sender =
      question.isAnonymous !== 1 && question.senderClerkId
        ? senderMap.get(question.senderClerkId) || null
        : null;
    const isAnonymous = question.isAnonymous === 1 || !sender;
    
    return {
      id: question.id,
      content: question.content,
      isAnonymous,
      createdAt: question.createdAt,
      senderName: isAnonymous ? "익명" : sender?.displayName || sender?.username || "사용자",
      senderAvatarUrl: isAnonymous ? undefined : sender?.avatarUrl,
    };
  });

  return (
    <MainContent>
      <h1 className="mb-2 text-3xl font-bold text-foreground">받은 질문</h1>
      <p className="mb-8 text-muted-foreground">아직 답변하지 않은 질문들입니다</p>

      {error && (
        <Alert variant="error" className="mb-6">
          <AlertDescription className="text-center">{error}</AlertDescription>
        </Alert>
      )}

      {questionsWithSenders.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>새로운 질문이 없습니다</EmptyTitle>
            <EmptyDescription>질문이 오면 여기에 표시됩니다.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <InboxList questions={questionsWithSenders} />
      )}
    </MainContent>
  );
}

export default function InboxPage({ searchParams }: InboxPageProps) {
  return (
    <Suspense fallback={null}>
      <InboxContent searchParamsPromise={searchParams} />
    </Suspense>
  );
}
