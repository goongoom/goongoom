"use client";

import { useForm } from "react-hook-form";
import { HugeiconsIcon } from "@hugeicons/react";
import { LockIcon } from "@hugeicons/core-free-icons";
import { Field, FieldControl } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, Radio } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createQuestion } from "@/lib/actions/questions";

interface QuestionFormProps {
  recipientClerkId: string;
  recipientUsername: string;
}

interface QuestionFormData {
  question: string;
  questionType: "anonymous" | "public";
}

export function QuestionForm({ recipientClerkId, recipientUsername }: QuestionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    setValue,
    formState: { isSubmitting, isSubmitSuccessful, errors },
  } = useForm<QuestionFormData>({
    defaultValues: { question: "", questionType: "anonymous" },
  });

  const questionType = watch("questionType");
  const questionValue = watch("question");

  const onSubmit = async (data: QuestionFormData) => {
    try {
      const result = await createQuestion({
        recipientClerkId,
        content: data.question,
        isAnonymous: data.questionType === "anonymous",
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      reset();
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "질문 전송 실패" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        {recipientUsername} 님에게 새 질문을 남겨보세요
      </h2>
      
      <Field>
        <FieldControl render={<Textarea {...register("question", { required: true })} placeholder="질문을 입력하세요…" className="h-32" />} />
      </Field>
      
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">누구로 질문할까요?</p>
        
        <RadioGroup value={questionType} onValueChange={(val) => setValue("questionType", val as "anonymous" | "public")}>
          <label htmlFor="r-anonymous" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
            <Radio id="r-anonymous" value="anonymous" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">익명</p>
              <p className="text-xs text-gray-500">익명으로 질문합니다</p>
            </div>
          </label>
          
          <label htmlFor="r-public" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
            <Radio id="r-public" value="public" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">공개</p>
              <p className="text-xs text-gray-500">내 이름으로 질문합니다</p>
            </div>
          </label>
        </RadioGroup>
      </div>
      
      {isSubmitSuccessful && (
        <Alert variant="success">
          <AlertDescription className="text-center">질문이 전송되었습니다!</AlertDescription>
        </Alert>
      )}
      
      {errors.root && (
        <Alert variant="error">
          <AlertDescription className="text-center">{errors.root.message}</AlertDescription>
        </Alert>
      )}
      
      <Button
        type="submit"
        disabled={!questionValue.trim() || isSubmitting}
        className="w-full bg-orange-500 hover:bg-orange-600"
      >
        <HugeiconsIcon icon={LockIcon} className="w-4 h-4" aria-hidden="true" />
        {isSubmitting 
          ? "전송 중…" 
          : questionType === "anonymous" ? "익명으로 질문하기" : "공개로 질문하기"}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        질문 시 사용 약관에 동의하게 됩니다
      </p>
    </form>
  );
}
