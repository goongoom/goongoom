import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ClerkUserInfo, SocialLinks } from "@/lib/types";
import { Field, FieldLabel, FieldControl, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { RadioGroup, Radio } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions/profile";
import {
  DEFAULT_QUESTION_SECURITY_LEVEL,
  QUESTION_SECURITY_LEVELS,
  QUESTION_SECURITY_OPTIONS,
  isQuestionSecurityLevel,
} from "@/lib/question-security";
import type { QuestionSecurityLevel } from "@/lib/question-security";

interface ProfileSettingsFormProps {
  clerkUser: ClerkUserInfo;
  bio: string | null;
  socialLinks: SocialLinks | null;
  questionSecurityLevel: QuestionSecurityLevel;
  status?: { type: "success" | "error"; message: string } | null;
}

export function ProfileSettingsForm({
  clerkUser,
  bio: initialBio,
  socialLinks: initialSocialLinks,
  questionSecurityLevel: initialQuestionSecurityLevel,
  status,
}: ProfileSettingsFormProps) {
  const normalizeHandle = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const cleaned = trimmed.replace(/^@/, "");
    const looksLikeUrl =
      /:\/\/|\/|instagram\.com|github\.com|twitter\.com|x\.com|www\./i.test(
        cleaned,
      );

    if (!looksLikeUrl) {
      return cleaned;
    }

    try {
      const url = new URL(
        cleaned.includes("://") ? cleaned : `https://${cleaned}`,
      );
      const parts = url.pathname.split("/").filter(Boolean);
      return parts[0] || "";
    } catch {
      return cleaned.split("/").filter(Boolean)[0] || "";
    }
  };

  const instagramHandle = initialSocialLinks?.instagram
    ? normalizeHandle(initialSocialLinks.instagram)
    : "";
  const githubHandle = initialSocialLinks?.github
    ? normalizeHandle(initialSocialLinks.github)
    : "";
  const twitterHandle = initialSocialLinks?.twitter
    ? normalizeHandle(initialSocialLinks.twitter)
    : "";

  async function submitProfile(formData: FormData) {
    "use server";

    const bio = String(formData.get("bio") || "").trim();
    const instagram = normalizeHandle(String(formData.get("instagram") || ""));
    const github = normalizeHandle(String(formData.get("github") || ""));
    const twitter = normalizeHandle(String(formData.get("twitter") || ""));
    const securityLevel = String(
      formData.get("questionSecurityLevel") || DEFAULT_QUESTION_SECURITY_LEVEL,
    );

    if (!isQuestionSecurityLevel(securityLevel)) {
      redirect(`/settings?error=${encodeURIComponent("질문 보안 설정이 올바르지 않습니다")}`);
    }

    const links: SocialLinks = {};
    if (instagram) links.instagram = instagram;
    if (github) links.github = github;
    if (twitter) links.twitter = twitter;

    const result = await updateProfile({
      bio: bio || null,
      socialLinks: Object.keys(links).length ? links : null,
      questionSecurityLevel: securityLevel,
    });

    if (!result.success) {
      redirect(`/settings?error=${encodeURIComponent(result.error)}`);
    }

    revalidatePath("/settings");
    redirect("/settings?updated=1");
  }

  return (
    <Card className="p-6">
      <form action={submitProfile} className="space-y-6">
        <Field>
          <FieldLabel htmlFor="username">사용자 이름</FieldLabel>
          <FieldControl
            render={
              <Input
                id="username"
                value={clerkUser.username || ""}
                disabled
              />
            }
          />
          <FieldDescription>사용자 이름은 Clerk에서 관리됩니다</FieldDescription>
        </Field>
        
        <Field>
          <FieldLabel htmlFor="displayName">표시 이름</FieldLabel>
          <FieldControl
            render={
              <Input
                id="displayName"
                value={clerkUser.displayName || ""}
                disabled
              />
            }
          />
          <FieldDescription>표시 이름은 Clerk에서 관리됩니다</FieldDescription>
        </Field>
        
        <Field>
          <FieldLabel htmlFor="bio">소개</FieldLabel>
          <Textarea
            id="bio"
            name="bio"
            placeholder="자기소개를 입력하세요…"
            rows={4}
            defaultValue={initialBio || ""}
          />
        </Field>

        <Field>
          <FieldLabel>질문 보안 수준</FieldLabel>
          <FieldDescription>
            익명 질문을 제한해 악성 질문을 줄일 수 있습니다.
          </FieldDescription>
          <FieldControl
            render={
              <RadioGroup
                name="questionSecurityLevel"
                defaultValue={initialQuestionSecurityLevel}
                className="w-full"
              >
                {QUESTION_SECURITY_LEVELS.map((level) => {
                  const option = QUESTION_SECURITY_OPTIONS[level];
                  return (
                    <Label
                      key={level}
                      className="flex items-start gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 has-[data-checked]:border-primary/48 has-[data-checked]:bg-accent/50"
                    >
                      <Radio id={`qsl-${level}`} value={level} />
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-foreground">
                          {option.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </Label>
                  );
                })}
              </RadioGroup>
            }
          />
        </Field>

        <div className="space-y-4">
          <Separator />
          <div className="space-y-1">
            <h3 className="text-base font-medium text-foreground">소셜 링크</h3>
            <p className="text-xs text-muted-foreground">
              사용자 이름(핸들)만 입력하세요.
            </p>
          </div>

          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="instagram">Instagram</FieldLabel>
              <FieldControl
                render={
                  <Input
                    autoCapitalize="none"
                    autoCorrect="off"
                    id="instagram"
                    name="instagram"
                    placeholder="username"
                    defaultValue={instagramHandle}
                  />
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="github">GitHub</FieldLabel>
              <FieldControl
                render={
                  <Input
                    autoCapitalize="none"
                    autoCorrect="off"
                    id="github"
                    name="github"
                    placeholder="username"
                    defaultValue={githubHandle}
                  />
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="twitter">Twitter / X</FieldLabel>
              <FieldControl
                render={
                  <Input
                    autoCapitalize="none"
                    autoCorrect="off"
                    id="twitter"
                    name="twitter"
                    placeholder="username"
                    defaultValue={twitterHandle}
                  />
                }
              />
            </Field>
          </div>
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
        
        <Button type="submit" className="w-full">
          저장하기
        </Button>
      </form>
    </Card>
  );
}
