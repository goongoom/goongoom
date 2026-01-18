import { MainContent } from "@/components/layout/main-content";
import { HugeiconsIcon } from "@hugeicons/react";
import { Megaphone02Icon, GiftIcon, CustomerServiceIcon, Settings01Icon } from "@hugeicons/core-free-icons";

const moreOptions = [
  { icon: Megaphone02Icon, label: "공지사항" },
  { icon: GiftIcon, label: "이벤트" },
  { icon: CustomerServiceIcon, label: "문의하기" },
  { icon: Settings01Icon, label: "환경설정" },
];

export default function MorePage() {
  return (
    <MainContent>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">더보기</h1>
      
      <div className="space-y-4">
        {moreOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.label}
              type="button"
              className="w-full flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <HugeiconsIcon icon={Icon} className="w-6 h-6 text-gray-500" />
              <span className="text-lg text-gray-500">{option.label}</span>
            </button>
          );
        })}
      </div>
    </MainContent>
  );
}
