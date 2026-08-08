'use client'

import { usePostHog } from 'posthog-js/react'
import { useCallback } from 'react'

export function useAnalytics() {
  const posthog = usePostHog()

  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.capture(eventName, properties)
    }
  }, [posthog])

  return { trackEvent }
}
