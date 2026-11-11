import app from './app.js';
import { env } from './config/env.js';
import { initializeDatabase } from './db/initDb.js';

/**
 * Application entry point: prepares the database, then starts the HTTP server.
 * Exits the process with code 1 if startup fails.
 *
 * @returns {Promise<void>}
 */
async function bootstrap() {
  try {
    await initializeDatabase();
    app.listen(env.port, '0.0.0.0', () => {
      console.log(`ChronoFocus API listening on http://0.0.0.0:${env.port}/api`);
    });
  } catch (error) {
    console.error('Failed to bootstrap ChronoFocus API:', error);
    process.exit(1);
  }
}

bootstrap();

