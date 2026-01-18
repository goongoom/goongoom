import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

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
    <div className="flex gap-3 items-start justify-end">
      <div className="flex-1 flex flex-col items-end">
        <Card className="bg-orange-500 text-white px-4 py-3 max-w-md border-orange-500">
          <p className="leading-relaxed">{content}</p>
        </Card>
        <div className="mt-1 mr-1 flex flex-col items-end gap-1">
          <p className="text-xs text-gray-500">
            {username} · {timestamp} 답변
          </p>
          {shareUrl ? (
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-orange-600 transition-colors"
            >
              인스타그램 이미지 만들기
            </a>
          ) : null}
        </div>
      </div>
      <Avatar className="w-10 h-10 flex-shrink-0">
        {avatar ? <AvatarImage src={avatar} alt={username} /> : null}
        <AvatarFallback>{username[0] || "?"}</AvatarFallback>
      </Avatar>
    </div>
  );
}
