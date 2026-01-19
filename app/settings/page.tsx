import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { MainContent } from "@/components/layout/main-content";
import { getClerkUserById } from "@/lib/clerk";
import { getOrCreateUser } from "@/lib/db/queries";
import { updateProfile } from "@/lib/actions/profile";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel, FieldControl, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, Radio } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  DEFAULT_QUESTION_SECURITY_LEVEL,
  QUESTION_SECURITY_LEVELS,
  QUESTION_SECURITY_OPTIONS,
  isQuestionSecurityLevel,
} from "@/lib/question-security";
import type { SocialLinks } from "@/lib/types";
import { PasskeyNudge } from "@/components/auth/passkey-nudge";

interface SettingsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function normalizeHandle(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const cleaned = trimmed.replace(/^@/, "");
  const looksLikeUrl = /:\/\/|\/|instagram\.com|github\.com|twitter\.com|x\.com|www\./i.test(cleaned);

  if (!looksLikeUrl) {
    return cleaned;
  }

  try {
    const url = new URL(cleaned.includes("://") ? cleaned : `https://${cleaned}`);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0] || "";
  } catch {
    return cleaned.split("/").filter(Boolean)[0] || "";
  }
}

async function SettingsContent({ searchParamsPromise }: { searchParamsPromise?: Promise<Record<string, string | string[] | undefined>> }) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/");
  }

  const [clerkUser, dbUser, query] = await Promise.all([
    getClerkUserById(clerkId),
    getOrCreateUser(clerkId),
    searchParamsPromise,
  ]);

  const error = typeof query?.error === "string" ? decodeURIComponent(query.error) : null;
  const updated = query?.updated === "1";

  if (!clerkUser) {
    return (
      <MainContent>
        <h1 className="mb-2 text-3xl font-bold text-foreground">설정</h1>
        <p className="mb-8 text-muted-foreground">프로필 정보를 수정하세요</p>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>프로필 설정이 필요합니다</EmptyTitle>
            <EmptyDescription>계정 설정을 완료해주세요.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </MainContent>
    );
  }

  const initialBio = dbUser?.bio || null;
  const initialSocialLinks = dbUser?.socialLinks || null;
  const initialQuestionSecurityLevel = dbUser?.questionSecurityLevel || DEFAULT_QUESTION_SECURITY_LEVEL;

  const instagramHandle = initialSocialLinks?.instagram ? normalizeHandle(initialSocialLinks.instagram) : "";
  const githubHandle = initialSocialLinks?.github ? normalizeHandle(initialSocialLinks.github) : "";
  const twitterHandle = initialSocialLinks?.twitter ? normalizeHandle(initialSocialLinks.twitter) : "";

  async function submitProfile(formData: FormData) {
    "use server";

    const normalizeHandle = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return "";
      const cleaned = trimmed.replace(/^@/, "");
      const looksLikeUrl = /:\/\/|\/|instagram\.com|github\.com|twitter\.com|x\.com|www\./i.test(cleaned);
      if (!looksLikeUrl) return cleaned;
      try {
        const url = new URL(cleaned.includes("://") ? cleaned : `https://${cleaned}`);
        const parts = url.pathname.split("/").filter(Boolean);
        return parts[0] || "";
      } catch {
        return cleaned.split("/").filter(Boolean)[0] || "";
      }
    };

    const bio = String(formData.get("bio") || "").trim();
    const instagram = normalizeHandle(String(formData.get("instagram") || ""));
    const github = normalizeHandle(String(formData.get("github") || ""));
    const twitter = normalizeHandle(String(formData.get("twitter") || ""));
    const securityLevel = String(formData.get("questionSecurityLevel") || DEFAULT_QUESTION_SECURITY_LEVEL);

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
    <MainContent>
      <h1 className="mb-2 text-3xl font-bold text-foreground">설정</h1>
      <p className="mb-8 text-muted-foreground">프로필 정보를 수정하세요</p>

      {(error || updated) && (
        <Alert variant={error ? "error" : "success"} className="mb-6">
          <AlertDescription className="text-center">
            {error || "프로필이 수정되었습니다!"}
          </AlertDescription>
        </Alert>
      )}

      <PasskeyNudge />

      <Card className="p-6">
        <form action={submitProfile} className="space-y-6">
          <Field>
            <FieldLabel htmlFor="username">사용자 이름</FieldLabel>
            <FieldControl render={<Input id="username" value={clerkUser.username || ""} disabled />} />
            <FieldDescription>사용자 이름은 Clerk에서 관리됩니다</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="displayName">표시 이름</FieldLabel>
            <FieldControl render={<Input id="displayName" value={clerkUser.displayName || ""} disabled />} />
            <FieldDescription>표시 이름은 Clerk에서 관리됩니다</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="bio">소개</FieldLabel>
            <Textarea id="bio" name="bio" placeholder="자기소개를 입력하세요…" rows={4} defaultValue={initialBio || ""} />
          </Field>

          <Field>
            <FieldLabel>질문 보안 수준</FieldLabel>
            <FieldDescription>익명 질문을 제한해 악성 질문을 줄일 수 있습니다.</FieldDescription>
            <FieldControl
              render={
                <RadioGroup name="questionSecurityLevel" defaultValue={initialQuestionSecurityLevel} className="w-full">
                  {QUESTION_SECURITY_LEVELS.map((level) => {
                    const option = QUESTION_SECURITY_OPTIONS[level];
                    return (
                      <Label
                        key={level}
                        className="flex items-start gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 has-[data-checked]:border-primary/48 has-[data-checked]:bg-accent/50"
                      >
                        <Radio id={`qsl-${level}`} value={level} />
                        <div className="flex flex-col gap-1">
                          <p className="font-medium text-foreground">{option.label}</p>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </Label>
                    );
                  })}
                </RadioGroup>
              }
            />
          </Field>

          <div className="space-y-4 border-t border-border pt-6">
            <div className="space-y-1">
              <h3 className="text-base font-medium text-foreground">소셜 링크</h3>
              <p className="text-xs text-muted-foreground">사용자 이름(핸들)만 입력하세요.</p>
            </div>

            <div className="space-y-4">
              <Field>
                <FieldLabel htmlFor="instagram">Instagram</FieldLabel>
                <FieldControl
                  render={<Input autoCapitalize="none" autoCorrect="off" id="instagram" name="instagram" placeholder="username" defaultValue={instagramHandle} />}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="github">GitHub</FieldLabel>
                <FieldControl
                  render={<Input autoCapitalize="none" autoCorrect="off" id="github" name="github" placeholder="username" defaultValue={githubHandle} />}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="twitter">Twitter / X</FieldLabel>
                <FieldControl
                  render={<Input autoCapitalize="none" autoCorrect="off" id="twitter" name="twitter" placeholder="username" defaultValue={twitterHandle} />}
                />
              </Field>
            </div>
          </div>

          <Button type="submit" className="w-full">저장하기</Button>
        </form>
      </Card>
    </MainContent>
  );
}

export default function SettingsPage({ searchParams }: SettingsPageProps) {
  return <SettingsContent searchParamsPromise={searchParams} />;
}
