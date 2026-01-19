import { HugeiconsIcon } from "@hugeicons/react";
import { LockIcon } from "@hugeicons/core-free-icons";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Field, FieldControl } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, Radio } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { createQuestion } from "@/lib/actions/questions";
import {
  DEFAULT_QUESTION_SECURITY_LEVEL,
  type QuestionSecurityLevel,
} from "@/lib/question-security";

interface QuestionFormProps {
  recipientClerkId: string;
  recipientUsername: string;
  questionSecurityLevel?: QuestionSecurityLevel | null;
  viewerIsVerified: boolean;
  status?: { type: "success" | "error"; message: string } | null;
}

export function QuestionForm({
  recipientClerkId,
  recipientUsername,
  questionSecurityLevel,
  viewerIsVerified,
  status,
}: QuestionFormProps) {
  const securityLevel = questionSecurityLevel || DEFAULT_QUESTION_SECURITY_LEVEL;
  const canAskAnonymously =
    securityLevel !== "public_only" &&
    (securityLevel === "anyone" || viewerIsVerified);
  const canAskPublic = viewerIsVerified;

  const defaultQuestionType = canAskAnonymously ? "anonymous" : "public";
  const showSecurityNotice =
    securityLevel === "verified_anonymous" ||
    securityLevel === "public_only" ||
    (!viewerIsVerified && securityLevel === "anyone");

  const securityNotice =
    securityLevel === "verified_anonymous"
      ? "익명 질문은 로그인 사용자만 가능하며, 사법 기관 요청이 없는 한 이름은 공개되지 않습니다."
      : securityLevel === "public_only"
        ? "이 사용자는 공개 질문만 받습니다."
        : "로그인하면 공개 질문도 보낼 수 있어요.";

  if (!viewerIsVerified && securityLevel !== "anyone") {
    const warningMessage =
      securityLevel === "public_only"
        ? "이 사용자는 공개 질문만 받습니다. 로그인 후 질문해 주세요."
        : "이 사용자는 익명 질문을 로그인 사용자에게만 허용합니다. 로그인 후 질문해 주세요.";

    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          {recipientUsername} 님에게 새 질문을 남겨보세요
        </h2>

        {status?.type === "error" && (
          <Alert variant="error">
            <AlertDescription className="text-center">
              {status.message}
            </AlertDescription>
          </Alert>
        )}

        <Alert variant="warning">
          <AlertDescription>{warningMessage}</AlertDescription>
          <AlertAction>
            <Button
              render={<Link href="/sign-in" />}
              size="sm"
            >
              로그인
            </Button>
          </AlertAction>
        </Alert>
      </div>
    );
  }

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
      <h2 className="text-lg font-semibold text-foreground">
        {recipientUsername} 님에게 새 질문을 남겨보세요
      </h2>
      
      <Field>
        <FieldControl
          render={
            <Textarea
              name="question"
              placeholder="질문을 입력하세요…"
              rows={4}
              size="lg"
              required
            />
          }
        />
      </Field>
      
      {showSecurityNotice && (
        <Alert variant="info">
          <AlertDescription>{securityNotice}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          누구로 질문할까요?
        </p>

        <RadioGroup name="questionType" defaultValue={defaultQuestionType}>
          {canAskAnonymously && (
            <Label className="flex items-start gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 has-[data-checked]:border-primary/48 has-[data-checked]:bg-accent/50">
              <Radio id="r-anonymous" value="anonymous" />
              <div className="flex flex-col gap-1">
                <p className="font-medium text-foreground">익명</p>
                <p className="text-xs text-muted-foreground">
                  익명으로 질문합니다
                </p>
              </div>
            </Label>
          )}

          {canAskPublic && (
            <Label className="flex items-start gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 has-[data-checked]:border-primary/48 has-[data-checked]:bg-accent/50">
              <Radio id="r-public" value="public" />
              <div className="flex flex-col gap-1">
                <p className="font-medium text-foreground">공개</p>
                <p className="text-xs text-muted-foreground">
                  내 이름으로 질문합니다
                </p>
              </div>
            </Label>
          )}
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
        className="w-full"
        size="lg"
      >
        <HugeiconsIcon icon={LockIcon} className="size-4" aria-hidden="true" />
        질문 보내기
      </Button>
      
      <p className="text-center text-xs text-muted-foreground">
        질문 시 사용 약관에 동의하게 됩니다
      </p>
    </form>
  );
}
