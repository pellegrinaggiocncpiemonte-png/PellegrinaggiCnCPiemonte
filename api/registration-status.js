const REGISTRATION_WEB_APP_URLS = [
  'https://script.google.com/macros/s/AKfycbxoay9uqD-q6EaLwTHJm119BJ2XZbaMcg63l1PH5EJMQfrr-AUOjph2E0Tv9QZIU74b/exec',
  'https://script.google.com/macros/s/AKfycbzOoD7KhBMBl4hXJtajsvvbFAM-8Yrb9MnWfKCspc6AbWjv_J3ev53khHnSXhhpFEm3/exec',
];

async function requestRegistrationStatus(endpoint, code) {
  const upstreamUrl = new URL(endpoint);
  upstreamUrl.searchParams.set('registration_status', code);
  upstreamUrl.searchParams.set('_', String(Date.now()));

  const upstreamResponse = await fetch(upstreamUrl, {
    method: 'GET',
    redirect: 'follow',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!upstreamResponse.ok) throw new Error(`Apps Script HTTP ${upstreamResponse.status}`);
  const raw = await upstreamResponse.text();
  let payload;
  try { payload = JSON.parse(raw); } catch { throw new Error('Apps Script non ha restituito JSON valido'); }
  if (!payload || typeof payload !== 'object' || typeof payload.success !== 'boolean') {
    throw new Error('Risposta Apps Script non riconosciuta');
  }
  return payload;
}

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store, max-age=0');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ success: false, found: false, message: 'Metodo non consentito' });
  }

  const code = String(request.query?.code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
  if (!/^[A-Z0-9]{4,16}$/.test(code)) {
    return response.status(200).json({ success: true, found: false, status: 'not_found', message: 'Codice Univoco non valido.' });
  }

  const errors = [];
  for (const endpoint of REGISTRATION_WEB_APP_URLS) {
    try {
      const payload = await requestRegistrationStatus(endpoint, code);
      return response.status(200).json(payload);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  console.error('Errore verifica iscrizione:', errors.join(' | '));
  return response.status(502).json({
    success: false,
    found: false,
    status: 'error',
    message: 'Verifica temporaneamente non disponibile. Riprova tra poco.',
  });
}
