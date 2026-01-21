"use client"

import { useEffect } from "react"
import { toast } from "sonner"

interface ToastOnMountProps {
  message: string
  type?: "success" | "error" | "info" | "warning"
}

export function ToastOnMount({ message, type = "info" }: ToastOnMountProps) {
  useEffect(() => {
    toast[type](message)
  }, [message, type])

  return null
}
