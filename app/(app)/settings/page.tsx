import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { MainContent } from "@/components/layout/main-content";
import { getClerkUserById } from "@/lib/clerk";
import { getOrCreateUser } from "@/lib/db/queries";
import { ProfileSettingsForm } from "./profile-settings-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ProfileSettingsSkeleton } from "@/components/settings/profile-settings-skeleton";
import { DEFAULT_QUESTION_SECURITY_LEVEL } from "@/lib/question-security";

interface SettingsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

async function SettingsStatus({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const error =
    typeof params?.error === "string" ? decodeURIComponent(params.error) : null;
  const updated = params?.updated === "1";

  if (!error && !updated) return null;

  return (
    <Alert variant={error ? "error" : "success"} className="mb-6">
      <AlertDescription className="text-center">
        {error || "프로필이 수정되었습니다!"}
      </AlertDescription>
    </Alert>
  );
}

async function SettingsForm() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/");
  }

  const clerkUser = await getClerkUserById(clerkId);

  if (!clerkUser) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>프로필 설정이 필요합니다</EmptyTitle>
          <EmptyDescription>계정 설정을 완료해주세요.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const dbUser = await getOrCreateUser(clerkId);

  return (
    <ProfileSettingsForm
      clerkUser={clerkUser}
      bio={dbUser?.bio || null}
      socialLinks={dbUser?.socialLinks || null}
      questionSecurityLevel={
        dbUser?.questionSecurityLevel || DEFAULT_QUESTION_SECURITY_LEVEL
      }
    />
  );
}

export default function SettingsPage({ searchParams }: SettingsPageProps) {
  return (
    <MainContent>
      <h1 className="mb-2 text-3xl font-bold text-foreground">설정</h1>
      <p className="mb-8 text-muted-foreground">프로필 정보를 수정하세요</p>

      <Suspense fallback={null}>
        <SettingsStatus searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<ProfileSettingsSkeleton />}>
        <SettingsForm />
      </Suspense>
    </MainContent>
  );
}
