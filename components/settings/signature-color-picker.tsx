'use client'

import { useAuth } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { useTranslations } from 'next-intl'
import posthog from 'posthog-js'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { useSignatureColor } from '@/components/theme/signature-color-provider'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { api } from '@/convex/_generated/api'
import { getSignatureColorNames, SIGNATURE_COLORS, type SignatureColor } from '@/lib/colors/signature-colors'

interface SignatureColorPickerProps {
  currentColor: SignatureColor
  labels: {
    saving: string
    saved: string
  }
}

export function SignatureColorPicker({ currentColor, labels }: SignatureColorPickerProps) {
  const tErrors = useTranslations('errors')
  const { userId } = useAuth()
  const { setSignatureColor } = useSignatureColor()
  const colorNames = getSignatureColorNames()
  const updateProfile = useMutation(api.users.updateProfile)

  const handleColorChange = useCallback(
    (value: string) => {
      if (!userId) return
      posthog.capture('signature_color_changed', {
        previous_color: currentColor,
        new_color: value,
      })
      setSignatureColor(value)
      toast.promise(updateProfile({ clerkId: userId, signatureColor: value }), {
        loading: labels.saving,
        success: labels.saved,
        error: (err) => err?.message || tErrors('genericError'),
      })
    },
    [labels, tErrors, setSignatureColor, updateProfile, userId, currentColor]
  )

  return (
    <RadioGroup className="grid grid-cols-6 gap-2" value={currentColor} onValueChange={handleColorChange}>
      {colorNames.map((colorName) => {
        const colors = SIGNATURE_COLORS[colorName]
        return (
          <Label className="group relative flex cursor-pointer items-center justify-center" key={colorName}>
            <RadioGroupItem className="pointer-events-none absolute opacity-0" value={colorName} />
            <div
              className="size-9 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-background transition-all group-has-data-checked:ring-foreground"
              style={{ backgroundColor: colors.light.primary }}
            />
          </Label>
        )
      })}
    </RadioGroup>
  )
}
