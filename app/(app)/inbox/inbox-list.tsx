import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { QuestionCard } from "@/components/inbox/question-card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { getClerkUsersByIds } from "@/lib/clerk";
import { getOrCreateUser, getUnansweredQuestions } from "@/lib/db/queries";
import type { Question } from "@/lib/types";

export async function InboxList() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/");
  }

  const [, unansweredQuestions] = await Promise.all([
    getOrCreateUser(clerkId),
    getUnansweredQuestions(clerkId),
  ]);

  const senderIds = Array.from(
    new Set(
      unansweredQuestions
        .filter((question) => question.isAnonymous !== 1)
        .map((question) => question.senderClerkId)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const senderMap = await getClerkUsersByIds(senderIds);

  if (unansweredQuestions.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>새로운 질문이 없습니다</EmptyTitle>
          <EmptyDescription>질문이 오면 여기에 표시됩니다.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      {unansweredQuestions.map((question: Question) => (
        <QuestionCard
          key={question.id}
          question={question}
          sender={
            question.isAnonymous !== 1 && question.senderClerkId
              ? senderMap.get(question.senderClerkId) || null
              : null
          }
        />
      ))}
    </div>
  );
}
