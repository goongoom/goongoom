import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface AnswerBubbleProps {
  avatar?: string | null;
  username: string;
  content: string;
  timestamp: string;
}

export function AnswerBubble({
  avatar,
  username,
  content,
  timestamp,
}: AnswerBubbleProps) {
  return (
    <div className="flex gap-3 items-start justify-end">
      <div className="flex-1 flex flex-col items-end">
        <Card className="bg-orange-500 text-white px-4 py-3 max-w-md border-orange-500">
          <p className="leading-relaxed">{content}</p>
        </Card>
        <p className="text-xs text-gray-500 mt-1 mr-1">
          {username} · {timestamp} 답변
        </p>
      </div>
      <Avatar className="w-10 h-10 flex-shrink-0">
        {avatar ? <AvatarImage src={avatar} alt={username} /> : null}
        <AvatarFallback>{username[0] || "?"}</AvatarFallback>
      </Avatar>
    </div>
  );
}
