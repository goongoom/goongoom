'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

interface ToastOnMountProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
}

export function ToastOnMount({ message, type = 'info' }: ToastOnMountProps) {
  const shownRef = useRef(false)

  useEffect(() => {
    if (shownRef.current) {
      return
    }
    shownRef.current = true
    toast[type](message)
  }, [message, type])

  return null
}
