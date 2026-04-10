import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api';

export function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const load = () => apiGet<any>('/dashboard').then(setData);
  useEffect(() => { void load(); }, []);

  return <div>
    <h1>Dashboard</h1>
    <button onClick={async () => { await apiPost('/demo/run-sample'); await load(); }}>Run Sample</button>
    {data && <>
      <div className='card'>Goals: {data.goalCount} | Pending Approvals: {data.pendingApprovalCount} | Proposals: {data.proposalCount} | Revenue Events: {data.revenueEventCount}</div>
      <div className='card'><h3>Recent Goals</h3><pre>{JSON.stringify(data.recentGoals, null, 2)}</pre></div>
      <div className='card'><h3>Pending Approvals</h3><pre>{JSON.stringify(data.pendingApprovals, null, 2)}</pre></div>
      <div className='card'><h3>Recent Traces</h3><pre>{JSON.stringify(data.recentTraces, null, 2)}</pre></div>
    </>}
  </div>;
}
