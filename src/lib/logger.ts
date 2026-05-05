/**
 * Centralized Logger
 * 
 * Simple, production-ready logging system with:
 * - Environment-based log levels
 * - Structured logging (JSON in production, pretty in dev)
 * - Context support
 * - Easy to extend with external services (Sentry, LogRocket, etc.)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: string | number | boolean | object | undefined
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: Error
}

class Logger {
  private isDevelopment: boolean
  private logLevel: LogLevel

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production'
    this.logLevel = this.getLogLevel()
  }

  private getLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toLowerCase() as LogLevel
    return level || (this.isDevelopment ? 'debug' : 'info')
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= currentLevelIndex
  }

  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Pretty format for development
      const emoji = {
        debug: '🔍',
        info: '💡',
        warn: '⚠️',
        error: '❌',
      }[entry.level]

      let log = `${emoji} [${entry.level.toUpperCase()}] ${entry.message}`

      if (entry.context && Object.keys(entry.context).length > 0) {
        log += `\nContext: ${JSON.stringify(entry.context, null, 2)}`
      }

      if (entry.error) {
        log += `\nError: ${entry.error.message}\n${entry.error.stack}`
      }

      return log
    } else {
      // JSON format for production (easier to parse by log aggregators)
      return JSON.stringify({
        timestamp: entry.timestamp,
        level: entry.level,
        message: entry.message,
        ...(entry.context && { context: entry.context }),
        ...(entry.error && {
          error: {
            message: entry.error.message,
            stack: entry.error.stack,
            name: entry.error.name,
          },
        }),
      })
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    }

    const formattedLog = this.formatLog(entry)

    // Route to appropriate console method
    switch (level) {
      case 'debug':
        console.debug(formattedLog)
        break
      case 'info':
        console.info(formattedLog)
        break
      case 'warn':
        console.warn(formattedLog)
        break
      case 'error':
        console.error(formattedLog)
        break
    }

    // Hook for external logging services (Sentry, LogRocket, etc.)
    this.sendToExternalServices(entry)
  }

  private sendToExternalServices(entry: LogEntry) {
    // Future: Send errors to Sentry
    // if (entry.level === 'error' && entry.error) {
    //   Sentry.captureException(entry.error, {
    //     level: 'error',
    //     extra: entry.context,
    //   })
    // }

    // Future: Send to log aggregation service
    // if (!this.isDevelopment) {
    //   LogService.send(entry)
    // }
  }

  /**
   * Log debug information (development only by default)
   */
  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  /**
   * Log general information
   */
  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  /**
   * Log warnings
   */
  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  /**
   * Log errors
   */
  error(message: string, errorOrContext?: Error | LogContext, context?: LogContext) {
    if (errorOrContext instanceof Error) {
      this.log('error', message, context, errorOrContext)
    } else {
      this.log('error', message, errorOrContext)
    }
  }

  /**
   * Create a child logger with default context
   */
  child(defaultContext: LogContext): ChildLogger {
    return new ChildLogger(this, defaultContext)
  }
}

/**
 * Child logger with default context
 * Useful for adding consistent context (e.g., userId, requestId)
 */
class ChildLogger {
  constructor(
    private parent: Logger,
    private defaultContext: LogContext
  ) { }

  private mergeContext(context?: LogContext): LogContext {
    return { ...this.defaultContext, ...context }
  }

  debug(message: string, context?: LogContext) {
    this.parent.debug(message, this.mergeContext(context))
  }

  info(message: string, context?: LogContext) {
    this.parent.info(message, this.mergeContext(context))
  }

  warn(message: string, context?: LogContext) {
    this.parent.warn(message, this.mergeContext(context))
  }

  error(message: string, errorOrContext?: Error | LogContext, context?: LogContext) {
    if (errorOrContext instanceof Error) {
      this.parent.error(message, errorOrContext, this.mergeContext(context))
    } else {
      this.parent.error(message, this.mergeContext(errorOrContext))
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export types for consumers
export type { LogContext, LogLevel }
