import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api';

export function ApprovalsPage() {
  const [actions, setActions] = useState<any[]>([]);
  const load = () => apiGet<any[]>('/approvals').then(setActions);
  useEffect(() => { void load(); }, []);
  return <div><h1>Approvals</h1>
    {actions.map((a) => <div className='card' key={a.id}>
      <pre>{JSON.stringify(a, null, 2)}</pre>
      <button onClick={async () => { await apiPost(`/approvals/${a.id}/approve`); await load(); }}>Approve</button>
      <button onClick={async () => { await apiPost(`/approvals/${a.id}/reject`); await load(); }}>Reject</button>
    </div>)}
  </div>;
}
