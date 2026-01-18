"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/inbox/question-card";
import { useInboxStore } from "@/lib/stores/inbox-store";
import type { Question } from "@/lib/types";

interface InboxListProps {
  initialQuestions: Question[];
}

export function InboxList({ initialQuestions }: InboxListProps) {
  const router = useRouter();
  const questions = useInboxStore((state) => state.questions);
  const setQuestions = useInboxStore((state) => state.setQuestions);
  const removeQuestion = useInboxStore((state) => state.removeQuestion);

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions, setQuestions]);

  const handleAnswered = (questionId: number) => {
    removeQuestion(questionId);
    router.refresh();
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <p className="text-gray-500">새로운 질문이 없습니다.</p>
        <p className="text-gray-400 text-sm mt-2">질문이 오면 여기에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onAnswered={() => handleAnswered(question.id)}
        />
      ))}
    </div>
  );
}
