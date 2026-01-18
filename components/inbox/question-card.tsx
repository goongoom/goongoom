import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ClerkUserInfo } from "@/lib/clerk";
import type { Question } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createAnswer } from "@/lib/actions/answers";

interface QuestionCardProps {
  question: Question;
  sender?: ClerkUserInfo | null;
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

export function QuestionCard({ question, sender }: QuestionCardProps) {
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
    <Card className="p-6">
      <div className="flex gap-3 items-start mb-4">
        <Avatar className="w-10 h-10 flex-shrink-0">
          {isAnonymous ? null : sender?.avatarUrl ? (
            <AvatarImage src={sender.avatarUrl} alt={senderName} />
          ) : null}
          <AvatarFallback>{senderName[0] || "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-gray-900 leading-relaxed">{question.content}</p>
          <p className="text-xs text-gray-500 mt-1">
            {isAnonymous ? "익명" : "공개"} · {formatRelativeTime(question.createdAt)}
          </p>
        </div>
      </div>
      
      <form action={submitAnswer} className="border-t border-gray-100 pt-4">
        <Textarea
          name="answer"
          required
          placeholder="답변을 입력하세요…"
          className="h-24 text-sm"
        />
        
        <div className="flex justify-end mt-3">
          <Button
            type="submit"
            className="px-6 py-2 bg-orange-500 text-sm"
          >
            답변하기
          </Button>
        </div>
      </form>
    </Card>
  );
}
