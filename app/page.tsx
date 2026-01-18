import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";
import { RightPanel } from "@/components/layout/RightPanel";
import { HeroCard } from "@/components/home/HeroCard";
import { QAFeed } from "@/components/home/QAFeed";
import { PeopleList } from "@/components/home/PeopleList";
import { getRecentAnsweredQuestions } from "@/lib/db/queries";
import { getClerkUsersByIds } from "@/lib/clerk";

export default async function HomePage() {
  const recentQA = await getRecentAnsweredQuestions(10);
  
  const clerkIds = [...new Set(recentQA.map(qa => qa.recipientClerkId))];
  const clerkUsersMap = await getClerkUsersByIds(clerkIds);
  
  const enrichedQA = recentQA.map(qa => ({
    ...qa,
    recipientInfo: clerkUsersMap.get(qa.recipientClerkId) || undefined,
  }));
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <MainContent>
        <HeroCard />
        <QAFeed recentItems={enrichedQA} />
      </MainContent>
      
      <RightPanel>
        <PeopleList />
      </RightPanel>
    </div>
  );
}
