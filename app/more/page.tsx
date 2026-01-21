import {
  CustomerServiceIcon,
  GiftIcon,
  Megaphone02Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { MainContent } from "@/components/layout/main-content"
import { Button } from "@/components/ui/button"

const moreOptions = [
  { icon: Megaphone02Icon, label: "공지사항" },
  { icon: GiftIcon, label: "이벤트" },
  { icon: CustomerServiceIcon, label: "문의하기" },
  { icon: Settings01Icon, label: "환경설정" },
]

export default function MorePage() {
  return (
    <MainContent>
      <h1 className="mb-8 font-bold text-3xl text-foreground">더보기</h1>

      <div className="space-y-3">
        {moreOptions.map((option) => {
          const Icon = option.icon
          return (
            <Button
              className="min-h-12 w-full justify-start gap-4"
              key={option.label}
              size="lg"
              variant="outline"
            >
              <HugeiconsIcon
                className="size-5 text-muted-foreground"
                icon={Icon}
              />
              <span className="text-base text-foreground">{option.label}</span>
            </Button>
          )
        })}
      </div>
    </MainContent>
  )
}
