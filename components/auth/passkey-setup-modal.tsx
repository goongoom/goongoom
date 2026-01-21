"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { FingerprintIcon, CheckCircleIcon, XIcon, ShieldCheckIcon } from "lucide-react";
import { Dialog, DialogPopup, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function PasskeySetupModal() {
  const { user, isLoaded } = useUser();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      const hasPasskeys = user.passkeys && user.passkeys.length > 0;
      const isDismissed = localStorage.getItem("goongoom:passkey-nudge-dismissed");

      if (!hasPasskeys && !isDismissed) {
        const timer = setTimeout(() => setOpen(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoaded, user]);

  const handleDismiss = () => {
    localStorage.setItem("goongoom:passkey-nudge-dismissed", "true");
    setOpen(false);
  };

  const createPasskey = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await user?.createPasskey();
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
      }, 2000);
    } catch (err: unknown) {
      console.error("Error creating passkey:", err);
      setError("패스키 설정 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoaded && user?.passkeys && user.passkeys.length > 0 && !success) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleDismiss()}>
      <DialogPopup 
        className={cn(
          "bg-gradient-to-br from-electric-blue via-purple to-electric-blue text-electric-blue-foreground border-none shadow-2xl overflow-hidden",
          "p-0 gap-0 max-w-md w-full"
        )}
        showCloseButton={false}
      >
        <div className="absolute top-0 right-0 p-20 bg-white/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 p-16 bg-purple/30 blur-2xl rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        {!success && (
          <button 
            type="button"
            onClick={handleDismiss}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
          >
            <XIcon className="size-5" />
          </button>
        )}

        <div className="relative z-10 flex flex-col items-center text-center p-8 pt-12">
          
          {success ? (
            <div className="flex flex-col items-center animate-in zoom-in duration-300">
              <div className="size-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-6 animate-bounce">
                <CheckCircleIcon className="size-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">설정 완료!</h2>
              <p className="text-white/90">이제 더 빠르고 안전하게 로그인할 수 있습니다.</p>
            </div>
          ) : (
            <>
              <div className="relative mb-6">
                <div className="size-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg rotate-3">
                  <FingerprintIcon className="size-10" />
                </div>
                <div className="absolute -top-2 -right-2 size-8 rounded-full bg-neon-pink flex items-center justify-center text-white shadow-md animate-bounce">
                  <ShieldCheckIcon className="size-4" />
                </div>
              </div>

              <DialogHeader className="p-0 mb-8 items-center">
                <DialogTitle className="text-2xl font-bold text-white mb-2">
                  🔐 패스키로 더 빠르게!
                </DialogTitle>
                <DialogDescription className="text-electric-blue-foreground/90 text-base max-w-xs">
                  Face ID, 지문, 또는 기기 잠금으로<br/>한 번의 터치로 로그인하세요.
                </DialogDescription>
              </DialogHeader>

              {error && (
                <div className="w-full bg-red-500/20 backdrop-blur-sm border border-red-200/20 rounded-lg p-3 mb-6 text-sm text-white flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-red-400" />
                  {error}
                </div>
              )}

              <div className="w-full space-y-3">
                <Button 
                  onClick={createPasskey} 
                  disabled={isLoading}
                  className="w-full bg-white text-electric-blue hover:bg-white/90 font-bold border-none shadow-lg h-12 text-base rounded-xl transition-all hover-lift tap-scale"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2 size-5 text-electric-blue" />
                      설정 중...
                    </>
                  ) : (
                    <>
                      지금 설정하기
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleDismiss}
                  variant="ghost"
                  className="w-full text-white/70 hover:text-white hover:bg-white/10 font-medium h-10 rounded-xl"
                >
                  다음에 하기
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogPopup>
    </Dialog>
  );
}
