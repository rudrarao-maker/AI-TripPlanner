'use client';
 
import * as Sentry from '@sentry/nextjs';
import Error from 'next/error';
import { useEffect } from 'react';
 
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
 
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Something went drastically wrong!</h2>
          <p>Our team has been notified. Please try refreshing the page.</p>
        </div>
      </body>
    </html>
  );
}
