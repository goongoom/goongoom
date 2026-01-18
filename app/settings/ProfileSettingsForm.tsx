"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/stores/user-store";
import type { ClerkUserInfo, SocialLinks } from "@/lib/types";

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
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
          사용자 이름
        </label>
        <input
          type="text"
          id="username"
          value={clerkUser.username || ""}
          disabled
          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
        />
        <p className="text-xs text-gray-500 mt-1">사용자 이름은 Clerk에서 관리됩니다</p>
      </div>
      
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
          표시 이름
        </label>
        <input
          type="text"
          id="displayName"
          value={clerkUser.displayName || ""}
          disabled
          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
        />
        <p className="text-xs text-gray-500 mt-1">표시 이름은 Clerk에서 관리됩니다</p>
      </div>
      
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
          소개
        </label>
        <textarea
          id="bio"
          {...register("bio")}
          placeholder="자기소개를 입력하세요"
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
      
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">소셜 링크</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
              Instagram
            </label>
            <input
              type="url"
              id="instagram"
              {...register("instagram")}
              placeholder="https://instagram.com/username"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">
              GitHub
            </label>
            <input
              type="url"
              id="github"
              {...register("github")}
              placeholder="https://github.com/username"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">
              Twitter / X
            </label>
            <input
              type="url"
              id="twitter"
              {...register("twitter")}
              placeholder="https://twitter.com/username"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      {isSubmitSuccessful && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
          프로필이 수정되었습니다!
        </div>
      )}
      
      {errors.root && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
          {errors.root.message}
        </div>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "저장 중..." : "저장하기"}
      </button>
    </form>
  );
}
