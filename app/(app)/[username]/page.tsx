import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MainContent } from "@/components/layout/main-content";
import { RightPanel } from "@/components/layout/right-panel";
import { ProfileHeader } from "@/components/profile/profile-header";
import { QuestionForm } from "@/components/profile/question-form";
import { QAFeed } from "@/components/home/qa-feed";
import { getClerkUserByUsername } from "@/lib/clerk";
import { getOrCreateUser, getUserWithAnsweredQuestions } from "@/lib/db/queries";
import type { QuestionWithAnswers } from "@/lib/types";
import AppLoading from "../loading";

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

async function UserProfilePageContent({ params }: UserProfilePageProps) {
  const { username } = await params;
  
  const clerkUser = await getClerkUserByUsername(username);
  
  if (!clerkUser) {
    notFound();
  }
  
  const [, { user: dbUser, answeredQuestions }] = await Promise.all([
    getOrCreateUser(clerkUser.clerkId),
    getUserWithAnsweredQuestions(clerkUser.clerkId),
  ]);
  
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
  
  return (
    <>
      <MainContent>
        <ProfileHeader
          avatar={clerkUser.avatarUrl || defaultAvatar}
          name={clerkUser.displayName || clerkUser.username || username}
          username={clerkUser.username || username}
          bio={dbUser?.bio || undefined}
          socialLinks={dbUser?.socialLinks || undefined}
        />
        
        <QAFeed 
          items={answeredQuestions as QuestionWithAnswers[]}
          recipientName={clerkUser.displayName || clerkUser.username || username}
          recipientAvatar={clerkUser.avatarUrl || defaultAvatar}
        />
      </MainContent>
      
      <RightPanel>
        <QuestionForm recipientClerkId={clerkUser.clerkId} recipientUsername={clerkUser.username || username} />
      </RightPanel>
    </>
  );
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  return (
    <Suspense fallback={<AppLoading />}>
      <UserProfilePageContent params={params} />
    </Suspense>
  );
}
