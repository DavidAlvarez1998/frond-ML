const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export const api = {
  health:    ()       => get('/'),
  modelInfo: ()       => get('/model-info'),
  signals:   (limit)  => get(`/signals?limit=${limit ?? 50}`),
  predict:   (body)   => post('/predict', body),
  backtest:  (params) => post('/backtest', params),
  chat:      (messages) => post('/chat', { messages }),
};
