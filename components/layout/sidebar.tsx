import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, InboxIcon, Settings01Icon, LoginSquare01Icon } from "@hugeicons/core-free-icons";
import { auth } from "@clerk/nextjs/server";
import { getClerkUserById } from "@/lib/clerk";
import { Button } from "@/components/ui/button";

export async function Sidebar() {
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
    <aside className="sticky top-0 hidden h-screen w-64 border-r border-border bg-background lg:block lg:w-80">
      <div className="p-6">
        <Link href="/" className="block">
          <h1 className="mb-8 text-2xl font-semibold text-foreground">
            궁금닷컴
          </h1>
        </Link>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                className="w-full justify-start gap-3 text-muted-foreground"
                render={<Link href={item.href} />}
                size="lg"
                variant="ghost"
              >
                <HugeiconsIcon icon={Icon} className="size-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
