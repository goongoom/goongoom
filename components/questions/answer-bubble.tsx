import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ShareInstagramButton } from "@/components/questions/share-instagram-button";

interface AnswerBubbleProps {
  avatar?: string | null;
  username: string;
  content: string;
  timestamp: string;
  shareUrl?: string | null;
}

export function AnswerBubble({
  avatar,
  username,
  content,
  timestamp,
  shareUrl,
}: AnswerBubbleProps) {
  return (
    <div className="flex w-full items-start justify-end gap-3">
      <div className="flex flex-1 flex-col items-end">
        <Card className="max-w-[85%] border-primary/20 bg-primary px-4 py-3 text-primary-foreground">
          <p className="leading-relaxed">{content}</p>
        </Card>
        <div className="mt-1 mr-1 flex flex-col items-end gap-1">
          <p className="text-xs text-muted-foreground">
            {username} · {timestamp} 답변
          </p>
          {shareUrl ? <ShareInstagramButton shareUrl={shareUrl} /> : null}
        </div>
      </div>
      <Avatar className="w-10 h-10 flex-shrink-0">
        {avatar ? <AvatarImage src={avatar} alt={username} /> : null}
        <AvatarFallback>{username[0] || "?"}</AvatarFallback>
      </Avatar>
    </div>
  );
}
