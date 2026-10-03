import { useEffect, useState } from 'react';
import { COUNTER_CONFIG } from '../config/siteConfig';

type CounterResponse = {
  ok?: boolean;
  total?: number | string;
  namespace?: string;
  page?: string;
  message?: string;
};

const LAST_TOTAL_KEY = 'visit-counter:last-known-total';
const RETRY_DELAY_MS = 15000;
const REQUEST_TIMEOUT_MS = 15000;

let sharedInitialRequest: Promise<number> | null = null;

function readLastKnownTotal() {
  try {
    const value = window.localStorage.getItem(LAST_TOTAL_KEY);
    if (value === null || value.trim() === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function buildCounterUrl(action: 'get' | 'hit') {
  const baseUrl = COUNTER_CONFIG.webAppUrl?.trim();
  if (!baseUrl) throw new Error('Indirizzo del contatore non configurato');

  const url = new URL(baseUrl);
  url.searchParams.set('action', action);
  url.searchParams.set('ns', COUNTER_CONFIG.namespace);
  url.searchParams.set('page', COUNTER_CONFIG.pageKey);
  url.searchParams.set('_', String(Date.now()));
  return url.toString();
}

async function requestCounter(action: 'get' | 'hit') {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(buildCounterUrl(action), {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = (await response.json()) as CounterResponse;
    const nextTotal = Number(data.total);
    if (data.ok === false || !Number.isFinite(nextTotal)) {
      throw new Error(data.message || 'Risposta del contatore non valida');
    }

    return nextTotal;
  } finally {
    window.clearTimeout(timeout);
  }
}

function requestInitialCounter(storageKey: string) {
  if (sharedInitialRequest) return sharedInitialRequest;

  const alreadyCounted = window.sessionStorage.getItem(storageKey) === '1';
  const action: 'get' | 'hit' = alreadyCounted ? 'get' : 'hit';

  sharedInitialRequest = requestCounter(action)
    .catch(async (error) => {
      if (action !== 'hit') throw error;
      return requestCounter('get');
    })
    .then((nextTotal) => {
      if (action === 'hit') window.sessionStorage.setItem(storageKey, '1');
      return nextTotal;
    })
    .finally(() => {
      sharedInitialRequest = null;
    });

  return sharedInitialRequest;
}

export default function VisitCounterBadge() {
  const [total, setTotal] = useState<number | null>(() => readLastKnownTotal());
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let disposed = false;
    let retryTimer: number | undefined;

    const storageKey = `visit-counter:${COUNTER_CONFIG.namespace}:${COUNTER_CONFIG.pageKey}`;

    const saveTotal = (nextTotal: number) => {
      if (disposed) return;

      setTotal(nextTotal);
      setIsLoading(false);
      setHasError(false);

      try {
        window.localStorage.setItem(LAST_TOTAL_KEY, String(nextTotal));
      } catch {
        // Il totale resta comunque visibile durante la sessione corrente.
      }
    };

    const loadCounter = async (initialLoad: boolean) => {
      if (disposed) return;
      setIsLoading(true);

      try {
        const nextTotal = initialLoad
          ? await requestInitialCounter(storageKey)
          : await requestCounter('get');
        saveTotal(nextTotal);
      } catch (error) {
        console.error('Errore contatore visite:', error);
        if (disposed) return;

        setIsLoading(false);
        setHasError(true);
        retryTimer = window.setTimeout(() => {
          void loadCounter(false);
        }, RETRY_DELAY_MS);
      }
    };

    void loadCounter(true);

    return () => {
      disposed = true;
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
  }, []);

  return (
    <div className="site-visit-counter fixed left-3 bottom-3 z-[9999]">
      <div
        className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/70 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-sm sm:text-sm"
        title={hasError ? 'Il contatore riproverà automaticamente il collegamento.' : undefined}
      >
        <span>Visite:</span>
        {total !== null ? <span className="font-semibold">{total}</span> : null}
        {isLoading ? (
          <span
            className="inline-block h-3 w-3 animate-spin rounded-full border border-white/35 border-t-white"
            aria-label="Caricamento contatore visite"
          />
        ) : null}
        {total === null && !isLoading ? <span>in aggiornamento</span> : null}
      </div>
    </div>
  );
}
