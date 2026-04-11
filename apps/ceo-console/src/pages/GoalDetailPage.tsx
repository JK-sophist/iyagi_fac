import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet } from '../api';

export function GoalDetailPage() {
  const { goalId } = useParams();
  const [detail, setDetail] = useState<any>(null);
  useEffect(() => { if (goalId) void apiGet(`/goals/${goalId}`).then(setDetail); }, [goalId]);
  if (!detail) return <div>Loading...</div>;
  return <div>
    <h1>{detail.goal.title}</h1>
    {['missions', 'evidence', 'proposals', 'evalResults', 'actions', 'traces', 'revenueEvents'].map((key) => (
      <div className='card' key={key}><h3>{key}</h3><pre>{JSON.stringify(detail[key], null, 2)}</pre></div>
    ))}
  </div>;
}
