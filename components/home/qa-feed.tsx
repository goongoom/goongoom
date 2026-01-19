import { QuestionBubble } from "@/components/questions/question-bubble";
import { AnswerBubble } from "@/components/questions/answer-bubble";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Card, CardPanel } from "@/components/ui/card";
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

function buildShareUrl({
  question,
  answer,
  name,
}: {
  question: string;
  answer: string;
  name: string;
}) {
  const normalize = (value: string, max: number) =>
    value.length > max ? `${value.slice(0, max - 1)}…` : value;
  const params = new URLSearchParams({
    question: normalize(question, 160),
    answer: normalize(answer, 260),
    name: normalize(name, 40),
  });
  return `/api/instagram?${params.toString()}`;
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

function ChatPair({
  question,
  answer,
  recipientName,
  recipientAvatar,
}: {
  question: {
    id: number;
    content: string;
    isAnonymous: number;
    createdAt: Date;
  };
  answer: {
    content: string;
    createdAt: Date;
  };
  recipientName: string;
  recipientAvatar?: string | null;
}) {
  const shareUrl = buildShareUrl({
    question: question.content,
    answer: answer.content,
    name: recipientName,
  });

  return (
    <Card>
      <CardPanel className="flex flex-col gap-4">
        <QuestionBubble
          avatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=anon_${question.id}`}
          content={question.content}
          isAnonymous={question.isAnonymous === 1}
          timestamp={formatRelativeTime(question.createdAt)}
        />
        <AnswerBubble
          avatar={recipientAvatar || null}
          username={recipientName}
          content={answer.content}
          timestamp={formatRelativeTime(answer.createdAt)}
          shareUrl={shareUrl}
        />
      </CardPanel>
    </Card>
  );
}

export function QAFeed({ items, recentItems, recipientName, recipientAvatar }: QAFeedProps) {
  if (recentItems && recentItems.length > 0) {
    return (
      <div className="space-y-6">
        {recentItems.map((item) => {
          const displayName = item.recipientInfo?.displayName || item.recipientInfo?.username || "사용자";
          const avatarUrl = item.recipientInfo?.avatarUrl || null;
          
          return (
            <ChatPair
              key={item.question.id}
              question={item.question}
              answer={item.answer}
              recipientName={displayName}
              recipientAvatar={avatarUrl}
            />
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
          const displayName = recipientName || "사용자";
          
          return (
            <ChatPair
              key={qa.id}
              question={qa}
              answer={answer}
              recipientName={displayName}
              recipientAvatar={recipientAvatar || null}
            />
          );
        })}
      </div>
    );
  }
  
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>아직 답변된 질문이 없습니다.</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}
