import { MainContent } from "@/components/layout/main-content";
import { ProfileHeaderSkeleton } from "@/components/profile/profile-header-skeleton";
import { QAFeedSkeleton } from "@/components/profile/qa-feed-skeleton";
import { QuestionFormSkeleton } from "@/components/profile/question-form-skeleton";

export default function ProfileLoading() {
  return (
    <>
      <MainContent>
        <ProfileHeaderSkeleton />
        <QuestionFormSkeleton />
        <QAFeedSkeleton />
      </MainContent>
    </>
  );
}
