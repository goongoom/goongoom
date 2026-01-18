"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/stores/user-store";
import type { ClerkUserInfo, SocialLinks } from "@/lib/types";
import { Field, FieldLabel, FieldControl, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

interface ProfileSettingsFormProps {
  clerkUser: ClerkUserInfo;
  bio: string | null;
  socialLinks: SocialLinks | null;
}

interface ProfileFormData {
  bio: string;
  instagram: string;
  github: string;
  twitter: string;
}

export function ProfileSettingsForm({ clerkUser, bio: initialBio, socialLinks: initialSocialLinks }: ProfileSettingsFormProps) {
  const router = useRouter();
  const { updateProfile } = useUserStore();
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, isSubmitSuccessful, errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      bio: initialBio || "",
      instagram: initialSocialLinks?.instagram || "",
      github: initialSocialLinks?.github || "",
      twitter: initialSocialLinks?.twitter || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    const socialLinks: SocialLinks = {};
    if (data.instagram) socialLinks.instagram = data.instagram;
    if (data.github) socialLinks.github = data.github;
    if (data.twitter) socialLinks.twitter = data.twitter;
    
    try {
      await updateProfile({
        bio: data.bio || null,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
      });
      
      router.refresh();
    } catch {
      setError("root", { message: "프로필 수정에 실패했습니다" });
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Field>
          <FieldLabel htmlFor="username">사용자 이름</FieldLabel>
          <FieldControl render={<Input id="username" value={clerkUser.username || ""} disabled className="bg-gray-50 text-gray-500" />} />
          <FieldDescription>사용자 이름은 Clerk에서 관리됩니다</FieldDescription>
        </Field>
        
        <Field>
          <FieldLabel htmlFor="displayName">표시 이름</FieldLabel>
          <FieldControl render={<Input id="displayName" value={clerkUser.displayName || ""} disabled className="bg-gray-50 text-gray-500" />} />
          <FieldDescription>표시 이름은 Clerk에서 관리됩니다</FieldDescription>
        </Field>
        
        <Field>
          <FieldLabel htmlFor="bio">소개</FieldLabel>
          <Textarea id="bio" {...register("bio")} placeholder="자기소개를 입력하세요" rows={4} />
        </Field>
      
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">소셜 링크</h3>
          
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="instagram">Instagram</FieldLabel>
              <FieldControl render={<Input type="url" id="instagram" {...register("instagram")} placeholder="https://instagram.com/username" />} />
            </Field>
            
            <Field>
              <FieldLabel htmlFor="github">GitHub</FieldLabel>
              <FieldControl render={<Input type="url" id="github" {...register("github")} placeholder="https://github.com/username" />} />
            </Field>
            
            <Field>
              <FieldLabel htmlFor="twitter">Twitter / X</FieldLabel>
              <FieldControl render={<Input type="url" id="twitter" {...register("twitter")} placeholder="https://twitter.com/username" />} />
            </Field>
          </div>
        </div>
        
        {isSubmitSuccessful && (
          <Alert variant="success">
            <AlertDescription className="text-center">프로필이 수정되었습니다!</AlertDescription>
          </Alert>
        )}
        
        {errors.root && (
          <Alert variant="error">
            <AlertDescription className="text-center">{errors.root.message}</AlertDescription>
          </Alert>
        )}
        
        <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-500 hover:bg-orange-600">
          {isSubmitting ? "저장 중..." : "저장하기"}
        </Button>
      </form>
    </Card>
  );
}
