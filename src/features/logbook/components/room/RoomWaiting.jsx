import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function RoomWaiting({ code, fromZero }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="lgr-waiting">
      <p className="lgr-waiting__label">Código de la sala</p>
      <p className="lgr-waiting__code">{code}</p>
      <button type="button" className="lgr-btn" onClick={copy}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? 'Copiado' : 'Copiar código'}
      </button>
      <p className="lgr-waiting__mode">{fromZero ? 'Modo Desde 0' : 'Modo Historial'}</p>
      <p className="lgr-waiting__status">Esperando rival...</p>
    </div>
  );
}
