const WAITLIST_WEB_APP_URLS = [
  'https://script.google.com/macros/s/AKfycbxoay9uqD-q6EaLwTHJm119BJ2XZbaMcg63l1PH5EJMQfrr-AUOjph2E0Tv9QZIU74b/exec',
  'https://script.google.com/macros/s/AKfycbzOoD7KhBMBl4hXJtajsvvbFAM-8Yrb9MnWfKCspc6AbWjv_J3ev53khHnSXhhpFEm3/exec',
];

async function submitToWebApp(baseUrl, body) {
  const upstreamUrl = new URL(baseUrl);
  upstreamUrl.searchParams.set('public_waitlist', '1');
  upstreamUrl.searchParams.set('_', String(Date.now()));

  const upstreamResponse = await fetch(upstreamUrl, {
    method: 'POST',
    redirect: 'follow',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  });

  const raw = await upstreamResponse.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('La distribuzione della Web App non supporta ancora la richiesta pubblica');
  }

  if (!upstreamResponse.ok || data?.success === false || data?.ok === false) {
    const error = new Error(data?.message || 'Richiesta non registrata');
    error.isApplicationError = true;
    throw error;
  }
  return data;
}

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store, max-age=0');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, success: false, message: 'Metodo non consentito' });
  }

  try {
    const body = request.body && typeof request.body === 'object'
      ? request.body
      : JSON.parse(String(request.body || '{}'));

    let lastError = null;
    for (const baseUrl of WAITLIST_WEB_APP_URLS) {
      try {
        const data = await submitToWebApp(baseUrl, body);
        return response.status(200).json(data);
      } catch (error) {
        lastError = error;
        if (error?.isApplicationError) break;
      }
    }

    throw lastError || new Error('Web App non raggiungibile');
  } catch (error) {
    console.error('Errore richiesta pubblica lista attesa:', error);
    const isApplicationError = Boolean(error?.isApplicationError);
    return response.status(isApplicationError ? 400 : 502).json({
      ok: false,
      success: false,
      message: error instanceof Error ? error.message : 'Errore durante il salvataggio della richiesta',
    });
  }
}
