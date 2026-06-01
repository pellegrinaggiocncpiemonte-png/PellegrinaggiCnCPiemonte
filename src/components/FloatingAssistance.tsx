import { MessageCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export default function FloatingAssistance() {
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const api = (window.Tawk_API = window.Tawk_API || {});
    window.Tawk_LoadStart = new Date();

    api.onLoad = () => {
      setIsReady(true);
      api.hideWidget?.();
    };
    api.onChatMaximized = () => setIsOpen(true);
    api.onChatMinimized = () => {
      setIsOpen(false);
      api.hideWidget?.();
    };
    api.onChatEnded = () => {
      setIsOpen(false);
      api.hideWidget?.();
    };

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-tawk-widget="true"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/65fdae1ba0c6737bd123b4bd/1hpjf07eo';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      script.dataset.tawkWidget = 'true';
      document.body.appendChild(script);
    }
  }, []);

  const openAssistance = () => {
    if (isReady && window.Tawk_API?.maximize) {
      window.Tawk_API.showWidget?.();
      window.Tawk_API.maximize();
      setIsOpen(true);
      return;
    }
    setShowFallback(true);
  };

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          onClick={openAssistance}
          className="fixed bottom-5 right-4 z-[90] inline-flex items-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white shadow-2xl transition-transform hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
          aria-label="Apri assistenza online"
          title="Apri assistenza online"
        >
          <MessageCircle size={20} />
          <span className="hidden min-[360px]:inline">Assistenza</span>
        </button>
      ) : null}

      {showFallback ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowFallback(false)}
            aria-label="Chiudi assistenza"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 text-black shadow-2xl">
            <button
              type="button"
              onClick={() => setShowFallback(false)}
              className="absolute right-4 top-4 rounded-full border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-100"
              aria-label="Chiudi"
            >
              <X size={18} />
            </button>
            <div className="pr-8">
              <h2 className="text-2xl font-serif font-bold">Assistenza online</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                La chat si sta caricando. Attendi qualche secondo e premi nuovamente il pulsante Assistenza.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowFallback(false);
                  window.setTimeout(openAssistance, 350);
                }}
                className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Riprova ad aprire la chat
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
