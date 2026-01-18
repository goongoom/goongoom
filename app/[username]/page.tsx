import { notFound } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";
import { RightPanel } from "@/components/layout/RightPanel";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { QuestionForm } from "@/components/profile/QuestionForm";
import { QAFeed } from "@/components/home/QAFeed";
import { getClerkUserByUsername } from "@/lib/clerk";
import { getUserByClerkId, getAnsweredQuestionsForUser, getOrCreateUser } from "@/lib/db/queries";
import type { QuestionWithAnswers } from "@/lib/types";

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params;
  
  const clerkUser = await getClerkUserByUsername(username);
  
  if (!clerkUser) {
    notFound();
  }
  
  await getOrCreateUser(clerkUser.clerkId);
  
  const dbUser = await getUserByClerkId(clerkUser.clerkId);
  const questionsWithAnswers = await getAnsweredQuestionsForUser(clerkUser.clerkId);
  
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <MainContent>
        <ProfileHeader
          avatar={clerkUser.avatarUrl || defaultAvatar}
          name={clerkUser.displayName || clerkUser.username || username}
          username={clerkUser.username || username}
          bio={dbUser?.bio || undefined}
          socialLinks={dbUser?.socialLinks || undefined}
        />
        
        <QAFeed 
          items={questionsWithAnswers as QuestionWithAnswers[]}
          recipientName={clerkUser.displayName || clerkUser.username || username}
          recipientAvatar={clerkUser.avatarUrl || defaultAvatar}
        />
      </MainContent>
      
      <RightPanel>
        <QuestionForm recipientClerkId={clerkUser.clerkId} recipientUsername={clerkUser.username || username} />
      </RightPanel>
    </div>
  );
}
