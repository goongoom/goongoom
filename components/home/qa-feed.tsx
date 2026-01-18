import { QuestionBubble } from "@/components/questions/question-bubble";
import { AnswerBubble } from "@/components/questions/answer-bubble";
import type { QuestionWithAnswers } from "@/lib/types";

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

type RecentQAItem = {
  question: {
    id: number
    content: string
    isAnonymous: number
    createdAt: Date
    recipientClerkId: string
  }
  answer: {
    id: number
    content: string
    createdAt: Date
  }
  recipientClerkId: string
  recipientInfo?: {
    displayName: string | null
    avatarUrl: string | null
    username: string | null
  }
}

interface QAFeedProps {
  items?: QuestionWithAnswers[];
  recentItems?: RecentQAItem[];
  recipientName?: string;
  recipientAvatar?: string | null;
}

export function QAFeed({ items, recentItems, recipientName, recipientAvatar }: QAFeedProps) {
  if (recentItems && recentItems.length > 0) {
    return (
      <div className="space-y-6">
        {recentItems.map((item) => {
          const displayName = item.recipientInfo?.displayName || item.recipientInfo?.username || "사용자";
          const avatarUrl = item.recipientInfo?.avatarUrl || null;
          
          return (
            <div key={item.question.id} className="space-y-4">
              <QuestionBubble
                avatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=anon_${item.question.id}`}
                content={item.question.content}
                isAnonymous={item.question.isAnonymous === 1}
                timestamp={formatRelativeTime(item.question.createdAt)}
              />
              <AnswerBubble
                avatar={avatarUrl}
                username={displayName}
                content={item.answer.content}
                timestamp={formatRelativeTime(item.answer.createdAt)}
              />
            </div>
          );
        })}
      </div>
    );
  }
  
  if (items && items.length > 0) {
    return (
      <div className="space-y-6">
        {items.map((qa) => {
          const answer = qa.answers[0];
          if (!answer) return null;
          
          return (
            <div key={qa.id} className="space-y-4">
              <QuestionBubble
                avatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=anon_${qa.id}`}
                content={qa.content}
                isAnonymous={qa.isAnonymous === 1}
                timestamp={formatRelativeTime(qa.createdAt)}
              />
              <AnswerBubble
                avatar={recipientAvatar || null}
                username={recipientName || "사용자"}
                content={answer.content}
                timestamp={formatRelativeTime(answer.createdAt)}
              />
            </div>
          );
        })}
      </div>
    );
  }
  
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">아직 답변된 질문이 없습니다.</p>
    </div>
  );
}
