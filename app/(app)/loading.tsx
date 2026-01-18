import { MainContent } from "@/components/layout/main-content";
import { RightPanel } from "@/components/layout/right-panel";
import { HeroCard } from "@/components/home/hero-card";
import { QAFeedSkeleton } from "@/components/profile/qa-feed-skeleton";
import { PeopleListSkeleton } from "@/components/home/people-list-skeleton";

export default function HomeLoading() {
  return (
    <>
      <MainContent>
        <HeroCard />
        <QAFeedSkeleton />
      </MainContent>

      <RightPanel>
        <PeopleListSkeleton />
      </RightPanel>
    </>
  );
}
