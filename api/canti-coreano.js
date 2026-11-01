const SOURCE_URL = 'https://www.joinway.org/canti/';

const decodeHtml = (value = '') =>
  String(value)
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&agrave;/gi, 'à')
    .replace(/&egrave;/gi, 'è')
    .replace(/&eacute;/gi, 'é')
    .replace(/&igrave;/gi, 'ì')
    .replace(/&ograve;/gi, 'ò')
    .replace(/&ugrave;/gi, 'ù');

const stripTags = (value = '') =>
  decodeHtml(String(value).replace(/<br\s*\/?\s*>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

const toAbsolute = (value) => {
  if (!value) return '';
  try {
    return new URL(decodeHtml(value), SOURCE_URL).toString();
  } catch {
    return '';
  }
};

const extractUrls = (html = '') => {
  const urls = [];
  const patterns = [
    /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi,
    /<source\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi,
    /<audio\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html))) {
      const absolute = toAbsolute(match[1]);
      if (!absolute || absolute.startsWith('javascript:') || absolute.endsWith('#')) continue;
      if (!urls.includes(absolute)) urls.push(absolute);
    }
  }
  return urls;
};

const pickAudio = (urls) =>
  urls.find((url) => /\.mp3(?:$|[?#])/i.test(url)) ||
  urls.find((url) => /audio|mp3/i.test(url)) ||
  urls[0] || '';

const pickPdf = (urls) =>
  urls.find((url) => /\.pdf(?:$|[?#])/i.test(url)) ||
  urls.find((url) => /pdf|download|file/i.test(url)) ||
  urls[0] || '';

const parseSongs = (html) => {
  const songs = [];
  const rows = String(html).match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];

  for (const row of rows) {
    const cells = row.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
    if (cells.length < 4) continue;

    const title = stripTags(cells[0]);
    if (!title || /titolo\s*canto/i.test(title)) continue;

    const audio = pickAudio(extractUrls(cells[1]));
    const textPdf = pickPdf(extractUrls(cells[2]));
    const pronunciationPdf = pickPdf(extractUrls(cells[3]));

    if (!audio && !textPdf && !pronunciationPdf) continue;
    songs.push({ title, audio, textPdf, pronunciationPdf });
  }

  return songs;
};

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ ok: false, message: 'Metodo non consentito' });
  }

  try {
    const upstream = await fetch(SOURCE_URL, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (compatible; PellegrinaggiCnC/1.0)',
      },
    });

    if (!upstream.ok) throw new Error(`HTTP ${upstream.status}`);
    const html = await upstream.text();
    const songs = parseSongs(html);
    if (!songs.length) throw new Error('Nessun materiale trovato nella tabella canti');

    return response.status(200).json({ ok: true, songs });
  } catch (error) {
    console.error('Errore recupero materiali canti:', error);
    return response.status(502).json({
      ok: false,
      songs: [],
      message: 'Materiali esterni momentaneamente non disponibili',
    });
  }
}
