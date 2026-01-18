import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";
import { getOrCreateUser, getUnansweredQuestions } from "@/lib/db/queries";
import { InboxList } from "./InboxList";

export default async function InboxPage() {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    redirect("/sign-in");
  }
  
  await getOrCreateUser(clerkId);
  const unansweredQuestions = await getUnansweredQuestions(clerkId);
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MainContent>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">받은 질문</h1>
        <p className="text-gray-500 mb-8">아직 답변하지 않은 질문들입니다</p>
        
        <InboxList initialQuestions={unansweredQuestions} />
      </MainContent>
    </div>
  );
}
