import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiPost } from '../api';

export function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', description: '', targetMetric: '' });
  const load = () => apiGet<any[]>('/goals').then(setGoals);
  useEffect(() => { void load(); }, []);
  return <div>
    <h1>Goals</h1>
    <div className='card'>
      <h3>Create Goal</h3>
      <input placeholder='title' value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea placeholder='description' value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input placeholder='targetMetric' value={form.targetMetric} onChange={(e) => setForm({ ...form, targetMetric: e.target.value })} />
      <button onClick={async () => { await apiPost('/goals', form); setForm({ title: '', description: '', targetMetric: '' }); await load(); }}>Create</button>
    </div>
    {goals.map((g) => <div className='card' key={g.id}><Link to={`/goals/${g.id}`}>{g.title}</Link> ({g.status})</div>)}
  </div>;
}
