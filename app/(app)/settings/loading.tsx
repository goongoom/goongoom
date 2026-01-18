import { MainContent } from "@/components/layout/main-content";
import { ProfileSettingsSkeleton } from "@/components/settings/profile-settings-skeleton";

export default function SettingsLoading() {
  return (
    <MainContent>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
      <p className="text-gray-500 mb-8">프로필 정보를 수정하세요</p>
      <ProfileSettingsSkeleton />
    </MainContent>
  );
}
