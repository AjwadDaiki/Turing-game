'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import DeskDecor from '@/components/DeskDecor';

/* Texte machine à écrire lettre par lettre */
function Typewriter({ text, className }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, 45);
    return () => clearInterval(iv);
  }, [text]);
  return <span className={className}>{displayed}<span className="animate-blink">▌</span></span>;
}

/* Champ formulaire vintage */
function VintageInput({
  label, value, onChange, placeholder, type = 'text', maxLength, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; maxLength?: number; disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="font-stamp text-xs uppercase tracking-widest" style={{ color: 'var(--ink-black)', opacity: 0.6 }}>
        {label}
      </label>
      <input
        className="field-line text-base"
        style={{ fontSize: '1rem' }}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { socket, connected } = useSocket();
  const [pseudo, setPseudo] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onRoomEntered({ code }: { code: string }) {
      router.push(`/room/${code}`);
    }
    function onError({ message }: { message: string }) {
      setError(message);
      setLoading(false);
    }
    socket.on('room:created', onRoomEntered);
    socket.on('room:joined', onRoomEntered);
    socket.on('error', onError);
    return () => {
      socket.off('room:created', onRoomEntered);
      socket.off('room:joined', onRoomEntered);
      socket.off('error', onError);
    };
  }, [socket, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!pseudo.trim()) { setError('SUJET NON IDENTIFIÉ — entrez votre alias'); return; }
    if (mode === 'join' && !code.trim()) { setError('CODE DOSSIER MANQUANT'); return; }
    setLoading(true);
    if (mode === 'create') {
      socket.emit('room:create', { pseudo: pseudo.trim() });
    } else {
      socket.emit('room:join', { pseudo: pseudo.trim(), code: code.trim().toUpperCase() });
    }
  }

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <DeskDecor />

      {/* Zone centrale au-dessus du décor */}
      <div className="relative z-20 w-full max-w-lg flex flex-col items-center gap-8">

        {/* Enveloppe kraft + tampon */}
        <div className="relative flex flex-col items-center">
          <svg viewBox="0 0 280 160" className="w-64 sm:w-72 drop-shadow-2xl" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.55))' }}>
            {/* Corps de l'enveloppe */}
            <rect x="4" y="24" width="272" height="132" rx="3" fill="#C4A96A" stroke="#8B6914" strokeWidth="2" />
            {/* Plis de l'enveloppe */}
            <line x1="4" y1="24" x2="140" y2="90" stroke="#8B6914" strokeWidth="1" opacity="0.5" />
            <line x1="276" y1="24" x2="140" y2="90" stroke="#8B6914" strokeWidth="1" opacity="0.5" />
            <line x1="4" y1="156" x2="140" y2="90" stroke="#8B6914" strokeWidth="1" opacity="0.35" />
            <line x1="276" y1="156" x2="140" y2="90" stroke="#8B6914" strokeWidth="1" opacity="0.35" />
            {/* Rabat supérieur */}
            <path d="M4 24 L140 0 L276 24 Z" fill="#B8973F" stroke="#8B6914" strokeWidth="1.5" />
          </svg>

          {/* Tampon OPERATION TURING sur l'enveloppe */}
          <div
            className="absolute font-marker text-center"
            style={{
              top: '52%', left: '50%',
              transform: 'translate(-50%, -50%) rotate(-6deg)',
              color: 'var(--stamp-red)',
              fontSize: 13,
              lineHeight: 1.2,
              opacity: 0.85,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              border: '2.5px solid var(--stamp-red)',
              padding: '4px 12px',
              whiteSpace: 'nowrap',
            }}
          >
            OPÉRATION<br />TURING
          </div>

          {/* Titre */}
          <h1
            className="font-stamp text-center mt-4"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              color: 'var(--lamp-orange-glow)',
              letterSpacing: '0.25em',
              textShadow: '0 0 40px rgba(232,149,74,0.5), 2px 2px 0 rgba(0,0,0,0.5)',
              lineHeight: 1,
            }}
          >
            TURING
          </h1>
          <p
            className="font-typewriter text-center mt-1"
            style={{ color: 'var(--paper-cream)', opacity: 0.55, fontSize: '0.7rem', letterSpacing: '0.15em' }}
          >
            PROTOCOLE D&apos;IDENTIFICATION — NIVEAU 3
          </p>
        </div>

        {/* Formulaire sur papier crème */}
        <div
          className="paper-surface w-full"
          style={{
            padding: '28px 28px 24px',
            transform: 'rotate(-0.5deg)',
            maxWidth: 420,
          }}
        >
          {/* En-tête formulaire */}
          <div className="font-stamp text-center mb-4 pb-3" style={{ borderBottom: '1px solid rgba(26,22,18,0.2)' }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(26,22,18,0.5)', letterSpacing: '0.12em' }}>
              FORMULAIRE D&apos;ENTRÉE — REF. 2847-B
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--ink-black)', letterSpacing: '0.08em' }}>
              IDENTIFICATION DU SUJET
            </div>
          </div>

          {/* Onglets Créer / Rejoindre */}
          <div className="flex mb-5" style={{ gap: 0, borderBottom: '2px solid rgba(26,22,18,0.15)' }}>
            {(['create', 'join'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="font-stamp flex-1 py-1.5 text-xs uppercase tracking-widest transition-all"
                style={{
                  background: mode === m ? 'var(--ink-black)' : 'transparent',
                  color: mode === m ? 'var(--paper-cream)' : 'rgba(26,22,18,0.45)',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                }}
              >
                {m === 'create' ? 'NOUVEAU DOSSIER' : 'DOSSIER EXISTANT'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <VintageInput
              label="Alias opérationnel"
              value={pseudo}
              onChange={setPseudo}
              placeholder="ex: AGENT-07"
              maxLength={20}
            />

            {mode === 'join' && (
              <VintageInput
                label="Code du dossier"
                value={code}
                onChange={v => setCode(v.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
              />
            )}

            {error && (
              <p
                className="font-marker text-center"
                style={{ color: 'var(--stamp-red)', fontSize: '0.8rem', transform: 'rotate(-1deg)', lineHeight: 1.3 }}
              >
                ⚠ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!connected || loading}
              className="btn-stamp w-full mt-1"
              style={{ fontSize: '0.9rem' }}
            >
              {!connected
                ? <Typewriter text="CONNEXION AU SERVEUR..." />
                : loading
                ? <Typewriter text="OUVERTURE DU DOSSIER..." />
                : mode === 'create'
                ? 'CRÉER LE DOSSIER'
                : 'ACCÉDER AU DOSSIER'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
