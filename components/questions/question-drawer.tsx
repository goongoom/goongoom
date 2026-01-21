"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  LockIcon, 
  UserIcon, 
  AnonymousIcon, 
} from "@hugeicons/core-free-icons";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, Radio } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { QuestionInputTrigger } from "@/components/questions/question-input-trigger";

interface QuestionDrawerProps {
  recipientUsername: string;
  recipientClerkId: string;
  canAskAnonymously: boolean;
  canAskPublic: boolean;
  showSecurityNotice: boolean;
  securityNotice: string | null;
  submitAction: (formData: FormData) => Promise<void>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      className="w-full h-12 rounded-xl border-electric-blue bg-electric-blue text-white shadow-lg shadow-electric-blue/20 hover-lift tap-scale transition-all hover:bg-electric-blue/90 hover:shadow-electric-blue/30 focus-visible:ring-electric-blue sm:h-13" 
      size="lg" 
      disabled={pending}
    >
      {pending ? (
         <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            보내는 중...
         </span>
      ) : (
        <span className="flex items-center gap-2 font-semibold">
          <HugeiconsIcon icon={LockIcon} className="size-5" strokeWidth={2.5} />
          질문 보내기
        </span>
      )}
    </Button>
  );
}

export function QuestionDrawer({
  recipientUsername,
  canAskAnonymously,
  canAskPublic,
  showSecurityNotice,
  securityNotice,
  submitAction
}: QuestionDrawerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <QuestionInputTrigger onClick={() => setOpen(true)} />
      <SheetContent side="bottom" className="rounded-t-3xl border-none px-0 pb-0 pt-3 shadow-xl">
        <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-border/40" />
        
        <SheetHeader className="px-6 pb-2 text-left space-y-2">
           <SheetTitle className="text-xl font-bold leading-tight tracking-tight">
             <span className="text-electric-blue">@{recipientUsername}</span> 님에게<br/>
             새 질문을 남겨보세요
           </SheetTitle>
        </SheetHeader>
        
        <div className="px-6 pb-6 pt-2 h-full overflow-y-auto max-h-svh">
           <form action={submitAction} className="space-y-6">
             <Textarea 
               name="question" 
               placeholder="질문을 입력하세요…" 
               className="min-h-32 resize-none rounded-2xl border-border bg-muted/30 p-5 text-base shadow-sm focus:border-electric-blue focus:ring-electric-blue/20"
               required 
             />
             
             {showSecurityNotice && securityNotice && (
                <Alert className="rounded-2xl border-none bg-electric-blue/10 text-electric-blue dark:bg-electric-blue/20">
                  <AlertDescription className="text-xs font-medium leading-relaxed text-electric-blue/80">{securityNotice}</AlertDescription>
                </Alert>
             )}

             <div className="space-y-4">
               <Label className="ml-1 text-sm font-semibold text-foreground/90">누구로 질문할까요?</Label>
               <RadioGroup name="questionType" defaultValue={canAskAnonymously ? "anonymous" : "public"} className="grid grid-cols-2 gap-3">
                 {canAskAnonymously && (
                   <Label className="cursor-pointer group relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-background p-4 transition-all hover:border-electric-blue/50 hover:bg-muted/30 has-data-checked:border-electric-blue has-data-checked:bg-electric-blue/5">
                      <Radio id="r-anonymous" value="anonymous" className="absolute opacity-0 pointer-events-none" />
                      <div className="rounded-full bg-gradient-to-br from-muted to-muted/50 p-3 text-muted-foreground transition-colors group-has-data-checked:from-electric-blue group-has-data-checked:to-electric-blue/90 group-has-data-checked:text-white">
                         <HugeiconsIcon icon={AnonymousIcon} className="size-6" strokeWidth={2} />
                      </div>
                      <div className="text-center space-y-0.5">
                        <p className="text-sm font-bold text-foreground group-has-data-checked:text-electric-blue">익명</p>
                        <p className="text-xs font-medium text-muted-foreground/70">익명으로 질문합니다</p>
                      </div>
                    </Label>
                 )}
                 {canAskPublic && (
                   <Label className="cursor-pointer group relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-background p-4 transition-all hover:border-electric-blue/50 hover:bg-muted/30 has-data-checked:border-electric-blue has-data-checked:bg-electric-blue/5">
                      <Radio id="r-public" value="public" className="absolute opacity-0 pointer-events-none" />
                      <div className="rounded-full bg-gradient-to-br from-muted to-muted/50 p-3 text-muted-foreground transition-colors group-has-data-checked:from-electric-blue group-has-data-checked:to-electric-blue/90 group-has-data-checked:text-white">
                         <HugeiconsIcon icon={UserIcon} className="size-6" strokeWidth={2} />
                      </div>
                      <div className="text-center space-y-0.5">
                        <p className="text-sm font-bold text-foreground group-has-data-checked:text-electric-blue">공개</p>
                        <p className="text-xs font-medium text-muted-foreground/70">내 이름으로 질문합니다</p>
                      </div>
                    </Label>
                 )}
               </RadioGroup>
             </div>

             <div className="space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <SubmitButton />
                <p className="text-center text-xs text-muted-foreground/60">질문 시 사용 약관에 동의하게 됩니다</p>
             </div>
           </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
