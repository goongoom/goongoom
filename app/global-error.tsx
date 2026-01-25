'use client'

import { captureException } from '@sentry/nextjs'
import { useEffect, useState } from 'react'

const translations = {
  en: {
    title: 'Something went wrong',
    description: 'This might be due to server maintenance. Try refreshing the page or use one of the options below.',
    tryAgain: 'Try again',
    signOut: 'Sign out',
    clearData: 'Clear cache & data',
    clearDataDescription: 'This will clear local data and may help resolve the issue.',
    dataCleared: 'Data cleared. Reloading...',
  },
  ko: {
    title: '문제가 발생했어요',
    description: '서버 점검 중일 수 있어요. 페이지를 새로고침하거나 아래 옵션을 사용해 보세요.',
    tryAgain: '다시 시도하기',
    signOut: '로그아웃하기',
    clearData: '캐시 및 데이터 지우기',
    clearDataDescription: '로컬 데이터를 지우면 문제가 해결될 수 있어요.',
    dataCleared: '데이터가 지워졌어요. 새로고침 중...',
  },
} as const

type Locale = keyof typeof translations

function getLocale(): Locale {
  if (typeof document === 'undefined') return 'ko'

  const cookieMatch = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
  if (cookieMatch?.[1] === 'en' || cookieMatch?.[1] === 'ko') {
    return cookieMatch[1]
  }

  if (typeof navigator !== 'undefined') {
    const lang = navigator.language.toLowerCase()
    if (lang.startsWith('en')) return 'en'
  }

  return 'ko'
}

function clearAllData(): void {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0]?.trim()
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    }
  })

  const keysToRemove = ['goongoom:passkey-nudge-dismissed', 'goongoom:install-nudge-dismissed']
  keysToRemove.forEach((key) => {
    try {
      localStorage.removeItem(key)
    } catch {}
  })

  import('@/components/navigation/prefetch-cache').then((m) => m.clearPrefetchCaches()).catch(() => {})
}

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [locale] = useState<Locale>(() => getLocale())
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    captureException(error)
  }, [error])

  const t = translations[locale]

  const handleTryAgain = () => {
    reset()
  }

  const handleSignOut = () => {
    clearAllData()
    window.location.href = '/'
  }

  const handleClearData = () => {
    setClearing(true)
    clearAllData()
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{t.title}</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          
          :root {
            --bg: #ffffff;
            --card-bg: #ffffff;
            --text: #0f172a;
            --text-muted: #64748b;
            --border: #e2e8f0;
            --primary: #0ea5e9;
            --primary-hover: #0284c7;
            --destructive: #ef4444;
            --destructive-hover: #dc2626;
            --muted: #f1f5f9;
          }
          
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #0f172a;
              --card-bg: #1e293b;
              --text: #f8fafc;
              --text-muted: #94a3b8;
              --border: #334155;
              --primary: #38bdf8;
              --primary-hover: #0ea5e9;
              --destructive: #f87171;
              --destructive-hover: #ef4444;
              --muted: #1e293b;
            }
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            line-height: 1.5;
          }
          
          .container {
            width: 100%;
            max-width: 400px;
          }
          
          .card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 1rem;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          }
          
          .icon {
            width: 4rem;
            height: 4rem;
            margin: 0 auto 1.5rem;
            background: var(--muted);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .icon svg {
            width: 2rem;
            height: 2rem;
            color: var(--text-muted);
          }
          
          h1 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          
          .description {
            color: var(--text-muted);
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
          }
          
          .actions {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          
          button {
            width: 100%;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          
          button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          button svg {
            width: 1rem;
            height: 1rem;
          }
          
          .btn-primary {
            background: var(--primary);
            color: white;
          }
          
          .btn-primary:hover:not(:disabled) {
            background: var(--primary-hover);
          }
          
          .btn-secondary {
            background: var(--muted);
            color: var(--text);
            border: 1px solid var(--border);
          }
          
          .btn-secondary:hover:not(:disabled) {
            background: var(--border);
          }
          
          .btn-destructive {
            background: transparent;
            color: var(--destructive);
            border: 1px solid var(--border);
          }
          
          .btn-destructive:hover:not(:disabled) {
            background: color-mix(in srgb, var(--destructive) 10%, transparent);
          }
          
          .clear-hint {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-top: 0.25rem;
          }
          
          .divider {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin: 0.5rem 0;
          }
          
          .divider::before,
          .divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: var(--border);
          }
          
          .divider span {
            font-size: 0.75rem;
            color: var(--text-muted);
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="card">
            <div className="icon">
              <svg
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
            </div>

            <h1>{t.title}</h1>
            <p className="description">{t.description}</p>

            <div className="actions">
              <button className="btn-primary" onClick={handleTryAgain} type="button">
                <svg
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 16h5v5" />
                </svg>
                {t.tryAgain}
              </button>

              <div className="divider">
                <span>or</span>
              </div>

              <button className="btn-secondary" disabled={clearing} onClick={handleClearData} type="button">
                <svg
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                {clearing ? t.dataCleared : t.clearData}
              </button>
              <p className="clear-hint">{t.clearDataDescription}</p>

              <button className="btn-destructive" onClick={handleSignOut} type="button">
                <svg
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
                {t.signOut}
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
