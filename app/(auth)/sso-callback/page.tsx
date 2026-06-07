'use client'

import { useClerk } from '@clerk/nextjs'
import { useEffect } from 'react'

export default function SSOCallbackPage() {
  const { handleRedirectCallback } = useClerk()

  useEffect(() => {
    handleRedirectCallback(
      { signInForceRedirectUrl: '/chat', signUpForceRedirectUrl: '/chat' },
      (to) => {
        window.location.href = to
        return Promise.resolve()
      },
    ).catch(() => {
      window.location.href = '/sign-in'
    })
  }, [handleRedirectCallback])

  return null
}
