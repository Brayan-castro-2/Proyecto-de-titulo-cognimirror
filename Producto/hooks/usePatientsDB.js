import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

export function usePatientsDB() {
  const [patients, setPatients] = useState([]);
  const [activePatientId, setActivePatientId] = useState(null);

  const fetchPatients = useCallback(async () => {
    try {
      const { data: pacientesData, error: errPacientes } = await supabase
        .from('pacientes')
        .select('*')
        .order('creado_en', { ascending: false });

      if (errPacientes) throw errPacientes;

      const { data: sesionesData, error: errSesiones } = await supabase
        .from('sesiones_clinicas')
        .select('*')
        .order('fecha_sesion', { ascending: true });
        
      if (errSesiones) throw errSesiones;

      const mapPatients = pacientesData.map(p => ({
        id: p.id,
        name: `${p.nombre} ${p.apellido}`.trim(),
        createdAt: p.creado_en,
        sessions: sesionesData
          .filter(s => s.id_paciente === p.id)
          .map(s => ({
            sessionId: s.id,
            testType: s.tipo_test,
            attemptNumber: s.intento_numero,
            clinicalLabel: s.etiqueta_clinica,
            date: s.fecha_sesion,
            stats: s.estadisticas_json
          }))
      }));

      setPatients(mapPatients);
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const createPatient = useCallback(async (name) => {
    try {
      const partes = name.trim().split(' ');
      const nombre = partes[0];
      const apellido = partes.length > 1 ? partes.slice(1).join(' ') : '';

      const { data, error } = await supabase
        .from('pacientes')
        .insert([{ nombre, apellido }])
        .select()
        .single();

      if (error) throw error;

      const newPatient = {
        id: data.id,
        name: `${data.nombre} ${data.apellido}`.trim(),
        createdAt: data.creado_en,
        sessions: []
      };

      setPatients(prev => [newPatient, ...prev]);
      return newPatient;
    } catch (error) {
      console.error('Error creating patient:', error);
      return null;
    }
  }, []);

  const addSession = useCallback(async (patientId, sessionData) => {
    try {
      const patientIndex = patients.findIndex(p => p.id === patientId);
      if (patientIndex === -1) return null;
      const patient = patients[patientIndex];

      const testType = sessionData.testType || 'reaction';
      const testTypeSessions = patient.sessions.filter(s => (s.testType || 'reaction') === testType);
      const attemptNumber = testTypeSessions.length + 1;
      
      let label = 'Seguimiento';
      if (attemptNumber === 1) label = 'Ensayo / Familiarización';
      else if (attemptNumber === 2) label = 'Línea Base';
      else label = 'Evaluación de Seguimiento';

      const { data: sessionInfo, error: sessionErr } = await supabase
        .from('sesiones_clinicas')
        .insert([{
          id_paciente: patientId,
          tipo_test: testType,
          intento_numero: attemptNumber,
          etiqueta_clinica: label,
          estadisticas_json: sessionData.metrics || {}
        }])
        .select()
        .single();

      if (sessionErr) throw sessionErr;

      const newSession = {
        sessionId: sessionInfo.id,
        testType,
        attemptNumber,
        clinicalLabel: label,
        date: sessionInfo.fecha_sesion,
        stats: sessionInfo.estadisticas_json
      };

      if (sessionData.telemetry && sessionData.telemetry.length > 0) {
        if (testType === 'reaction') {
          const rows = sessionData.telemetry.map(t => ({
            id_sesion: sessionInfo.id,
            nivel: t.level || 0,
            tiempo_reaccion_ms: t.latencyMs,
            cara_esperada: t.expectedFace,
            cara_girada: t.userFace,
            es_correcto: t.isCorrect,
            timestamp_local: new Date(t.timestamp || Date.now()).toISOString()
          }));
          await supabase.from('resultados_juego_reaccion').insert(rows);
        } else if (testType === 'memory') {
          const rows = sessionData.telemetry.map(t => ({
            id_sesion: sessionInfo.id,
            nivel: t.level || 0,
            intento: t.trial || 'A',
            cara_esperada: t.expectedFace,
            cara_girada: t.userFace,
            es_correcto: t.isCorrect,
            latencia_ms: t.latencyMs,
            array_latencias_intra: t.moveLatencies || null,
            tipo_error: t.errorType || null,
            timestamp_local: new Date(t.timestamp || Date.now()).toISOString()
          }));
          await supabase.from('resultados_juego_memoria').insert(rows);
        }
      }

      setPatients(prev => {
        const newData = [...prev];
        newData[patientIndex].sessions.push(newSession);
        return newData;
      });

      return newSession;
    } catch (error) {
      console.error('Error adding session:', error);
      return null;
    }
  }, [patients]);

  const deletePatient = useCallback(async (patientId) => {
    try {
      await supabase.from('pacientes').delete().eq('id', patientId);
      setPatients(prev => prev.filter(p => p.id !== patientId));
      if (activePatientId === patientId) setActivePatientId(null);
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  }, [activePatientId]);

  const deleteSession = useCallback(async (patientId, sessionId) => {
    try {
      await supabase.from('sesiones_clinicas').delete().eq('id', sessionId);
      await fetchPatients();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }, [fetchPatients]);

  const getPatient = useCallback((id) => {
    return patients.find(p => p.id === id);
  }, [patients]);

  return {
    patients,
    activePatientId,
    setActivePatientId,
    createPatient,
    addSession,
    deletePatient,
    deleteSession,
    getPatient,
    refreshData: fetchPatients
  };
}
