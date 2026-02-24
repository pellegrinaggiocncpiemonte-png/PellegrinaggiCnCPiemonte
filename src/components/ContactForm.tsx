import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// ✅ Supabase config (Vite env)
// Se le variabili non sono presenti (o stai aprendo i file buildati direttamente in file://)
// evitiamo il crash che lascia la pagina bianca.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const ContactForm = () => {
  const [formData, setFormData] = useState({
    cognome_nome: '',
    email: '',
    numero_cellulare: '',
    messaggio: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      console.error(
        'Supabase non configurato: inserisci VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY in .env/.env.local e riavvia npm run dev.'
      );
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([formData]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({
        cognome_nome: '',
        email: '',
        numero_cellulare: '',
        messaggio: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-6">
      <div>
        <input
          type="text"
          name="cognome_nome"
          value={formData.cognome_nome}
          onChange={handleChange}
          placeholder="Cognome Nome*"
          required
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
        />
      </div>

      <div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="E-mail*"
          required
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
        />
      </div>

      <div>
        <input
          type="tel"
          name="numero_cellulare"
          value={formData.numero_cellulare}
          onChange={handleChange}
          placeholder="Numero cellulare*"
          required
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
        />
      </div>

      <div>
        <textarea
          name="messaggio"
          value={formData.messaggio}
          onChange={handleChange}
          placeholder="Scrivi il tuo messaggio*"
          required
          rows={6}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Invio in corso...' : 'Invia'}
      </button>

      {submitStatus === 'success' && (
        <div className="text-green-600 text-center font-semibold">
          Messaggio inviato con successo!
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="text-red-600 text-center font-semibold">
          Errore durante l'invio. Riprova più tardi.
        </div>
      )}
    </form>
  );
};

export default ContactForm;
