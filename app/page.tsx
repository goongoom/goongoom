import { HugeiconsIcon } from "@hugeicons/react";
import { Message01Icon, Share01Icon, ShieldKeyIcon, SparklesIcon, SentIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardPanel, CardTitle } from "@/components/ui/card";
import { getTotalUserCount } from "@/lib/db/queries";
import {
  NavAuthButtons,
  HeroAuthButtons,
  BottomCTAButton,
} from "@/components/auth/auth-buttons";
import { ThemeToggle } from "@/components/theme-toggle";

async function UserCount() {
  const userCount = await getTotalUserCount();
  return <span>{userCount.toLocaleString()}</span>;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-lg shadow-orange-500/30" style={{ background: "var(--gradient-sunset)" }}>
              <HugeiconsIcon icon={Message01Icon} size={18} strokeWidth={3} />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">궁금닷컴</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NavAuthButtons />
          </div>
        </div>
      </nav>

      <main className="relative overflow-hidden pt-32">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-neon-pink/10 blur-3xl filter" />
        <div className="absolute top-48 -left-24 h-72 w-72 rounded-full bg-electric-blue/10 blur-3xl filter" />

        <div className="relative mx-auto max-w-5xl px-6 pb-24 text-center">
          <Badge className="mb-6 gap-2" size="lg" variant="warning">
            <span className="size-2 rounded-full bg-warning animate-pulse" />
            <span className="text-xs font-semibold tracking-wide">
              지금 가장 핫한 익명 Q&A
            </span>
          </Badge>
          
          <h1 className="mb-8 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-7xl text-balance">
            궁금한 건 뭐든 물어보세요
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            익명으로 질문하고, 솔직하게 답변하세요. <br />
            당신의 프로필을 공유하고 친구들의 진짜 속마음을 들어보세요.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <HeroAuthButtons />
          </div>
        </div>

        <div className="border-y border-border bg-muted/40 py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-8 sm:grid-cols-3">
              <Card>
                <CardPanel className="space-y-4">
                  <div className="inline-flex size-12 items-center justify-center rounded-xl bg-electric-blue/10 text-electric-blue">
                    <HugeiconsIcon icon={ShieldKeyIcon} size={24} />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl">안전한 익명성</CardTitle>
                    <CardDescription className="text-base">
                      질문하는 사람의 정보는 비공개로 유지됩니다. 부담 없이 솔직한 대화를 시작해보세요.
                    </CardDescription>
                  </div>
                </CardPanel>
              </Card>

              <Card>
                <CardPanel className="space-y-4">
                  <div className="inline-flex size-12 items-center justify-center rounded-xl bg-neon-pink/10 text-neon-pink">
                    <HugeiconsIcon icon={Share01Icon} size={24} />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl">쉬운 공유</CardTitle>
                    <CardDescription className="text-base">
                      인스타그램, 트위터 어디든 링크를 공유하세요. 클릭 한 번으로 질문을 받을 수 있습니다.
                    </CardDescription>
                  </div>
                </CardPanel>
              </Card>

              <Card>
                <CardPanel className="space-y-4">
                  <div className="inline-flex size-12 items-center justify-center rounded-xl bg-lime/10 text-lime-foreground">
                    <HugeiconsIcon icon={SparklesIcon} size={24} />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl">인스타그램 공유</CardTitle>
                    <CardDescription className="text-base">
                      재치있는 답변을 이미지로 저장해 인스타그램 스토리와 피드에 바로 공유해보세요.
                    </CardDescription>
                  </div>
                </CardPanel>
              </Card>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden py-24">
            <div className="mx-auto max-w-5xl px-6 text-center">
                <div className="mb-8 inline-flex items-center justify-center rounded-full bg-warning/10 p-3 text-warning-foreground">
                    <HugeiconsIcon icon={SentIcon} size={24} />
                </div>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">지금 바로 시작해보세요</h2>
                <p className="mb-10 text-lg text-muted-foreground">
                    이미 <UserCount />명의 유저가 궁금닷컴을 사용하고 있어요.
                </p>
                <BottomCTAButton />
            </div>
        </div>
      </main>

      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground">
              <HugeiconsIcon icon={Message01Icon} size={14} strokeWidth={3} />
            </div>
            <span className="text-sm font-semibold text-muted-foreground">궁금닷컴</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="transition-colors">이용약관</Link>
            <Link href="#" className="transition-colors">개인정보처리방침</Link>
            <Link href="#" className="transition-colors">문의하기</Link>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2026 Goongoom. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
