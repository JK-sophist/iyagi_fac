import { useEffect, useState } from 'react';
import { apiGet } from '../api';

export function TracesPage() {
  const [traces, setTraces] = useState<any[]>([]);
  useEffect(() => { void apiGet<any[]>('/traces').then(setTraces); }, []);
  return <div><h1>Traces</h1>{traces.map((t) => <div className='card' key={t.id}><strong>{t.agent}</strong> - {t.step} ({t.provider})<pre>{JSON.stringify(t, null, 2)}</pre></div>)}</div>;
}
