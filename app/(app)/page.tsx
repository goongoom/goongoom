import { Suspense, cache } from "react";
import { MainContent } from "@/components/layout/main-content";
import { RightPanel } from "@/components/layout/right-panel";
import { HeroCard } from "@/components/home/hero-card";
import { QAFeed } from "@/components/home/qa-feed";
import { PeopleList } from "@/components/home/people-list";
import { QAFeedSkeleton } from "@/components/profile/qa-feed-skeleton";
import { PeopleListSkeleton } from "@/components/home/people-list-skeleton";
import { getRecentAnsweredQuestions } from "@/lib/db/queries";
import { getClerkUsersByIds } from "@/lib/clerk";

const getRecentQA = cache(async () => {
  const recentQA = await getRecentAnsweredQuestions(10);
  const clerkIds = Array.from(
    new Set(recentQA.map((qa) => qa.recipientClerkId)),
  );
  const clerkUsersMap = await getClerkUsersByIds(clerkIds);

  const enrichedQA = recentQA.map((qa) => ({
    ...qa,
    recipientInfo: clerkUsersMap.get(qa.recipientClerkId) || undefined,
  }));

  const people = clerkIds
    .map((id) => {
      const user = clerkUsersMap.get(id);
      if (!user) return null;
      return {
        clerkId: id,
        displayName: user.displayName,
        username: user.username,
        avatarUrl: user.avatarUrl,
      };
    })
    .filter(Boolean)
    .slice(0, 4) as {
    clerkId: string;
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
  }[];

  return { enrichedQA, people };
});

async function RecentQAFeed() {
  const { enrichedQA } = await getRecentQA();
  return <QAFeed recentItems={enrichedQA} />;
}

async function RecentPeople() {
  const { people } = await getRecentQA();
  return <PeopleList people={people} />;
}

export default function HomePage() {
  return (
    <>
      <MainContent>
        <HeroCard />
        <Suspense fallback={<QAFeedSkeleton />}>
          <RecentQAFeed />
        </Suspense>
      </MainContent>

      <RightPanel>
        <Suspense fallback={<PeopleListSkeleton />}>
          <RecentPeople />
        </Suspense>
      </RightPanel>
    </>
  );
}
