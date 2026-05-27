'use client';

import { useState, useEffect } from 'react';
import SimonGame from './SimonGame';
import MemoryDashboard from './MemoryDashboard';
import OnboardingForm from './OnboardingForm';
import TutorialPhase from './TutorialPhase';
import { useBluetoothCube } from '../contexts/BluetoothContext';
import { motion, AnimatePresence } from 'framer-motion';
import PasscodeModal from './PasscodeModal';

function CountdownPhase({ onComplete }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      const timer = setTimeout(() => onComplete(), 600);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#07080f]/95 text-white absolute inset-0 z-50">
      <div className="text-center flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.h1 
            key={count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className={`text-[12rem] font-black leading-none drop-shadow-[0_0_40px_rgba(168,85,247,0.5)] ${count === 0 ? 'text-green-400 drop-shadow-[0_0_40px_rgba(74,222,128,0.5)]' : 'text-purple-500'}`}
          >
            {count > 0 ? count : '¡YA!'}
          </motion.h1>
        </AnimatePresence>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white/5 border border-white/10 p-6 rounded-2xl max-w-lg w-full backdrop-blur-md shadow-2xl"
        >
          <p className="text-xs font-black text-white/50 uppercase tracking-[0.3em] mb-4">Preparación</p>
          <p className="text-xl sm:text-2xl font-bold leading-relaxed text-white/90">
            Prepárate... Observa atentamente el cubo y memoriza la secuencia de colores.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function StepMenu({ onNext, onHistory, playerName, setPlayerName }) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { isConnected } = useBluetoothCube();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-10 px-6 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <div className="relative flex flex-col items-center gap-3 sm:gap-4 scale-90 sm:scale-100">
        <span className="text-6xl sm:text-7xl drop-shadow-[0_0_30px_rgba(168,85,247,0.7)]">🧬</span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Memory{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
            Mirror
          </span>
        </h1>
        <p className="text-white/50 text-sm sm:text-lg max-w-[280px] sm:max-w-sm leading-relaxed">
          Evalúa tu memoria visoespacial de trabajo y precisión de movimiento guiado.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-4">
        <input 
          type="text"
          placeholder="Nombre del Paciente"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-center text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-semibold"
        />

        <div className="flex flex-col gap-3">
          <button
            onClick={onNext}
            disabled={!playerName.trim() || !acceptedTerms}
            className={`
              relative group px-10 py-5 rounded-2xl font-bold text-xl text-white
              transition-all duration-200 ease-out shadow-[0_0_40px_rgba(168,85,247,0.4)]
              ${(playerName.trim() && acceptedTerms)
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 active:scale-95 cursor-pointer' 
                : 'bg-white/10 text-white/40 cursor-not-allowed shadow-none'}
            `}
          >
            Iniciar Test
            <span className="ml-3 inline-block group-hover:translate-x-1 transition-transform">🚀</span>
          </button>

          <button
            onClick={onHistory}
            className="w-full py-4 rounded-2xl font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm uppercase tracking-widest border border-white/5 cursor-pointer"
          >
            📜 Ver Historial Clínico
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center max-w-sm mx-auto gap-3 text-left bg-white/5 border border-white/5 p-4 rounded-xl">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border border-white/20 bg-white/5 appearance-none checked:bg-purple-600 checked:border-purple-500 relative flex-shrink-0 transition-colors after:content-['✓'] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:text-white after:font-black after:text-[12px] after:opacity-0 checked:after:opacity-100"
            />
            <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
              Comprendo y Acepto
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

function StepHistory({ onBack, onOpenReport }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('cogniMirror_Memory_DB') || '[]');
    setHistory(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, []);

  const handleDownloadExcel = async () => {
    const { exportAllMemoryHistoryExcel } = await import('../utils/exportExcel');
    exportAllMemoryHistoryExcel(history);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 pt-20 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between w-full mb-8">
        <h2 className="text-3xl font-black text-white">Historial Memory Mirror</h2>
        <button onClick={handleDownloadExcel} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all flex items-center gap-2 cursor-pointer shadow-lg">
          📊 Exportar Todo (Excel)
        </button>
      </div>

      <div className="w-full space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {history.length === 0 ? (
          <p className="text-white/30 text-center py-20">No hay registros aún.</p>
        ) : (
          history.map(record => (
            <div 
              key={record.id}
              onClick={() => onOpenReport(record)}
              className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-white font-bold text-lg">{record.playerName}</p>
                <p className="text-white/40 text-xs">{new Date(record.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-purple-400 font-black text-xl">Corsi: {record.metrics?.corsiSpan || 0}</p>
                <p className="text-[10px] text-white/20 uppercase tracking-widest font-black group-hover:text-white/60 transition-colors">Ver Detalles →</p>
              </div>
            </div>
          ))
        )}
      </div>

      <button onClick={onBack} className="mt-8 text-white/40 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs cursor-pointer">
        ← Volver al Menú
      </button>
    </div>
  );
}

export default function MemoryGameView({ onExit }) {
  const [step, setStep] = useState('menu');
  const [playerName, setPlayerName] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [sessionMeta, setSessionMeta] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Seguridad Modo Kiosco
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const [onPasscodeSuccess, setOnPasscodeSuccess] = useState(() => () => {});

  const triggerSecurity = (action) => {
    setOnPasscodeSuccess(() => action);
    setIsPasscodeOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#07080f] overflow-hidden font-sans">
      <button
        onClick={() => {
          if (step === 'view_report') {
            setStep('history');
          } else {
            triggerSecurity(onExit);
          }
        }}
        className="absolute top-5 left-5 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-white/80 text-sm hover:bg-white/5 transition-all duration-150 no-print cursor-pointer"
      >
        ← Volver
      </button>

      {step === 'menu' && (
        <StepMenu 
          onNext={() => {
            setSessionStartTime(Date.now());
            setStep('tutorial');
          }} 
          onHistory={() => setStep('history')}
          playerName={playerName} 
          setPlayerName={setPlayerName} 
        />
      )}

      {step === 'history' && (
        <StepHistory 
          onBack={() => triggerSecurity(() => setStep('menu'))} 
          onOpenReport={(record) => {
            setSelectedRecord(record);
            setStep('view_report');
          }} 
        />
      )}

      {step === 'view_report' && selectedRecord && (
        <MemoryDashboard
          record={selectedRecord}
          onRestart={() => triggerSecurity(() => setStep('menu'))}
          onExit={() => triggerSecurity(() => setStep('history'))}
        />
      )}

      {step === 'tutorial' && (
        <TutorialPhase onCompleteTutorial={() => setStep('questions')} />
      )}
      
      {step === 'questions' && (
        <OnboardingForm 
          playerName={playerName} 
          onComplete={(data) => { 
            setSessionMeta(data); 
            setStep('countdown'); 
          }} 
        />
      )}

      {step === 'countdown' && (
        <CountdownPhase onComplete={() => setStep('playing')} />
      )}

      {step === 'playing' && (
        <SimonGame
          playerName={playerName}
          sessionMeta={sessionMeta}
          sessionStartTime={sessionStartTime}
          onExit={(record) => { 
            if (record) {
              setSelectedRecord(record);
              setStep('view_report');
            } else {
              setStep('menu'); 
              setPlayerName(''); 
              setSessionMeta(null);
            }
          }}
        />
      )}

      {/* Modal de Kiosco */}
      <PasscodeModal
        isOpen={isPasscodeOpen}
        onClose={() => setIsPasscodeOpen(false)}
        onVerify={onPasscodeSuccess}
      />
    </div>
  );
}
