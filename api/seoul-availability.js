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
    upstreamUrl.searchParams.set('action', 'seoul');
    upstreamUrl.searchParams.set('_', String(Date.now()));

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!upstreamResponse.ok) {
      throw new Error(`Servizio posti: HTTP ${upstreamResponse.status}`);
    }

    const rawBody = await upstreamResponse.text();
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch {
      throw new Error('Il servizio posti non ha restituito JSON valido');
    }

    const totalePosti = Number(data?.totalePosti);
    const postiRimanenti = Number(data?.postiRimanenti);
    if (data?.ok === false || !Number.isFinite(totalePosti) || !Number.isFinite(postiRimanenti)) {
      throw new Error(data?.messaggio || 'Disponibilità posti non valida');
    }

    return response.status(200).json({
      ...data,
      ok: true,
      totalePosti,
      postiRimanenti,
    });
  } catch (error) {
    console.error('Errore proxy disponibilità posti:', error);
    return response.status(502).json({
      ok: false,
      message: error instanceof Error ? error.message : 'Errore disponibilità posti',
    });
  }
}
