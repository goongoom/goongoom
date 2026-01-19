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
      <h1 className="mb-2 text-3xl font-bold text-foreground">받은 질문</h1>
      <p className="mb-8 text-muted-foreground">아직 답변하지 않은 질문들입니다</p>

      <Suspense fallback={null}>
        <InboxStatus searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<InboxListSkeleton />}>
        <InboxList />
      </Suspense>
    </MainContent>
  );
}
