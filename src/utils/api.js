const BASE = import.meta.env.VITE_API_URL ?? '';

/**
 * Unified request wrapper with 60s timeout, 1× retry on 5xx, AbortSignal support.
 * @param {string} path — API path (e.g. '/predict')
 * @param {object} options
 * @param {string} [options.method='GET']
 * @param {object} [options.body] — JSON-serializable body (mutually exclusive with formData)
 * @param {AbortSignal} [options.signal] — external AbortSignal to merge with timeout
 * @param {FormData} [options.formData] — FormData for multipart uploads (mutually exclusive with body)
 */
async function request(path, { method = 'GET', body, signal, formData } = {}) {
  const exec = async (attempt) => {
    // Combine timeout with any external signal
    const timeoutSignal = AbortSignal.timeout(60000);
    const combinedSignal = signal
      ? (AbortSignal.any
        ? AbortSignal.any([timeoutSignal, signal])
        : timeoutSignal)
      : timeoutSignal;

    const options = { method, signal: combinedSignal };

    if (formData) {
      // FormData — browser sets Content-Type with multipart boundary
      options.body = formData;
    } else if (body !== undefined) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE}${path}`, options);

    if (!res.ok) {
      // 1× automatic retry on server errors
      if (res.status >= 500 && attempt === 1) {
        await new Promise((r) => setTimeout(r, 500));
        return exec(2);
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail ?? `Error ${res.status}`);
    }

    return res.json();
  };

  return exec(1);
}

async function get(path, signal) {
  return request(path, { method: 'GET', signal });
}

async function post(path, body, signal) {
  return request(path, { method: 'POST', body, signal });
}

export const api = {
  health:      (signal)       => get('/', signal),
  modelInfo:   (signal)       => get('/model-info', signal),
  signals:     (limit, signal) => get(`/signals?limit=${limit ?? 50}`, signal),
  predict:     (body, signal)  => post('/predict', body, signal),
  backtest:    (params, signal) => post('/backtest', params, signal),
  chat:        (messages)      => post('/chat', { messages }),
  backtestCSV: (file, params, signal) => {
    const fd = new FormData();
    fd.append('file', file);
    Object.entries(params).forEach(([k, v]) => fd.append(k, String(v)));
    return request('/backtest-upload', {
      method: 'POST',
      formData: fd,
      signal,
    });
  },
};
