import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { MainContent } from "@/components/layout/main-content";
import { getOrCreateUser, getUnansweredQuestions } from "@/lib/db/queries";
import { InboxList } from "./inbox-list";

export default async function InboxPage() {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    redirect("/");
  }
  
  const [, unansweredQuestions] = await Promise.all([
    getOrCreateUser(clerkId),
    getUnansweredQuestions(clerkId),
  ]);
  
  return (
    <MainContent>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">받은 질문</h1>
      <p className="text-gray-500 mb-8">아직 답변하지 않은 질문들입니다</p>
      
      <InboxList initialQuestions={unansweredQuestions} />
    </MainContent>
  );
}
