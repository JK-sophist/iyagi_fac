export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';

export type ApiEnvelope<T> = {
  ok: boolean;
  data: T;
  warnings: string[];
  stop_reason: string | null;
};

async function parse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok || json.ok === false) {
    throw new Error(json?.detail?.error?.message ?? json?.error?.message ?? 'API error');
  }
  return json as T;
}

export async function apiGet<T>(path: string): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  return parse<ApiEnvelope<T>>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
    cache: 'no-store'
  });
  return parse<ApiEnvelope<T>>(res);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
    cache: 'no-store'
  });
  return parse<ApiEnvelope<T>>(res);
}

export async function apiDelete<T>(path: string): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    cache: 'no-store'
  });
  return parse<ApiEnvelope<T>>(res);
}
