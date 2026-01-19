import { MainContent } from "@/components/layout/main-content";
import { ProfileSettingsSkeleton } from "@/components/settings/profile-settings-skeleton";

export default function SettingsLoading() {
  return (
    <MainContent>
      <h1 className="mb-2 text-3xl font-bold text-foreground">설정</h1>
      <p className="mb-8 text-muted-foreground">프로필 정보를 수정하세요</p>
      <ProfileSettingsSkeleton />
    </MainContent>
  );
}
