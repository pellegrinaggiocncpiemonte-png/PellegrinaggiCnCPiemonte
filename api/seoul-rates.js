const SEOUL_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbz2py2LldK05Lm9jVmnDfQuKUFViwY_pxfiYnCcVyaseKgejBPyqEtf4mBP3xNqo7Rv/exec';

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=5, stale-while-revalidate=10');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ ok: false, message: 'Metodo non consentito' });
  }

  try {
    const upstreamUrl = new URL(SEOUL_WEB_APP_URL);
    upstreamUrl.searchParams.set('action', 'seoul-rates');
    upstreamUrl.searchParams.set('pellegrinaggioId', '2');
    upstreamUrl.searchParams.set('_', String(Date.now()));

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!upstreamResponse.ok) {
      throw new Error(`Servizio rate: HTTP ${upstreamResponse.status}`);
    }

    const rawBody = await upstreamResponse.text();
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch {
      throw new Error('Il servizio rate non ha restituito JSON valido');
    }

    if (data?.ok === false || !Array.isArray(data?.installments)) {
      throw new Error(data?.message || 'Piano rate non valido');
    }

    return response.status(200).json({ ...data, ok: true });
  } catch (error) {
    console.error('Errore proxy piano rate:', error);
    return response.status(502).json({
      ok: false,
      message: error instanceof Error ? error.message : 'Errore piano rate',
    });
  }
}
