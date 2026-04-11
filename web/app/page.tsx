'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';

export default function Home() {
  const router = useRouter();
  const { socket, connected } = useSocket();
  const [pseudo, setPseudo] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [error, setError] = useState('');

  useEffect(() => {
    function onRoomEntered({ code }: { code: string }) {
      router.push(`/room/${code}`);
    }
    function onError({ message }: { message: string }) {
      setError(message);
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
    if (!pseudo.trim()) { setError('Entre ton pseudo'); return; }
    if (mode === 'create') {
      socket.emit('room:create', { pseudo: pseudo.trim() });
    } else {
      if (!code.trim()) { setError('Entre le code de la salle'); return; }
      socket.emit('room:join', { pseudo: pseudo.trim(), code: code.trim().toUpperCase() });
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-sm px-6">
        <h1 className="text-5xl font-bold tracking-widest text-center mb-2">TURING</h1>
        <p className="text-gray-400 text-sm text-center mb-8">
          Démasquez le Robot. Démasquez le Traître.
        </p>

        <div className="flex gap-2 mb-6">
          <button
            className={`flex-1 py-2 rounded ${mode === 'create' ? 'bg-white text-black font-bold' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setMode('create')}
          >
            Créer
          </button>
          <button
            className={`flex-1 py-2 rounded ${mode === 'join' ? 'bg-white text-black font-bold' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setMode('join')}
          >
            Rejoindre
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white"
            placeholder="Ton pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            maxLength={20}
            autoFocus
          />
          {mode === 'join' && (
            <input
              className="bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white uppercase placeholder-gray-500 focus:outline-none focus:border-white tracking-widest"
              placeholder="Code de la salle"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
          )}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={!connected}
            className="bg-white text-black font-bold py-3 rounded mt-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition"
          >
            {!connected ? 'Connexion...' : mode === 'create' ? 'Créer la salle' : 'Rejoindre'}
          </button>
        </form>
      </div>
    </main>
  );
}
