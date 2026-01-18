"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { useInboxStore } from "@/lib/stores/inbox-store";
import type { Question } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  onAnswered: () => void;
}

interface AnswerFormData {
  answer: string;
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

export function QuestionCard({ question, onAnswered }: QuestionCardProps) {
  const { answerQuestion } = useInboxStore();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<AnswerFormData>({ defaultValues: { answer: "" } });

  const onSubmit = async (data: AnswerFormData) => {
    const success = await answerQuestion(question.id, data.answer);
    
    if (success) {
      reset();
      onAnswered();
    } else {
      setError("root", { message: "답변 전송에 실패했습니다" });
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex gap-3 items-start mb-4">
        <Image
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=anon_${question.id}`}
          alt="Anonymous"
          width={40}
          height={40}
          className="rounded-full flex-shrink-0"
        />
        <div className="flex-1">
          <p className="text-gray-900 leading-relaxed">{question.content}</p>
          <p className="text-xs text-gray-500 mt-1">
            {question.isAnonymous === 1 ? "익명" : "공개"} · {formatRelativeTime(question.createdAt)}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="border-t border-gray-100 pt-4">
        <textarea
          {...register("answer", { required: true })}
          placeholder="답변을 입력하세요..."
          className="w-full h-24 px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        />
        
        {errors.root && (
          <p className="text-red-500 text-sm mt-2">{errors.root.message}</p>
        )}
        
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
          >
            {isSubmitting ? "전송 중..." : "답변하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
