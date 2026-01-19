import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface QuestionBubbleProps {
  avatar: string;
  content: string;
  isAnonymous: boolean;
  timestamp: string;
}

export function QuestionBubble({
  avatar,
  content,
  isAnonymous,
  timestamp,
}: QuestionBubbleProps) {
  return (
    <div className="flex w-full items-start gap-3">
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={avatar} alt="Avatar" />
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Card className="max-w-[85%] bg-muted/40 px-4 py-3">
          <p className="text-foreground leading-relaxed">{content}</p>
        </Card>
        <p className="mt-1 ml-1 text-xs text-muted-foreground">
          {isAnonymous ? "익명" : "공개"} · {timestamp} 질문
        </p>
      </div>
    </div>
  );
}
