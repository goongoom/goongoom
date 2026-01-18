import { MainContent } from "@/components/layout/main-content";
import { InboxListSkeleton } from "@/components/inbox/inbox-list-skeleton";

export default function InboxLoading() {
  return (
    <MainContent>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">받은 질문</h1>
      <p className="text-gray-500 mb-8">아직 답변하지 않은 질문들입니다</p>
      <InboxListSkeleton />
    </MainContent>
  );
}
