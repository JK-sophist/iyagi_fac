import { beforeEach, describe, expect, it } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { buildApp } from '../../apps/api/src/app';

const files = ['goals','missions','evidence','proposals','eval-results','actions','traces','revenue-events'];

describe('E2E orchestration', () => {
  beforeEach(async () => {
    for (const f of files) await fs.writeFile(path.resolve(process.cwd(), `runtime-data/${f}.json`), '[]', 'utf-8');
    process.env.PROVIDER_MODE = 'mock';
  });

  it('run-sample builds end-to-end artifacts', async () => {
    const app = buildApp();
    const run = await app.inject({ method: 'POST', url: '/demo/run-sample' });
    expect(run.statusCode).toBe(200);

    const dash = await app.inject({ method: 'GET', url: '/dashboard' });
    const body = dash.json();
    expect(body.goalCount).toBeGreaterThanOrEqual(1);
    expect((await app.inject({ method: 'GET', url: '/goals' })).json().length).toBeGreaterThanOrEqual(1);

    const goals = (await app.inject({ method: 'GET', url: '/goals' })).json();
    const detail = (await app.inject({ method: 'GET', url: `/goals/${goals[0].id}` })).json();

    expect(detail.missions.length).toBeGreaterThanOrEqual(3);
    expect(detail.evidence.length).toBeGreaterThanOrEqual(1);
    expect(detail.proposals.length).toBeGreaterThanOrEqual(1);
    expect(detail.evalResults.length).toBeGreaterThanOrEqual(1);
    expect(detail.actions.filter((a: any) => a.status === 'pending').length).toBeGreaterThanOrEqual(1);
    expect(detail.traces.length).toBeGreaterThanOrEqual(3);
    expect(detail.revenueEvents.length).toBeGreaterThanOrEqual(2);
    await app.close();
  });
});
