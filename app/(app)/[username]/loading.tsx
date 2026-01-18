import { MainContent } from "@/components/layout/main-content";
import { RightPanel } from "@/components/layout/right-panel";
import { ProfileHeaderSkeleton } from "@/components/profile/profile-header-skeleton";
import { QAFeedSkeleton } from "@/components/profile/qa-feed-skeleton";
import { QuestionFormSkeleton } from "@/components/profile/question-form-skeleton";

export default function ProfileLoading() {
  return (
    <>
      <MainContent>
        <ProfileHeaderSkeleton />
        <QAFeedSkeleton />
      </MainContent>

      <RightPanel>
        <QuestionFormSkeleton />
      </RightPanel>
    </>
  );
}
