"use client"

import Link from "next/link"
import type { ComponentProps } from "react"

type TransitionLinkProps = ComponentProps<typeof Link>

export function TransitionLink({ onNavigate, ...props }: TransitionLinkProps) {
  return (
    <Link
      onNavigate={(e) => {
        document.documentElement.dataset.navDirection = "forward"
        onNavigate?.(e)
      }}
      {...props}
    />
  )
}
