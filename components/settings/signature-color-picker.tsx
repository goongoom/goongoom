"use client"

import { useTranslations } from "next-intl"
import { useCallback } from "react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { updateProfile } from "@/lib/actions/profile"
import {
  getSignatureColorNames,
  SIGNATURE_COLORS,
  type SignatureColor,
} from "@/lib/colors/signature-colors"

interface SignatureColorPickerProps {
  currentColor: SignatureColor
  labels: {
    saving: string
    saved: string
  }
}

export function SignatureColorPicker({
  currentColor,
  labels,
}: SignatureColorPickerProps) {
  const tErrors = useTranslations("errors")
  const colorNames = getSignatureColorNames()

  const handleColorChange = useCallback(
    (value: string) => {
      toast.promise(updateProfile({ signatureColor: value }), {
        loading: labels.saving,
        success: labels.saved,
        error: (err) => err?.message || tErrors("genericError"),
      })
    },
    [labels, tErrors]
  )

  return (
    <RadioGroup
      className="grid grid-cols-6 gap-2"
      defaultValue={currentColor}
      onValueChange={handleColorChange}
    >
      {colorNames.map((colorName) => {
        const colors = SIGNATURE_COLORS[colorName]
        return (
          <Label
            className="group relative flex cursor-pointer items-center justify-center"
            key={colorName}
          >
            <RadioGroupItem
              className="pointer-events-none absolute opacity-0"
              value={colorName}
            />
            <div
              className="size-9 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-background transition-all group-hover:ring-border group-has-data-checked:ring-foreground"
              style={{ backgroundColor: colors.light.primary }}
            />
          </Label>
        )
      })}
    </RadioGroup>
  )
}
