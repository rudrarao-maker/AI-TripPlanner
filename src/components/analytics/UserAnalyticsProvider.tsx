'use client'

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { usePostHog } from "posthog-js/react"
import * as Sentry from "@sentry/nextjs"

export function UserAnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const posthog = usePostHog()

  useEffect(() => {
    if (!isLoaded || !posthog) return

    if (user) {
      const email = user.primaryEmailAddress?.emailAddress
      
      // Identify user in PostHog
      posthog.identify(user.id, {
        email: email,
        name: user.fullName,
      })
      
      // Identify user in Sentry
      Sentry.setUser({
        id: user.id,
        email: email,
        username: user.fullName || undefined,
      })
      
      // Ensure user is synced to our local Postgres database
      // This protects against Bulk Import users missing the user.created webhook
      fetch('/api/auth/sync', { method: 'POST' }).catch(() => {});
    } else {
      // User logged out
      posthog.reset()
      Sentry.setUser(null)
    }
  }, [user, isLoaded, posthog])

  return <>{children}</>
}
