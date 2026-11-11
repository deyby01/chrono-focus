import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

/**
 * Configured Express application (security headers, CORS, JSON parsing,
 * request logging, `/api` routes, and error handling).
 * Kept separate from `server.js` so it can be imported in tests without opening a port.
 *
 * @type {import('express').Express}
 */
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json());
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

