/**
 * Structured JSON logger for production-grade observability.
 * Outputs machine-parseable JSON logs with consistent fields.
 * 
 * In production, these logs can be ingested by:
 * - Vercel Log Drain → Datadog/Loki
 * - Sentry breadcrumbs
 * - PostHog events
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

function formatLog(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: "ai-trip-planner",
    env: process.env.NODE_ENV || "development",
    ...context,
  };

  // Strip error stacks in production for cleaner logs (Sentry captures full stacks)
  if (level === "error" && context?.stack && process.env.NODE_ENV === "production") {
    delete entry.stack;
  }

  return JSON.stringify(entry);
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (shouldLog("debug")) {
      console.debug(formatLog("debug", message, context));
    }
  },

  info(message: string, context?: LogContext) {
    if (shouldLog("info")) {
      console.info(formatLog("info", message, context));
    }
  },

  warn(message: string, context?: LogContext) {
    if (shouldLog("warn")) {
      console.warn(formatLog("warn", message, context));
    }
  },

  error(message: string, context?: LogContext) {
    if (shouldLog("error")) {
      console.error(formatLog("error", message, context));
    }
  },

  /** Log an API request with timing */
  apiRequest(method: string, path: string, statusCode: number, durationMs: number, context?: LogContext) {
    const level: LogLevel = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
    this[level](`${method} ${path} ${statusCode} ${durationMs}ms`, {
      method,
      path,
      statusCode,
      durationMs,
      ...context,
    });
  },
};
