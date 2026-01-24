'use client'

import { useNavigationDirection } from '@/hooks/use-navigation-direction'
import { useSwipeBack } from '@/hooks/use-swipe-back'

export function NavigationProvider() {
  useNavigationDirection()
  useSwipeBack()
  return null
}
