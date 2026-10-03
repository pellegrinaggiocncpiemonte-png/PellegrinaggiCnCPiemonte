const COUNTER_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbz2py2LldK05Lm9jVmnDfQuKUFViwY_pxfiYnCcVyaseKgejBPyqEtf4mBP3xNqo7Rv/exec';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ ok: false, message: 'Metodo non consentito' });
  }

  const action = request.query?.action === 'get' ? 'get' : 'hit';
  const namespace = String(
    request.query?.ns || 'pellegrinaggi-cnc-piemonte-svizzera',
  );
  const page = String(request.query?.page || 'home');

  try {
    const upstreamUrl = new URL(COUNTER_WEB_APP_URL);
    upstreamUrl.searchParams.set('action', action);
    upstreamUrl.searchParams.set('ns', namespace);
    upstreamUrl.searchParams.set('page', page);
    upstreamUrl.searchParams.set('_', String(Date.now()));

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!upstreamResponse.ok) {
      throw new Error(`Servizio contatore: HTTP ${upstreamResponse.status}`);
    }

    const rawBody = await upstreamResponse.text();
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch {
      throw new Error('Il servizio contatore non ha restituito JSON valido');
    }

    const total = Number(data?.total);
    if (data?.ok === false || !Number.isFinite(total)) {
      throw new Error(data?.message || 'Totale visite non disponibile');
    }

    return response.status(200).json({
      ok: true,
      total,
      namespace: data?.namespace || namespace,
      page: data?.page || page,
    });
  } catch (error) {
    console.error('Errore proxy contatore visite:', error);
    return response.status(502).json({
      ok: false,
      message: error instanceof Error ? error.message : 'Errore contatore visite',
    });
  }
}
