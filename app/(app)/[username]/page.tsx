import { Suspense, cache } from "react";
import { notFound } from "next/navigation";
import { MainContent } from "@/components/layout/main-content";
import { RightPanel } from "@/components/layout/right-panel";
import { ProfileHeader } from "@/components/profile/profile-header";
import { QuestionForm } from "@/components/profile/question-form";
import { ProfileHeaderSkeleton } from "@/components/profile/profile-header-skeleton";
import { QAFeedSkeleton } from "@/components/profile/qa-feed-skeleton";
import { QuestionFormSkeleton } from "@/components/profile/question-form-skeleton";
import { QAFeed } from "@/components/home/qa-feed";
import { getClerkUserByUsername } from "@/lib/clerk";
import { getOrCreateUser, getUserWithAnsweredQuestions } from "@/lib/db/queries";
import type { QuestionWithAnswers } from "@/lib/types";

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const getClerkUser = cache(async (username: string) => {
  return getClerkUserByUsername(username);
});

const getProfileInfo = cache(async (username: string) => {
  const clerkUser = await getClerkUser(username);
  if (!clerkUser) return null;
  const dbUser = await getOrCreateUser(clerkUser.clerkId);
  return { clerkUser, dbUser };
});

const getAnsweredQuestions = cache(async (username: string) => {
  const clerkUser = await getClerkUser(username);
  if (!clerkUser) return null;
  const { answeredQuestions } = await getUserWithAnsweredQuestions(clerkUser.clerkId);
  return answeredQuestions;
});

async function ProfileHeaderSection({ params }: UserProfilePageProps) {
  const { username } = await params;
  const data = await getProfileInfo(username);
  if (!data) notFound();

  const { clerkUser, dbUser } = data;
  const displayName = clerkUser.displayName || clerkUser.username || username;

  return (
    <ProfileHeader
      avatar={clerkUser.avatarUrl}
      name={displayName}
      username={clerkUser.username || username}
      bio={dbUser?.bio || undefined}
      socialLinks={dbUser?.socialLinks || undefined}
    />
  );
}

async function QAFeedSection({ params }: UserProfilePageProps) {
  const { username } = await params;
  const clerkUser = await getClerkUser(username);
  if (!clerkUser) notFound();

  const answeredQuestions = await getAnsweredQuestions(username);
  if (!answeredQuestions) notFound();

  const displayName = clerkUser.displayName || clerkUser.username || username;

  return (
    <QAFeed
      items={answeredQuestions as QuestionWithAnswers[]}
      recipientName={displayName}
      recipientAvatar={clerkUser.avatarUrl}
    />
  );
}

async function QuestionFormSection({ params, searchParams }: UserProfilePageProps) {
  const { username } = await params;
  const clerkUser = await getClerkUser(username);
  if (!clerkUser) notFound();

  const query = await searchParams;
  const error =
    typeof query?.error === "string" ? decodeURIComponent(query.error) : null;
  const sent = query?.sent === "1";

  const status = error
    ? { type: "error" as const, message: error }
    : sent
      ? { type: "success" as const, message: "질문이 전송되었습니다!" }
      : null;

  return (
    <QuestionForm
      recipientClerkId={clerkUser.clerkId}
      recipientUsername={clerkUser.username || username}
      status={status}
    />
  );
}

export default function UserProfilePage({
  params,
  searchParams,
}: UserProfilePageProps) {
  return (
    <>
      <MainContent>
        <Suspense fallback={<ProfileHeaderSkeleton />}>
          <ProfileHeaderSection params={params} />
        </Suspense>

        <Suspense fallback={<QAFeedSkeleton />}>
          <QAFeedSection params={params} />
        </Suspense>
      </MainContent>

      <RightPanel>
        <Suspense fallback={<QuestionFormSkeleton />}>
          <QuestionFormSection params={params} searchParams={searchParams} />
        </Suspense>
      </RightPanel>
    </>
  );
}
