import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ClerkUserInfo, SocialLinks } from "@/lib/types";
import { Field, FieldLabel, FieldControl, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { updateProfile } from "@/lib/actions/profile";

interface ProfileSettingsFormProps {
  clerkUser: ClerkUserInfo;
  bio: string | null;
  socialLinks: SocialLinks | null;
  status?: { type: "success" | "error"; message: string } | null;
}

export function ProfileSettingsForm({
  clerkUser,
  bio: initialBio,
  socialLinks: initialSocialLinks,
  status,
}: ProfileSettingsFormProps) {
  async function submitProfile(formData: FormData) {
    "use server";

    const bio = String(formData.get("bio") || "").trim();
    const instagram = String(formData.get("instagram") || "").trim();
    const github = String(formData.get("github") || "").trim();
    const twitter = String(formData.get("twitter") || "").trim();

    const links: SocialLinks = {};
    if (instagram) links.instagram = instagram;
    if (github) links.github = github;
    if (twitter) links.twitter = twitter;

    const result = await updateProfile({
      bio: bio || null,
      socialLinks: Object.keys(links).length ? links : null,
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
                className="bg-gray-50 text-gray-500"
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
                className="bg-gray-50 text-gray-500"
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
      
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">소셜 링크</h3>
          
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="instagram">Instagram</FieldLabel>
              <FieldControl
                render={
                  <Input
                    type="url"
                    id="instagram"
                    name="instagram"
                    placeholder="https://instagram.com/username"
                    defaultValue={initialSocialLinks?.instagram || ""}
                  />
                }
              />
            </Field>
            
            <Field>
              <FieldLabel htmlFor="github">GitHub</FieldLabel>
              <FieldControl
                render={
                  <Input
                    type="url"
                    id="github"
                    name="github"
                    placeholder="https://github.com/username"
                    defaultValue={initialSocialLinks?.github || ""}
                  />
                }
              />
            </Field>
            
            <Field>
              <FieldLabel htmlFor="twitter">Twitter / X</FieldLabel>
              <FieldControl
                render={
                  <Input
                    type="url"
                    id="twitter"
                    name="twitter"
                    placeholder="https://twitter.com/username"
                    defaultValue={initialSocialLinks?.twitter || ""}
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
        
        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
          저장하기
        </Button>
      </form>
    </Card>
  );
}
