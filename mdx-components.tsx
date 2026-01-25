import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="mb-2 font-bold text-3xl tracking-tight">{children}</h1>,
    h2: ({ children }) => <h2 className="mt-8 mb-4 font-semibold text-xl">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-6 mb-3 font-semibold text-lg">{children}</h3>,
    p: ({ children }) => <p className="mb-4 text-muted-foreground leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">{children}</ul>,
    ol: ({ children }) => <ol className="mb-4 list-inside list-decimal space-y-2 text-muted-foreground">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    a: ({ href, children }: ComponentPropsWithoutRef<'a'>) => {
      const isInternal = href?.startsWith('/')
      if (isInternal && href) {
        return (
          <Link className="text-foreground underline underline-offset-4" href={href}>
            {children}
          </Link>
        )
      }
      return (
        <a
          className="text-foreground underline underline-offset-4"
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {children}
        </a>
      )
    },
    hr: () => <hr className="my-8 border-border" />,
    blockquote: ({ children }) => (
      <blockquote className="border-emerald/50 border-l-4 pl-4 text-muted-foreground italic">{children}</blockquote>
    ),
    ...components,
  }
}
