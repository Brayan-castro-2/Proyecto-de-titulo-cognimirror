'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePatientsDB } from '../../../hooks/usePatientsDB';
import PatientEvolutionDashboard from '../../../components/PatientEvolutionDashboard';
import ReactionDashboard from '../../../components/ReactionDashboard';
import { ArrowLeft, Activity, Brain, Calendar, Clock, ChevronRight, TrendingUp } from 'lucide-react';

export default function PatientProfileDashboard() {
  const params = useParams();
  const router = useRouter();
  const { getPatient } = usePatientsDB();
  const patient = getPatient(params.id);

  const [activeTab, setActiveTab] = useState('reaction');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLabel, setFilterLabel] = useState('All');
  
  const [selectedSessionRecord, setSelectedSessionRecord] = useState(null);

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#07080f] text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Paciente no encontrado</h2>
        <button onClick={() => router.push('/patients')} className="px-6 py-2 bg-indigo-600 rounded-xl">Volver al Directorio</button>
      </div>
    );
  }

  // 1. Filtrar sesiones según la pestaña activa (Reaction vs Memory)
  const tabSessions = patient.sessions.filter(s => (s.testType || 'reaction') === activeTab);

  // 2. Aplicar búsqueda y filtros adicionales en el historial
  const filteredHistory = tabSessions.filter(s => {
    const matchLabel = filterLabel === 'All' || s.clinicalLabel.includes(filterLabel);
    const matchSearch = s.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        new Date(s.date).toLocaleDateString().includes(searchTerm);
    return matchLabel && matchSearch;
  }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Más recientes primero

  // Pseudo-paciente inyectado para que el EvolutionDashboard evalúe solo el test actual
  const patientForEvolution = {
    ...patient,
    sessions: tabSessions
  };

  return (
    <div className="min-h-screen bg-[#07080f] text-slate-200 font-sans pb-20">
      
      {/* Header Superior */}
      <div className="bg-[#13161e] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button onClick={() => router.push('/patients')} className="flex items-center gap-2 text-white/40 hover:text-indigo-400 text-sm mb-3 transition-colors">
              <ArrowLeft size={16} /> Volver al Directorio
            </button>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              {patient.name}
            </h1>
            <p className="text-slate-400 mt-1">
              Registrado el: {new Date(patient.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* TABS (Reaction vs Memory) */}
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 w-fit">
            <button 
              onClick={() => setActiveTab('reaction')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'reaction' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Activity size={18} /> Reaction Mirror
            </button>
            <button 
              onClick={() => setActiveTab('memory')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'memory' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Brain size={18} /> Memory Mirror
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-10">
        
        {/* ÁREA SUPERIOR: GRÁFICOS GENERALES (PatientEvolutionDashboard embebido) */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className={activeTab === 'reaction' ? 'text-indigo-400' : 'text-purple-400'} /> 
            Evolución Longitudinal
          </h2>
          <div className="overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-3xl border border-white/10">
            <PatientEvolutionDashboard 
              patient={patientForEvolution} 
              hideHeader={true} 
            />
          </div>
        </section>

        {/* ÁREA INFERIOR: HISTORIAL Y AUDITORÍA DE SESIONES */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock size={20} className="text-slate-400" /> Historial de Sesiones
            </h2>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Buscar por ID o Fecha..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#13161e] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-64"
              />
              <select 
                value={filterLabel}
                onChange={(e) => setFilterLabel(e.target.value)}
                className="bg-[#13161e] border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">Todas las etiquetas</option>
                <option value="Línea Base">Línea Base</option>
                <option value="Seguimiento">Seguimiento</option>
                <option value="Familiarización">Familiarización</option>
              </select>
            </div>
          </div>

          <div className="bg-[#13161e] rounded-3xl border border-white/10 overflow-hidden">
            {filteredHistory.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No se encontraron sesiones que coincidan con la búsqueda.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-semibold">Intento</th>
                    <th className="px-6 py-4 font-semibold">Etiqueta Clínica</th>
                    <th className="px-6 py-4 font-semibold">Fecha y Hora</th>
                    <th className="px-6 py-4 font-semibold">Promedio (ms)</th>
                    <th className="px-6 py-4 font-semibold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredHistory.map(session => (
                    <tr 
                      key={session.sessionId} 
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => setSelectedSessionRecord(session)}
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-white">Intento {session.attemptNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                          session.clinicalLabel.includes('Base') ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                          session.clinicalLabel.includes('Seguimiento') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {session.clinicalLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(session.date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-mono">
                          {session.stats?.averageReactionTime || Math.round((session.stats?.tiempo_promedio_por_mano?.L + session.stats?.tiempo_promedio_por_mano?.R) / 2) || '-'} ms
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver Radiografía <ChevronRight size={14} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {/* MODAL: Radiografía del Turno (ReactionDashboard) */}
      {selectedSessionRecord && (
        <div className="fixed inset-0 z-50 bg-[#07080f] overflow-y-auto">
          {/* ReactionDashboard normalmente espera estar en full screen y maneja sus propios estilos */}
          {activeTab === 'reaction' ? (
            <ReactionDashboard
              playerName={patient.name}
              date={selectedSessionRecord.date}
              rawTurnsData={selectedSessionRecord.rawTurnsData}
              latencyOffset={selectedSessionRecord.stats?.latencyOffset || 0}
              onExit={() => setSelectedSessionRecord(null)}
              recordId={selectedSessionRecord.sessionId}
              attemptNumber={selectedSessionRecord.attemptNumber}
              clinicalLabel={selectedSessionRecord.clinicalLabel}
              patient={patient}
            />
          ) : (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
              <Brain size={64} className="text-purple-500 mb-6 opacity-50" />
              <h2 className="text-2xl font-bold text-white mb-2">Memory Mirror Dashboard</h2>
              <p className="text-slate-400 mb-8 max-w-md text-center">El panel de radiografía detallada para Memory Mirror estará disponible próximamente en la siguiente iteración.</p>
              <button 
                onClick={() => setSelectedSessionRecord(null)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors"
              >
                Cerrar Modal
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
