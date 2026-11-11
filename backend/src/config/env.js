import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Centralized, typed application configuration loaded from environment variables.
 * The root `.env` is loaded first, then `backend/.env`; existing values are never overwritten.
 *
 * @type {{
 *   nodeEnv: string,
 *   port: number,
 *   corsOrigin: string,
 *   databaseUrl: string|null,
 *   db: { host: string, port: number, user: string, password: string, database: string }
 * }}
 */
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.BACKEND_PORT || process.env.PORT || 4000),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  databaseUrl: process.env.DATABASE_URL || null,
  db: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || 'chronofocus',
    password: process.env.POSTGRES_PASSWORD || 'chronofocus_secret',
    database: process.env.POSTGRES_DB || 'chronofocus_db',
  },
};
