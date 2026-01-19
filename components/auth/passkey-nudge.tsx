"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { FingerprintIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardPanel } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function PasskeyNudge() {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isLoaded) return null;

  if (user?.passkeys && user.passkeys.length > 0) {
    return null;
  }

  const createPasskey = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await user?.createPasskey();
      setSuccess(true);
    } catch (err: unknown) {
      console.error("Error creating passkey:", err);
      setError("패스키 설정 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="animate-pop bg-lime/10 border-lime/20 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-lime/5 to-transparent pointer-events-none" />
        <CardPanel className="flex flex-col items-center justify-center p-8 gap-4 text-center">
          <div className="size-12 rounded-full bg-lime/20 flex items-center justify-center text-lime animate-bounce">
            <CheckCircleIcon className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-lime-700 dark:text-lime-400">설정 완료!</h3>
            <p className="text-sm text-lime-600/80 dark:text-lime-300/80">이제 더 빠르고 안전하게 로그인할 수 있습니다.</p>
          </div>
        </CardPanel>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border-none overflow-hidden relative group animate-slide-up-fade hover-lift",
      "bg-[image:var(--gradient-electric)] text-electric-blue-foreground shadow-lg shadow-electric-blue/20"
    )}>
      <div className="absolute top-0 right-0 p-12 bg-white/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 group-hover:bg-white/20 transition-colors duration-500" />
      <div className="absolute bottom-0 left-0 p-10 bg-purple/20 blur-2xl rounded-full -translate-x-1/3 translate-y-1/3" />

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <span className="text-2xl">🔐</span> 패스키 설정
            </CardTitle>
            <CardDescription className="text-electric-blue-foreground/80 font-medium">
              Face ID나 지문으로 더 빠르고 안전하게 로그인하세요!
            </CardDescription>
          </div>
          <div className="hidden sm:flex size-10 rounded-xl bg-white/20 backdrop-blur-md items-center justify-center text-white rotate-3 group-hover:rotate-12 transition-transform duration-300 shadow-sm">
            <FingerprintIcon className="size-6" />
          </div>
        </div>
      </CardHeader>

      <CardPanel className="relative z-10 pt-4 pb-6">
        {error && (
          <Alert variant="error" className="mb-4 bg-red-500/20 text-white border-red-200/20 backdrop-blur-sm">
            <AlertCircleIcon className="size-4 text-white" />
            <AlertDescription className="text-white/90">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={createPasskey} 
          disabled={isLoading}
          className="w-full bg-white text-electric-blue hover:bg-white/90 font-bold border-none shadow-md h-12 text-base group/btn"
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2 size-5 text-electric-blue" />
              설정 중...
            </>
          ) : (
            <>
              지금 설정하기
              <FingerprintIcon className="ml-2 size-4 group-hover/btn:scale-110 transition-transform" />
            </>
          )}
        </Button>
      </CardPanel>
    </Card>
  );
}
