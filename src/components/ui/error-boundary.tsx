"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center -z-10">
          <div className="text-center p-8 bg-background/80 backdrop-blur rounded-2xl border max-w-sm">
            <h3 className="font-bold text-lg mb-2">3D Scene Unavailable</h3>
            <p className="text-sm text-muted-foreground">This scene requires internet access. You can still use all app functions normally.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
