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
    <div className="flex gap-3 items-start">
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={avatar} alt="Avatar" />
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Card className="px-4 py-3">
          <p className="text-gray-900 leading-relaxed">{content}</p>
        </Card>
        <p className="text-xs text-gray-500 mt-1 ml-1">
          {isAnonymous ? "익명" : "공개"} · {timestamp} 질문
        </p>
      </div>
    </div>
  );
}
