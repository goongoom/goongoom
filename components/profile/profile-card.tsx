import type { ComponentType, SVGProps } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface SocialLink {
  key: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>
  label: string
  text: string
}

type ProfileCardProps =
  | {
      isLoading: true
    }
  | {
      isLoading?: false
      fullName: string
      username: string
      avatarUrl?: string | null
      bio?: string | null
      noBioText: string
      socialLinks: SocialLink[]
      isOwnProfile: boolean
      children?: React.ReactNode
    }

export function ProfileCard(props: ProfileCardProps) {
  if (props.isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="flex items-center gap-6">
          <Skeleton className="size-24 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-1 h-4 w-full" />
          </div>
        </CardContent>
        <CardContent className="flex flex-wrap gap-2 pt-0">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </CardContent>
      </Card>
    )
  }

  const { fullName, username, avatarUrl, bio, noBioText, socialLinks, isOwnProfile, children } = props

  return (
    <Card className="mb-6">
      <CardContent className="flex items-center gap-6">
        <Avatar className="size-24 ring-2 ring-primary/30">
          {avatarUrl && <AvatarImage alt={fullName} src={avatarUrl} />}
          <AvatarFallback>{fullName[0] || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="font-semibold text-foreground text-xl">{fullName}</h1>
          <p className="text-muted-foreground text-sm">@{username}</p>
          <p className="mt-1 text-sm">{bio || <span className="text-muted-foreground">{noBioText}</span>}</p>
        </div>
      </CardContent>
      {socialLinks.length > 0 && (
        <CardContent className="flex flex-wrap gap-2 pt-0">
          {socialLinks.map((link) => (
            <Button
              aria-label={link.label}
              className="h-8 gap-1.5 rounded-full px-3"
              key={link.key}
              render={<Link href={link.href} rel="noopener noreferrer" target="_blank" />}
              size="sm"
              variant="outline"
            >
              <link.icon className="size-4" />
              <span className="text-sm">{link.text}</span>
            </Button>
          ))}
        </CardContent>
      )}
      {isOwnProfile && children && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  )
}
