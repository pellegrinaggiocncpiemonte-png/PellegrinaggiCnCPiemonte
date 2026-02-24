import { useEffect, useState } from "react";

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export default function ChatSupportButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // apre la chat e nasconde il bottone
  const openChat = () => {
    if (window.Tawk_API?.maximize) {
      window.Tawk_API.maximize();
      setIsChatOpen(true);
    } else {
      // fallback: se Tawk non è ancora pronto
      window.open("https://tawk.to/chat/65fdae1ba0c6737bd123b4bd/1hpjf07eo", "_blank");
    }
  };

  useEffect(() => {
    const attach = () => {
      const api = window.Tawk_API;
      if (!api) return false;

      // Quando la chat viene aperta (o riaperta)
      api.onChatMaximized = () => setIsChatOpen(true);

      // Quando la chat viene minimizzata/chiusa (torna la bolla)
      api.onChatMinimized = () => setIsChatOpen(false);

      // Quando l’utente termina la chat
      api.onChatEnded = () => setIsChatOpen(false);

      // Quando il widget viene nascosto
      api.onChatHidden = () => setIsChatOpen(false);

      return true;
    };

    // prova subito
    if (attach()) return;

    // altrimenti riprova finché Tawk carica (leggero e sicuro)
    const t = setInterval(() => {
      if (attach()) clearInterval(t);
    }, 300);

    return () => clearInterval(t);
  }, []);

  // Se chat aperta → NON mostrare il tuo pulsante
  if (isChatOpen) return null;

  return (
    <button
      onClick={openChat}
      className="fixed bottom-6 right-6 z-[9999] bg-black text-white px-4 py-3 rounded-full shadow-lg hover:opacity-90 transition"
      aria-label="Apri chat assistenza"
      title="Assistenza online"
    >
      Chat
    </button>
  );
}
