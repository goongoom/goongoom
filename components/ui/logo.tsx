"use client"

import Image from "next/image"
import { cva, type VariantProps } from "class-variance-authority"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import logoImage from "@/assets/logo.png"

const logoVariants = cva("", {
  variants: {
    size: {
      xs: "size-4",
      sm: "size-6",
      md: "size-8",
      lg: "size-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

interface LogoProps extends VariantProps<typeof logoVariants> {
  className?: string
}

export function Logo({ size = "md", className }: LogoProps) {
  const t = useTranslations("ui")
  const sizeMap = {
    xs: 16,
    sm: 24,
    md: 32,
    lg: 48,
  }

  const pixelSize = sizeMap[size || "md"]

  return (
    <div className={cn(logoVariants({ size, className }))}>
      <Image
        src={logoImage}
        alt={t("logo")}
        width={pixelSize}
        height={pixelSize}
        priority
        className="size-full"
      />
    </div>
  )
}
