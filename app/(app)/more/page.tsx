import { MainContent } from "@/components/layout/main-content";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Megaphone02Icon,
  GiftIcon,
  CustomerServiceIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

const moreOptions = [
  { icon: Megaphone02Icon, label: "공지사항" },
  { icon: GiftIcon, label: "이벤트" },
  { icon: CustomerServiceIcon, label: "문의하기" },
  { icon: Settings01Icon, label: "환경설정" },
];

export default function MorePage() {
  return (
    <MainContent>
      <h1 className="mb-8 text-3xl font-bold text-foreground">더보기</h1>

      <div className="space-y-4">
        {moreOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.label}
              className="w-full justify-start gap-4"
              size="lg"
              variant="outline"
            >
              <HugeiconsIcon
                icon={Icon}
                className="size-5 text-muted-foreground"
              />
              <span className="text-base text-muted-foreground">
                {option.label}
              </span>
            </Button>
          );
        })}
      </div>
    </MainContent>
  );
}
