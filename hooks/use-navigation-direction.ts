'use client'

import { useEffect } from 'react'

export function useNavigationDirection() {
  useEffect(() => {
    function handlePopState() {
      document.documentElement.dataset.navDirection = 'back'
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
}
