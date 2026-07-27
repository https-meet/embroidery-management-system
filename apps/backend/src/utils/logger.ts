/**
 * Minimal structured logger.
 * Outputs timestamped, level-tagged messages to stdout/stderr.
 *
 * Replace with pino or winston if structured JSON logging is required later.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function format(level: LogLevel, message: string, meta?: unknown): string {
  const ts = new Date().toISOString();
  const metaSuffix = meta !== undefined ? ` ${JSON.stringify(meta)}` : '';
  return `[${ts}] [${level.toUpperCase().padEnd(5)}] ${message}${metaSuffix}`;
}

export const logger = {
  debug: (message: string, meta?: unknown): void => console.debug(format('debug', message, meta)),

  info: (message: string, meta?: unknown): void => console.info(format('info', message, meta)),

  warn: (message: string, meta?: unknown): void => console.warn(format('warn', message, meta)),

  error: (message: string, meta?: unknown): void => console.error(format('error', message, meta)),
};
