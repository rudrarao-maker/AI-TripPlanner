'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-6">
      <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full">
        <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
        <p className="text-muted-foreground max-w-[500px] mx-auto">
          We've encountered an unexpected error. Our engineering team has been automatically notified.
        </p>
      </div>
      <Button 
        onClick={() => reset()} 
        className="gap-2"
        variant="default"
      >
        <RefreshCw className="h-4 w-4" /> Try again
      </Button>
    </div>
  );
}
