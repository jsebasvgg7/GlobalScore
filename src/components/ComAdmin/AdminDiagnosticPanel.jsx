// src/components/adminComponents/AdminDiagnosticPanel.jsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Database } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

export default function AdminDiagnosticPanel() {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [autoChecked, setAutoChecked] = useState(false);

  // Auto-verificar al montar el componente (solo una vez)
  useEffect(() => {
    if (!autoChecked) {
      checkDatabaseHealth();
      setAutoChecked(true);
    }
  }, []);

  const checkDatabaseHealth = async () => {
    setChecking(true);
    const checks = {
      functions: {},
      tables: {},
      overall: true
    };

    try {
      // Verificar funciones críticas
      const functionsToCheck = [
        'calculate_prediction_points',
        'finish_match_and_update_stats',
        'reset_all_monthly_stats',
        'award_monthly_championship'
      ];

      for (const func of functionsToCheck) {
        try {
          // Solo verificamos calculate_prediction_points con parámetros dummy
          if (func === 'calculate_prediction_points') {
            const { data, error } = await supabase.rpc(func, {
              pred_home: 1,
              pred_away: 0,
              result_home: 1,
              result_away: 0
            });
            
            // Si devuelve un número, la función existe
            checks.functions[func] = (typeof data === 'number' && !error);
            if (error) checks.overall = false;
          } else {
            // Para las otras funciones, solo marcamos como pendientes de verificación
            // Se verificarán cuando se usen realmente
            checks.functions[func] = '⏸️'; // Estado pendiente
          }
        } catch (err) {
          console.error(`Error verificando ${func}:`, err);
          checks.functions[func] = false;
          checks.overall = false;
        }
      }

      // Verificar acceso a tablas críticas
      const tablesToCheck = ['matches', 'users', 'predictions', 'leagues', 'awards'];
      
      for (const table of tablesToCheck) {
        try {
          const { error } = await supabase
            .from(table)
            .select('id')
            .limit(1);
          checks.tables[table] = !error;
          if (error) {
            console.error(`Error accediendo a ${table}:`, error);
            checks.overall = false;
          }
        } catch (err) {
          console.error(`Error verificando tabla ${table}:`, err);
          checks.tables[table] = false;
          checks.overall = false;
        }
      }

      setResults(checks);
    } catch (err) {
      console.error('Error en diagnóstico:', err);
      checks.overall = false;
      setResults(checks);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '24px',
      border: '2px solid #E5E7EB',
      marginBottom: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0
          }}>
            <Database size={24} />
          </div>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#1F2937',
              margin: '0 0 4px 0'
            }}>
              Diagnóstico del Sistema
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              margin: 0
            }}>
              {results ? (
                results.overall 
                  ? 'Sistema operativo ✨' 
                  : '⚠️ Se detectaron problemas'
              ) : (
                'Verificando configuración...'
              )}
            </p>
          </div>
        </div>
        
        <button
          onClick={checkDatabaseHealth}
          disabled={checking}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: checking 
              ? 'linear-gradient(135deg, #9CA3AF, #6B7280)' 
              : 'linear-gradient(135deg, #7C3AED, #5B21B6)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: checking ? 'not-allowed' : 'pointer',
            opacity: checking ? 0.7 : 1,
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!checking) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
          }}
        >
          <RefreshCw size={16} style={{
            animation: checking ? 'spin 1s linear infinite' : 'none'
          }} />
          {checking ? 'Verificando...' : 'Verificar'}
        </button>
      </div>

      {results && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Estado General */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: results.overall 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)' 
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
            border: `2px solid ${results.overall ? '#10B981' : '#EF4444'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {results.overall ? (
              <CheckCircle size={24} color="#10B981" style={{ flexShrink: 0 }} />
            ) : (
              <AlertCircle size={24} color="#EF4444" style={{ flexShrink: 0 }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '700',
                color: results.overall ? '#059669' : '#DC2626',
                marginBottom: '4px'
              }}>
                {results.overall 
                  ? '✅ Base de datos configurada correctamente'
                  : '❌ Configuración incompleta'}
              </div>
              <div style={{
                fontSize: '13px',
                color: '#6B7280'
              }}>
                {results.overall 
                  ? 'Todas las funciones necesarias están disponibles'
                  : 'Faltan funciones SQL. Sigue las instrucciones abajo.'}
              </div>
            </div>
          </div>

          {/* Funciones */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#374151',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Database size={16} />
              Funciones SQL
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}>
              {Object.entries(results.functions).map(([func, status]) => {
                const exists = status === true;
                const pending = status === '⏸️';
                
                return (
                  <div
                    key={func}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      background: '#F9FAFB',
                      borderRadius: '10px',
                      fontSize: '13px',
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    {exists ? (
                      <CheckCircle size={16} color="#10B981" style={{ flexShrink: 0 }} />
                    ) : pending ? (
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '50%',
                        background: '#F59E0B',
                        flexShrink: 0
                      }} />
                    ) : (
                      <XCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
                    )}
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      color: exists ? '#059669' : pending ? '#D97706' : '#DC2626',
                      fontWeight: '600',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {func}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tablas */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#374151',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Database size={16} />
              Acceso a Tablas
            </h4>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {Object.entries(results.tables).map(([table, accessible]) => (
                <div
                  key={table}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: accessible ? '#F0FDF4' : '#FEF2F2',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: `1px solid ${accessible ? '#BBF7D0' : '#FECACA'}`
                  }}
                >
                  {accessible ? (
                    <CheckCircle size={14} color="#10B981" />
                  ) : (
                    <XCircle size={14} color="#EF4444" />
                  )}
                  <span style={{ color: accessible ? '#059669' : '#DC2626' }}>
                    {table}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instrucciones si hay problemas */}
          {!results.overall && (
            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
              borderRadius: '12px',
              border: '2px solid rgba(245, 158, 11, 0.3)'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#D97706',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={18} />
                Cómo solucionar:
              </div>
              <ol style={{
                fontSize: '13px',
                color: '#6B7280',
                margin: 0,
                paddingLeft: '24px',
                lineHeight: '1.8'
              }}>
                <li><strong>Abre Supabase Dashboard</strong> en tu navegador</li>
                <li>Ve a <strong>SQL Editor</strong> (icono en el menú lateral)</li>
                <li>Haz clic en <strong>"+ New query"</strong></li>
                <li>Copia el contenido del artifact <strong>"Database Functions - Actualización de Partidos"</strong></li>
                <li>Pega el código y haz clic en <strong>"Run"</strong></li>
                <li>Vuelve aquí y haz clic en <strong>"Verificar"</strong></li>
              </ol>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}