import { HugeiconsIcon } from "@hugeicons/react";
import { InstagramIcon, FacebookIcon, GithubIcon } from "@hugeicons/core-free-icons";
import { Card, CardPanel } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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
  const toProfileUrl = (value: string | undefined, domain: string) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.includes(domain)) return `https://${trimmed.replace(/^\/+/, "")}`;
    const handle = trimmed.replace(/^@/, "").split("/")[0];
    return handle ? `https://${domain}/${handle}` : null;
  };

  const links = [
    {
      key: "instagram",
      label: "Instagram",
      icon: InstagramIcon,
      href: toProfileUrl(socialLinks?.instagram, "instagram.com"),
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: FacebookIcon,
      href: toProfileUrl(socialLinks?.facebook, "facebook.com"),
    },
    {
      key: "github",
      label: "GitHub",
      icon: GithubIcon,
      href: toProfileUrl(socialLinks?.github, "github.com"),
    },
  ].filter((link) => Boolean(link.href));

  return (
    <Card className="mb-6">
      <CardPanel className="flex items-start gap-6">
        <Avatar className="size-24 ring-2 ring-ring">
          {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
          <AvatarFallback>{name[0] || "?"}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3 text-left">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">{name}</h1>
            <p className="text-sm text-muted-foreground">@{username}</p>
          </div>

          {bio && (
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              {bio}
            </p>
          )}
        </div>
      </CardPanel>

      {links.length > 0 ? (
        <>
          <CardPanel className="flex flex-wrap gap-4">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <div key={link.key} className="flex flex-col items-center gap-2">
                  <Button
                    aria-label={link.label}
                    className="rounded-full"
                    render={
                      <a
                        href={link.href as string}
                        rel="noopener noreferrer"
                        target="_blank"
                      />
                    }
                    size="icon"
                    variant="outline"
                  >
                    <HugeiconsIcon icon={Icon} className="size-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {link.label}
                  </span>
                </div>
              );
            })}
          </CardPanel>
        </>
      ) : null}
    </Card>
  );
}
