'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ReactionGameView from '../../components/ReactionGameView';

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId');
  const etiquetaEstudio = searchParams.get('etiquetaEstudio');
  const warmup = searchParams.get('warmup') === 'true';

  return (
    <ReactionGameView 
      onExit={() => router.push('/dashboard')} 
      subjectId={subjectId}
      etiquetaEstudio={etiquetaEstudio}
      isWarmupUrl={warmup}
    />
  );
}

export default function ReactionGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07080f] flex items-center justify-center">
        <div className="text-white/45 text-sm font-semibold tracking-widest animate-pulse">
          Iniciando Módulo de Juego...
        </div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
