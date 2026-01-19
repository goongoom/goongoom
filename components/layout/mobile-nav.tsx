import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InboxIcon,
  LoginSquare01Icon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { auth } from "@clerk/nextjs/server";
import { getClerkUserById } from "@/lib/clerk";
import { Button } from "@/components/ui/button";

export async function MobileNav() {
  const { userId } = await auth();
  const user = userId ? await getClerkUserById(userId) : null;

  const navItems = [
    ...(user?.username
      ? [{ href: `/${user.username}`, label: "내 프로필", icon: UserIcon }]
      : []),
    ...(userId
      ? [
          { href: "/inbox", label: "받은 질문", icon: InboxIcon },
          { href: "/settings", label: "설정", icon: Settings01Icon },
        ]
      : [{ href: "/sign-in", label: "로그인", icon: LoginSquare01Icon }]),
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.href}
              className="h-auto flex-col gap-1 px-3 py-2 text-muted-foreground"
              render={<Link href={item.href} />}
              size="sm"
              variant="ghost"
            >
              <HugeiconsIcon icon={Icon} className="size-5" aria-hidden="true" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
