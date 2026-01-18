import { HugeiconsIcon } from "@hugeicons/react";
import { Message01Icon, Share01Icon, ShieldKeyIcon, ArrowRight01Icon, SparklesIcon, SentIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTotalUserCount } from "@/lib/db/queries";

async function UserCount() {
  const userCount = await getTotalUserCount();
  return <span>{userCount.toLocaleString()}</span>;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-orange-200 selection:text-orange-900">
      <nav className="fixed top-0 z-50 w-full border-b border-orange-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30">
              <HugeiconsIcon icon={Message01Icon} size={18} strokeWidth={3} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">궁금닷컴</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              render={<Link href="/sign-in" />}
              variant="ghost"
              size="sm"
            >
              로그인
            </Button>
            <Button
              render={<Link href="/sign-up" />}
              size="sm"
            >
              시작하기
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative overflow-hidden pt-32">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl filter" />
        <div className="absolute top-48 -left-24 h-72 w-72 rounded-full bg-yellow-200/40 blur-3xl filter" />

        <div className="relative mx-auto max-w-5xl px-6 pb-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50/50 px-3 py-1 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-orange-600">지금 가장 핫한 익명 Q&A</span>
          </div>
          
          <h1 className="mb-8 text-5xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-7xl">
            궁금한 건 뭐든 <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">물어보세요</span>
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 sm:text-xl leading-relaxed">
            익명으로 질문하고, 솔직하게 답변하세요. <br />
            당신의 프로필을 공유하고 친구들의 진짜 속마음을 들어보세요.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              render={<Link href="/sign-up" />}
              size="xl"
              className="w-full group sm:w-auto"
            >
              내 프로필 만들기
              <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              render={<Link href="/sign-in" />}
              variant="outline"
              size="xl"
              className="w-full sm:w-auto"
            >
              로그인하기
            </Button>
          </div>
        </div>

        <div className="border-y border-slate-100 bg-slate-50/50 py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-8 sm:grid-cols-3">
              <Card className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 block">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                  <HugeiconsIcon icon={ShieldKeyIcon} size={24} />
                </div>
                <CardTitle className="mb-3 text-xl font-bold text-slate-900">완벽한 익명성</CardTitle>
                <CardDescription className="text-slate-500 leading-relaxed text-base">
                  질문하는 사람의 정보는 100% 비공개로 유지됩니다. 부담 없이 솔직한 대화를 시작해보세요.
                </CardDescription>
              </Card>

              <Card className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 block">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
                  <HugeiconsIcon icon={Share01Icon} size={24} />
                </div>
                <CardTitle className="mb-3 text-xl font-bold text-slate-900">쉬운 공유</CardTitle>
                <CardDescription className="text-slate-500 leading-relaxed text-base">
                  인스타그램, 트위터 어디든 링크를 공유하세요. 클릭 한 번으로 질문을 받을 수 있습니다.
                </CardDescription>
              </Card>

              <Card className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 block">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-600 group-hover:scale-110 transition-transform">
                  <HugeiconsIcon icon={SparklesIcon} size={24} />
                </div>
                <CardTitle className="mb-3 text-xl font-bold text-slate-900">나만의 스토리</CardTitle>
                <CardDescription className="text-slate-500 leading-relaxed text-base">
                  재치있는 답변을 이미지로 저장해 공유해보세요. 당신의 센스를 모두에게 보여줄 수 있습니다.
                </CardDescription>
              </Card>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden py-24">
            <div className="mx-auto max-w-5xl px-6 text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-orange-100 p-3 text-orange-600 mb-8">
                    <HugeiconsIcon icon={SentIcon} size={24} />
                </div>
                <h2 className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl">지금 바로 시작해보세요</h2>
                <p className="mb-10 text-slate-600 text-lg">
                    이미{" "}
                    <Suspense fallback={<Skeleton className="inline-block h-5 w-16 align-middle rounded" />}>
                      <UserCount />
                    </Suspense>
                    명의 유저가 궁금닷컴을 사용하고 있어요.
                </p>
                <Button
                  render={<Link href="/sign-up" />}
                  size="xl"
                >
                  시작
                </Button>
            </div>
        </div>
      </main>

      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="mx-auto max-w-5xl px-6 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-200 text-slate-500">
              <HugeiconsIcon icon={Message01Icon} size={14} strokeWidth={3} />
            </div>
            <span className="text-sm font-bold text-slate-400">궁금닷컴</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-orange-500 transition-colors">이용약관</Link>
            <Link href="#" className="hover:text-orange-500 transition-colors">개인정보처리방침</Link>
            <Link href="#" className="hover:text-orange-500 transition-colors">문의하기</Link>
          </div>
          <div className="text-sm text-slate-400">
            © 2026 Goongoom. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
