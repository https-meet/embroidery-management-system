import http from 'http';
import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';

const app = createApp();
const server = http.createServer(app);

/**
 * Graceful shutdown handler.
 * Stops accepting new connections, waits for in-flight requests to complete,
 * then exits cleanly.
 */
function shutdown(signal: string): void {
  logger.info(`${signal} received — shutting down gracefully.`);

  server.close(() => {
    logger.info('All connections closed. Server exiting.');
    process.exit(0);
  });

  // Safety net: force-exit if connections don't drain within 10 seconds
  setTimeout(() => {
    logger.warn('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10_000).unref();
}

server.listen(config.port, () => {
  logger.info(`EBMS backend started`, {
    port: config.port,
    env: config.nodeEnv,
  });
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
