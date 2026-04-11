import Fastify from 'fastify';
import pino from 'pino';
import { healthRoutes } from './routes/health';
import { goalsRoutes } from './routes/goals';
import { approvalRoutes } from './routes/approvals';
import { demoRoutes } from './routes/demo';
import { tracesRoutes } from './routes/traces';
import { dashboardRoutes } from './routes/dashboard';

export function buildApp() {
  const app = Fastify({ logger: pino({ level: 'info' }) });
  app.register(healthRoutes);
  app.register(goalsRoutes);
  app.register(approvalRoutes);
  app.register(demoRoutes);
  app.register(tracesRoutes);
  app.register(dashboardRoutes);
  return app;
}
