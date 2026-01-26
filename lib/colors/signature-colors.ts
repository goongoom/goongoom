export interface SignatureColorValue {
  light: {
    primary: string
    bg: string
    border: string
  }
  dark: {
    primary: string
    bg: string
    border: string
  }
  gradient: readonly [string, string]
}
export const SIGNATURE_COLORS = {
  red: {
    light: {
      primary: '#ef4444',
      bg: '#fef2f2',
      border: 'rgba(239, 68, 68, 0.3)',
    },
    dark: {
      primary: 'oklch(0.704 0.191 22.216)',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(248, 113, 113, 0.3)',
    },
    gradient: ['#dc2626', '#ef4444'],
  },
  orange: {
    light: {
      primary: '#f97316',
      bg: '#fff7ed',
      border: 'rgba(249, 115, 22, 0.3)',
    },
    dark: {
      primary: 'oklch(0.75 0.183 55.934)',
      bg: 'rgba(249, 115, 22, 0.1)',
      border: 'rgba(251, 146, 60, 0.3)',
    },
    gradient: ['#ea580c', '#f97316'],
  },
  amber: {
    light: {
      primary: '#f59e0b',
      bg: '#fffbeb',
      border: 'rgba(245, 158, 11, 0.3)',
    },
    dark: {
      primary: 'oklch(0.828 0.189 84.429)',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(251, 191, 36, 0.3)',
    },
    gradient: ['#d97706', '#f59e0b'],
  },
  yellow: {
    light: {
      primary: '#eab308',
      bg: '#fefce8',
      border: 'rgba(234, 179, 8, 0.3)',
    },
    dark: {
      primary: 'oklch(0.852 0.199 91.936)',
      bg: 'rgba(234, 179, 8, 0.1)',
      border: 'rgba(250, 204, 21, 0.3)',
    },
    gradient: ['#ca8a04', '#eab308'],
  },
  lime: {
    light: {
      primary: '#84cc16',
      bg: '#f7fee7',
      border: 'rgba(132, 204, 22, 0.3)',
    },
    dark: {
      primary: 'oklch(0.841 0.238 128.85)',
      bg: 'rgba(132, 204, 22, 0.1)',
      border: 'rgba(163, 230, 53, 0.3)',
    },
    gradient: ['#65a30d', '#84cc16'],
  },
  green: {
    light: {
      primary: '#22c55e',
      bg: '#f0fdf4',
      border: 'rgba(34, 197, 94, 0.3)',
    },
    dark: {
      primary: 'oklch(0.792 0.209 151.711)',
      bg: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(74, 222, 128, 0.3)',
    },
    gradient: ['#16a34a', '#22c55e'],
  },
  emerald: {
    light: {
      primary: '#10b981',
      bg: '#ecfdf5',
      border: 'rgba(16, 185, 129, 0.3)',
    },
    dark: {
      primary: 'oklch(0.765 0.177 163.223)',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(52, 211, 153, 0.3)',
    },
    gradient: ['#059669', '#10b981'],
  },
  teal: {
    light: {
      primary: '#14b8a6',
      bg: '#f0fdfa',
      border: 'rgba(20, 184, 166, 0.3)',
    },
    dark: {
      primary: 'oklch(0.777 0.152 181.912)',
      bg: 'rgba(20, 184, 166, 0.1)',
      border: 'rgba(45, 212, 191, 0.3)',
    },
    gradient: ['#0d9488', '#14b8a6'],
  },
  cyan: {
    light: {
      primary: '#06b6d4',
      bg: '#ecfeff',
      border: 'rgba(6, 182, 212, 0.3)',
    },
    dark: {
      primary: 'oklch(0.789 0.154 211.53)',
      bg: 'rgba(6, 182, 212, 0.1)',
      border: 'rgba(34, 211, 238, 0.3)',
    },
    gradient: ['#0891b2', '#06b6d4'],
  },
  sky: {
    light: {
      primary: '#0ea5e9',
      bg: '#f0f9ff',
      border: 'rgba(14, 165, 233, 0.3)',
    },
    dark: {
      primary: 'oklch(0.746 0.16 232.661)',
      bg: 'rgba(14, 165, 233, 0.1)',
      border: 'rgba(56, 189, 248, 0.3)',
    },
    gradient: ['#0284c7', '#0ea5e9'],
  },
  blue: {
    light: {
      primary: '#3b82f6',
      bg: '#eff6ff',
      border: 'rgba(59, 130, 246, 0.3)',
    },
    dark: {
      primary: 'oklch(0.707 0.165 254.624)',
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(96, 165, 250, 0.3)',
    },
    gradient: ['#2563eb', '#3b82f6'],
  },
  indigo: {
    light: {
      primary: '#6366f1',
      bg: '#eef2ff',
      border: 'rgba(99, 102, 241, 0.3)',
    },
    dark: {
      primary: 'oklch(0.673 0.182 276.935)',
      bg: 'rgba(99, 102, 241, 0.1)',
      border: 'rgba(129, 140, 248, 0.3)',
    },
    gradient: ['#4f46e5', '#6366f1'],
  },
  violet: {
    light: {
      primary: '#8b5cf6',
      bg: '#f5f3ff',
      border: 'rgba(139, 92, 246, 0.3)',
    },
    dark: {
      primary: 'oklch(0.702 0.183 293.541)',
      bg: 'rgba(139, 92, 246, 0.1)',
      border: 'rgba(167, 139, 250, 0.3)',
    },
    gradient: ['#7c3aed', '#8b5cf6'],
  },
  purple: {
    light: {
      primary: '#a855f7',
      bg: '#faf5ff',
      border: 'rgba(168, 85, 247, 0.3)',
    },
    dark: {
      primary: 'oklch(0.714 0.203 305.504)',
      bg: 'rgba(168, 85, 247, 0.1)',
      border: 'rgba(192, 132, 252, 0.3)',
    },
    gradient: ['#9333ea', '#a855f7'],
  },
  fuchsia: {
    light: {
      primary: '#d946ef',
      bg: '#fdf4ff',
      border: 'rgba(217, 70, 239, 0.3)',
    },
    dark: {
      primary: 'oklch(0.74 0.238 322.16)',
      bg: 'rgba(217, 70, 239, 0.1)',
      border: 'rgba(232, 121, 249, 0.3)',
    },
    gradient: ['#c026d3', '#d946ef'],
  },
  pink: {
    light: {
      primary: '#ec4899',
      bg: '#fdf2f8',
      border: 'rgba(236, 72, 153, 0.3)',
    },
    dark: {
      primary: 'oklch(0.718 0.202 349.761)',
      bg: 'rgba(236, 72, 153, 0.1)',
      border: 'rgba(244, 114, 182, 0.3)',
    },
    gradient: ['#db2777', '#ec4899'],
  },
  rose: {
    light: {
      primary: '#f43f5e',
      bg: '#fff1f2',
      border: 'rgba(244, 63, 94, 0.3)',
    },
    dark: {
      primary: 'oklch(0.712 0.194 13.428)',
      bg: 'rgba(244, 63, 94, 0.1)',
      border: 'rgba(251, 113, 133, 0.3)',
    },
    gradient: ['#e11d48', '#f43f5e'],
  },
  slate: {
    light: {
      primary: '#64748b',
      bg: '#f8fafc',
      border: 'rgba(100, 116, 139, 0.3)',
    },
    dark: {
      primary: 'oklch(0.704 0.04 256.788)',
      bg: 'rgba(100, 116, 139, 0.1)',
      border: 'rgba(148, 163, 184, 0.3)',
    },
    gradient: ['#475569', '#64748b'],
  },
  gray: {
    light: {
      primary: '#6b7280',
      bg: '#f9fafb',
      border: 'rgba(107, 114, 128, 0.3)',
    },
    dark: {
      primary: 'oklch(0.707 0.022 261.325)',
      bg: 'rgba(107, 114, 128, 0.1)',
      border: 'rgba(156, 163, 175, 0.3)',
    },
    gradient: ['#4b5563', '#6b7280'],
  },
  zinc: {
    light: {
      primary: '#71717a',
      bg: '#fafafa',
      border: 'rgba(113, 113, 122, 0.3)',
    },
    dark: {
      primary: 'oklch(0.705 0.015 286.067)',
      bg: 'rgba(113, 113, 122, 0.1)',
      border: 'rgba(161, 161, 170, 0.3)',
    },
    gradient: ['#52525b', '#71717a'],
  },
  neutral: {
    light: {
      primary: '#737373',
      bg: '#fafafa',
      border: 'rgba(115, 115, 115, 0.3)',
    },
    dark: {
      primary: 'oklch(0.708 0 0)',
      bg: 'rgba(115, 115, 115, 0.1)',
      border: 'rgba(163, 163, 163, 0.3)',
    },
    gradient: ['#525252', '#737373'],
  },
  stone: {
    light: {
      primary: '#78716c',
      bg: '#fafaf9',
      border: 'rgba(120, 113, 108, 0.3)',
    },
    dark: {
      primary: 'oklch(0.709 0.01 56.259)',
      bg: 'rgba(120, 113, 108, 0.1)',
      border: 'rgba(168, 162, 158, 0.3)',
    },
    gradient: ['#57534e', '#78716c'],
  },
} as const

export type SignatureColor = keyof typeof SIGNATURE_COLORS

export const DEFAULT_SIGNATURE_COLOR: SignatureColor = 'pink'

export function getSignatureColor(key: string | undefined | null): SignatureColorValue {
  if (!(key && key in SIGNATURE_COLORS)) {
    return SIGNATURE_COLORS[DEFAULT_SIGNATURE_COLOR]
  }
  return SIGNATURE_COLORS[key as SignatureColor]
}

export function isValidSignatureColor(key: string): key is SignatureColor {
  return key in SIGNATURE_COLORS
}

export function getSignatureColorNames(): SignatureColor[] {
  return Object.keys(SIGNATURE_COLORS) as SignatureColor[]
}
