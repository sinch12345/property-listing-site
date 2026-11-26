const API_BASE = ['localhost', '127.0.0.1'].includes(location.hostname)
    ? 'http://localhost:3000'
  : 'https://property-listing-site-gx02.onrender.com';

async function apiPost(path, body) {
  try {
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: { error: 'Cannot reach the server. Please try again later.' } };
  }
}

function apiErrorText(data) {
  if (data && data.fields) return Object.values(data.fields).join(' · ');
  return (data && data.error) || 'Something went wrong. Please try again.';
}