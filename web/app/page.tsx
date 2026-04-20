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
  return <span className={className}>{displayed}<span className="animate-blink">|</span></span>;
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
        className="field-line"
        style={{ fontSize: '1.1rem', letterSpacing: '0.06em' }}
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

  /* Rotation déterministe du dossier basée sur le jour */
  const dossierRot = ((new Date().getDate() * 7) % 5) - 2; // -2 à +2 deg

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <DeskDecor />

      <div className="relative z-20 w-full max-w-lg flex flex-col items-center gap-6">

        {/* Dossier kraft avec tampon */}
        <div
          className="relative"
          style={{ transform: `rotate(${dossierRot * 0.5}deg)` }}
        >
          {/* Le dossier lui-même */}
          <div
            style={{
              width: 280,
              height: 160,
              background: 'linear-gradient(175deg, #C4A66A 0%, #B89850 40%, #A88A40 100%)',
              border: '1px solid rgba(139, 105, 20, 0.5)',
              boxShadow:
                '0 2px 4px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(220,190,130,0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Texture grain sur le kraft */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(100,70,20,0.04) 4px, rgba(100,70,20,0.04) 5px)',
                pointerEvents: 'none',
              }}
            />
            {/* Onglet en haut */}
            <div
              style={{
                position: 'absolute',
                top: -1,
                right: 30,
                width: 60,
                height: 18,
                background: '#B89850',
                borderBottom: '1px solid rgba(139,105,20,0.4)',
                borderLeft: '1px solid rgba(139,105,20,0.3)',
                borderRight: '1px solid rgba(139,105,20,0.3)',
                borderRadius: '0 0 3px 3px',
              }}
            />
            {/* Label dossier */}
            <div
              className="font-stamp text-center"
              style={{
                position: 'absolute',
                top: 24,
                left: 0,
                right: 0,
                fontSize: '0.55rem',
                letterSpacing: '0.12em',
                color: 'rgba(60,40,10,0.6)',
              }}
            >
              DOSSIER CLASSIFIÉ — NIVEAU 3
            </div>
            {/* Tampon OPÉRATION TURING */}
            <div
              className="stamp-mark font-marker"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-6deg)',
                fontSize: '0.85rem',
                lineHeight: 1.3,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              OPÉRATION<br />TURING
            </div>
            {/* Mention confidentiel en bas */}
            <div
              className="font-stamp"
              style={{
                position: 'absolute',
                bottom: 10,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontSize: '0.45rem',
                color: 'rgba(60,40,10,0.4)',
                letterSpacing: '0.15em',
              }}
            >
              CONFIDENTIEL — NE PAS REPRODUIRE
            </div>
          </div>
        </div>

        {/* Titre */}
        <div className="text-center">
          <h1
            className="font-stamp"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              color: 'var(--lamp-orange-glow)',
              letterSpacing: '0.25em',
              textShadow: '0 0 60px rgba(232,149,74,0.65), 0 0 100px rgba(232,149,74,0.25), 2px 2px 4px rgba(0,0,0,0.6)',
              animation: 'title-glow 4s ease-in-out infinite',
              lineHeight: 1,
            }}
          >
            TURING
          </h1>
          <p
            className="font-typewriter mt-1"
            style={{ color: 'var(--paper-cream)', opacity: 0.5, fontSize: '0.65rem', letterSpacing: '0.12em' }}
          >
            PROTOCOLE D&apos;IDENTIFICATION — NIVEAU 3
          </p>
        </div>

        {/* Formulaire sur papier crème */}
        <div
          className="paper-surface w-full"
          style={{
            padding: '24px 24px 20px',
            transform: 'rotate(-0.3deg)',
            maxWidth: 420,
          }}
        >
          {/* En-tête formulaire */}
          <div className="font-stamp text-center mb-4 pb-3" style={{ borderBottom: '1px solid rgba(26,22,18,0.2)' }}>
            <div style={{ fontSize: '0.55rem', color: 'rgba(26,22,18,0.45)', letterSpacing: '0.12em' }}>
              FORMULAIRE D&apos;ENTRÉE — REF. 2847-B
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--ink-black)', letterSpacing: '0.08em', marginTop: 2 }}>
              IDENTIFICATION DU SUJET
            </div>
          </div>

          {/* Boutons tabs — style tampon */}
          <div className="flex mb-5 gap-2">
            {(['create', 'join'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`font-stamp flex-1 py-2 text-xs uppercase tracking-widest ${mode === m ? 'btn-stamp' : ''}`}
                style={{
                  ...(mode !== m ? {
                    background: 'transparent',
                    color: 'rgba(26,22,18,0.4)',
                    border: '1.5px solid rgba(26,22,18,0.15)',
                    cursor: 'pointer',
                    letterSpacing: '0.08em',
                    padding: '8px 12px',
                  } : {}),
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
              <div style={{ animation: 'error-shake 0.4s ease-out' }}>
                <p
                  className="font-marker text-center"
                  style={{ color: 'var(--stamp-red)', fontSize: '0.8rem', transform: 'rotate(-1deg)', lineHeight: 1.3 }}
                >
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!connected || loading}
              className="btn-stamp w-full mt-1"
              style={{ fontSize: '0.85rem' }}
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
