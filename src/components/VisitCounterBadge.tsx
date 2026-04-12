import { useEffect, useRef, useState } from 'react';
import { COUNTER_CONFIG } from '../config/siteConfig';

type CounterResponse = {
  ok?: boolean;
  total?: number;
  namespace?: string;
  page?: string;
  message?: string;
};

export default function VisitCounterBadge() {
  const [total, setTotal] = useState<number | null>(null);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const runCounter = async () => {
      try {
        const baseUrl = COUNTER_CONFIG.webAppUrl?.trim();
        if (!baseUrl) return;

        const storageKey = `visit-counter:${COUNTER_CONFIG.namespace}:${COUNTER_CONFIG.pageKey}`;
        const alreadyCounted = sessionStorage.getItem(storageKey) === '1';

        const buildUrl = (action: 'get' | 'hit') => {
          const url = new URL(baseUrl);
          url.searchParams.set('action', action);
          url.searchParams.set('ns', COUNTER_CONFIG.namespace);
          url.searchParams.set('page', COUNTER_CONFIG.pageKey);
          return url.toString();
        };

        if (!alreadyCounted) {
          const hitRes = await fetch(buildUrl('hit'), {
            method: 'GET',
            redirect: 'follow',
            cache: 'no-store',
          });

          const hitData: CounterResponse = await hitRes.json();

          if (hitData.ok && typeof hitData.total === 'number') {
            sessionStorage.setItem(storageKey, '1');
            setTotal(hitData.total);
            return;
          }
        }

        const getRes = await fetch(buildUrl('get'), {
          method: 'GET',
          redirect: 'follow',
          cache: 'no-store',
        });

        const getData: CounterResponse = await getRes.json();

        if (getData.ok && typeof getData.total === 'number') {
          setTotal(getData.total);
        }
      } catch (error) {
        console.error('Errore contatore visite:', error);
      }
    };

    runCounter();
  }, []);

  return (
    <div className="fixed left-3 bottom-3 z-[9999]">
      <div className="rounded-full border border-white/15 bg-black/70 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-sm sm:text-sm">
        Visite: {total ?? '—'}
      </div>
    </div>
  );
}
