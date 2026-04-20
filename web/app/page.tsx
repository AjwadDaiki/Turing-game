'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import DeskDecor from '@/components/DeskDecor';

export default function Home() {
  const router = useRouter();
  const { socket, connected } = useSocket();
  const [pseudo, setPseudo] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onRoomCreated({ code }: { code: string }) {
      router.push(`/room/${code}`);
    }
    function onRoomJoined({ code }: { code: string }) {
      router.push(`/room/${code}`);
    }
    function onError({ message }: { message: string }) {
      setError(message);
      setLoading(false);
    }
    socket.on('room:created', onRoomCreated);
    socket.on('room:joined', onRoomJoined);
    socket.on('error', onError);
    return () => {
      socket.off('room:created', onRoomCreated);
      socket.off('room:joined', onRoomJoined);
      socket.off('error', onError);
    };
  }, [socket, router]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!pseudo.trim()) { setError('ENTREZ VOTRE ALIAS'); return; }
    setLoading(true);
    socket.emit('room:create', { pseudo: pseudo.trim() });
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!pseudo.trim()) { setError('ENTREZ VOTRE ALIAS'); return; }
    if (!code.trim()) { setError('ENTREZ LE CODE'); return; }
    setLoading(true);
    socket.emit('room:join', { pseudo: pseudo.trim(), code: code.trim().toUpperCase() });
  }

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <DeskDecor />

      <div className="relative z-20 w-full max-w-md flex flex-col items-center gap-6">

        {/* Titre */}
        <div className="text-center">
          <h1
            className="font-stamp"
            style={{
              fontSize: 'clamp(2.8rem, 9vw, 4.5rem)',
              color: 'var(--lamp-orange-glow)',
              letterSpacing: '0.3em',
              textShadow: '0 0 60px rgba(232,149,74,0.65), 0 0 100px rgba(232,149,74,0.25), 2px 2px 4px rgba(0,0,0,0.6)',
              animation: 'title-glow 4s ease-in-out infinite',
              lineHeight: 1,
            }}
          >
            TURING
          </h1>
          <p
            className="font-typewriter mt-2"
            style={{ color: 'var(--paper-cream)', opacity: 0.45, fontSize: '0.6rem', letterSpacing: '0.12em' }}
          >
            DÉMASQUEZ LE ROBOT ET SON COMPLICE
          </p>
        </div>

        {/* Formulaire principal */}
        <div
          className="paper-surface w-full"
          style={{ padding: '24px 24px 20px', transform: 'rotate(-0.3deg)' }}
        >
          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {(['create', 'join'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`font-stamp flex-1 py-2 text-xs uppercase tracking-widest ${mode === m ? 'btn-stamp' : ''}`}
                style={mode !== m ? {
                  background: 'transparent',
                  color: 'rgba(26,22,18,0.4)',
                  border: '1.5px solid rgba(26,22,18,0.15)',
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                  padding: '8px 12px',
                } : {}}
              >
                {m === 'create' ? 'CRÉER' : 'REJOINDRE'}
              </button>
            ))}
          </div>

          {/* Mode CRÉER */}
          {mode === 'create' && (
            <form onSubmit={handleCreate} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label
                  className="font-stamp text-xs uppercase tracking-widest"
                  style={{ color: 'var(--ink-black)', opacity: 0.55, fontSize: '0.5rem' }}
                >
                  Votre alias
                </label>
                <input
                  className="field-line"
                  style={{ fontSize: '1.1rem', letterSpacing: '0.06em' }}
                  value={pseudo}
                  onChange={e => setPseudo(e.target.value)}
                  placeholder="ex: AGENT-07"
                  maxLength={20}
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  disabled={loading}
                />
              </div>

              {error && (
                <div style={{ animation: 'error-shake 0.4s ease-out' }}>
                  <p className="font-marker text-center" style={{ color: 'var(--stamp-red)', fontSize: '0.75rem' }}>
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={!connected || loading}
                className="btn-stamp w-full"
                style={{ fontSize: '0.9rem' }}
              >
                {!connected ? 'CONNEXION...' : loading ? 'CRÉATION...' : 'CRÉER UNE SALLE'}
              </button>

              <p
                className="font-typewriter text-center"
                style={{ fontSize: '0.55rem', color: 'rgba(26,22,18,0.35)', lineHeight: 1.5 }}
              >
                Un lien sera généré pour inviter vos agents.
              </p>
            </form>
          )}

          {/* Mode REJOINDRE */}
          {mode === 'join' && (
            <form onSubmit={handleJoin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label
                  className="font-stamp text-xs uppercase tracking-widest"
                  style={{ color: 'var(--ink-black)', opacity: 0.55, fontSize: '0.5rem' }}
                >
                  Votre alias
                </label>
                <input
                  className="field-line"
                  style={{ fontSize: '1.1rem', letterSpacing: '0.06em' }}
                  value={pseudo}
                  onChange={e => setPseudo(e.target.value)}
                  placeholder="ex: AGENT-07"
                  maxLength={20}
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  className="font-stamp text-xs uppercase tracking-widest"
                  style={{ color: 'var(--ink-black)', opacity: 0.55, fontSize: '0.5rem' }}
                >
                  Code de la salle
                </label>
                <input
                  className="field-line text-center"
                  style={{ fontSize: '1.6rem', letterSpacing: '0.35em', fontFamily: 'var(--font-stamp)' }}
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="_ _ _ _ _ _"
                  maxLength={6}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={loading}
                />
              </div>

              {error && (
                <div style={{ animation: 'error-shake 0.4s ease-out' }}>
                  <p className="font-marker text-center" style={{ color: 'var(--stamp-red)', fontSize: '0.75rem' }}>
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={!connected || loading}
                className="btn-stamp w-full"
                style={{ fontSize: '0.9rem' }}
              >
                {!connected ? 'CONNEXION...' : loading ? 'ACCÈS...' : 'REJOINDRE'}
              </button>

              <p
                className="font-typewriter text-center"
                style={{ fontSize: '0.55rem', color: 'rgba(26,22,18,0.35)', lineHeight: 1.5 }}
              >
                Ou demandez le lien direct au chef d&apos;opération.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
