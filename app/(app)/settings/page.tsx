import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { MainContent } from "@/components/layout/main-content";
import { getClerkUserById } from "@/lib/clerk";
import { getOrCreateUser } from "@/lib/db/queries";
import { ProfileSettingsForm } from "./profile-settings-form";

export default async function SettingsPage() {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    redirect("/");
  }
  
  const clerkUser = await getClerkUserById(clerkId);
  
  if (!clerkUser) {
    return (
      <MainContent>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">프로필 설정이 필요합니다</h1>
          <p className="text-gray-500">계정 설정을 완료해주세요.</p>
        </div>
      </MainContent>
    );
  }
  
  const dbUser = await getOrCreateUser(clerkId);
  
  return (
    <MainContent>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
      <p className="text-gray-500 mb-8">프로필 정보를 수정하세요</p>
      
      <ProfileSettingsForm 
        clerkUser={clerkUser} 
        bio={dbUser?.bio || null} 
        socialLinks={dbUser?.socialLinks || null} 
      />
    </MainContent>
  );
}
