import { MainContent } from "@/components/layout/main-content";
import { InboxListSkeleton } from "@/components/inbox/inbox-list-skeleton";

export default function InboxLoading() {
  return (
    <MainContent>
      <h1 className="mb-2 text-3xl font-bold text-foreground">받은 질문</h1>
      <p className="mb-8 text-muted-foreground">아직 답변하지 않은 질문들입니다</p>
      <InboxListSkeleton />
    </MainContent>
  );
}
