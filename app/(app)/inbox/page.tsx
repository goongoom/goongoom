import { Suspense } from "react";
import { MainContent } from "@/components/layout/main-content";
import { InboxList } from "./inbox-list";
import { InboxListSkeleton } from "@/components/inbox/inbox-list-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InboxPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

async function InboxStatus({ searchParams }: InboxPageProps) {
  const params = await searchParams;
  const error =
    typeof params?.error === "string" ? decodeURIComponent(params.error) : null;

  if (!error) return null;

  return (
    <Alert variant="error" className="mb-6">
      <AlertDescription className="text-center">{error}</AlertDescription>
    </Alert>
  );
}

export default function InboxPage({ searchParams }: InboxPageProps) {
  return (
    <MainContent>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">받은 질문</h1>
      <p className="text-gray-500 mb-8">아직 답변하지 않은 질문들입니다</p>

      <Suspense fallback={null}>
        <InboxStatus searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<InboxListSkeleton />}>
        <InboxList />
      </Suspense>
    </MainContent>
  );
}
