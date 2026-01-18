import { HugeiconsIcon } from "@hugeicons/react";
import { InstagramIcon, FacebookIcon, GithubIcon } from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface ProfileHeaderProps {
  avatar?: string | null;
  name: string;
  username: string;
  bio?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    github?: string;
  };
}

export function ProfileHeader({
  avatar,
  name,
  username,
  bio,
  socialLinks,
}: ProfileHeaderProps) {
  return (
    <Card className="p-8 mb-6">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <Avatar className="w-[124px] h-[124px] ring-4 ring-orange-500">
            {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
            <AvatarFallback>{name[0] || "?"}</AvatarFallback>
          </Avatar>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{name}</h1>
        <p className="text-gray-500 mb-4">@{username}</p>
        
        {bio && (
          <p className="text-gray-700 leading-relaxed mb-6 max-w-md">{bio}</p>
        )}
        
        {socialLinks && (
          <div className="flex gap-4">
            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <HugeiconsIcon icon={InstagramIcon} className="w-5 h-5" />
                </div>
                <span className="text-xs">Instagram</span>
              </a>
            )}
            {socialLinks.facebook && (
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <HugeiconsIcon icon={FacebookIcon} className="w-5 h-5" />
                </div>
                <span className="text-xs">Facebook</span>
              </a>
            )}
            {socialLinks.github && (
              <a
                href={socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <HugeiconsIcon icon={GithubIcon} className="w-5 h-5" />
                </div>
                <span className="text-xs">GitHub</span>
              </a>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-8 pt-6">
        <Separator />
      </div>
    </Card>
  );
}
