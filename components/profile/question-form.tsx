import { HugeiconsIcon } from "@hugeicons/react";
import { LockIcon } from "@hugeicons/core-free-icons";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Field, FieldControl } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, Radio } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createQuestion } from "@/lib/actions/questions";

interface QuestionFormProps {
  recipientClerkId: string;
  recipientUsername: string;
  status?: { type: "success" | "error"; message: string } | null;
}

export function QuestionForm({ recipientClerkId, recipientUsername, status }: QuestionFormProps) {
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

  return (
    <form action={submitQuestion} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        {recipientUsername} 님에게 새 질문을 남겨보세요
      </h2>
      
      <Field>
        <FieldControl
          render={
            <Textarea
              name="question"
              placeholder="질문을 입력하세요…"
              className="h-32"
              required
            />
          }
        />
      </Field>
      
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">누구로 질문할까요?</p>
        
        <RadioGroup name="questionType" defaultValue="anonymous">
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
      
      {status?.type === "success" && (
        <Alert variant="success">
          <AlertDescription className="text-center">{status.message}</AlertDescription>
        </Alert>
      )}
      
      {status?.type === "error" && (
        <Alert variant="error">
          <AlertDescription className="text-center">{status.message}</AlertDescription>
        </Alert>
      )}
      
      <Button
        type="submit"
        className="w-full bg-orange-500 hover:bg-orange-600"
      >
        <HugeiconsIcon icon={LockIcon} className="w-4 h-4" aria-hidden="true" />
        질문 보내기
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        질문 시 사용 약관에 동의하게 됩니다
      </p>
    </form>
  );
}
