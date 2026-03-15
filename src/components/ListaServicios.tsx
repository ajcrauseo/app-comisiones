'use client';

import { useState } from 'react';
import { Servicio } from '@/lib/db';
import { deleteServicio } from '@/lib/actions';
import { Trash2, AlertCircle, X, Receipt, Wallet, Hash } from 'lucide-react';

export function ResumenMes({ servicios }: { servicios: Servicio[] }) {
  const totalFacturado = servicios.reduce((acc, s) => acc + Number(s.monto), 0);
  const totalComisiones = servicios.reduce((acc, s) => acc + Number(s.comision), 0);

  return (
    <div className="summary-grid">
      <div className="card stat-card">
        <div className="stat-label">Total Facturado</div>
        <div className="stat-value">${totalFacturado.toLocaleString('es-AR')}</div>
      </div>
      <div className="card stat-card" style={{ borderLeftColor: 'var(--success)' }}>
        <div className="stat-label">Comisiones</div>
        <div className="stat-value text-success">
          ${totalComisiones.toLocaleString('es-AR')}
        </div>
      </div>
      <div className="card stat-card" style={{ borderLeftColor: 'var(--secondary)' }}>
        <div className="stat-label">Servicios</div>
        <div className="stat-value">{servicios.length}</div>
      </div>
    </div>
  );
}

interface GrupoDia {
  fecha: string;
  servicios: Servicio[];
  totalMonto: number;
  totalComision: number;
}

export function ListaServicios({ servicios }: { servicios: Servicio[] }) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isPending, setIsPending] = useState(false);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsPending(true);
    await deleteServicio(deletingId);
    setIsPending(false);
    setDeletingId(null);
  };

  if (servicios.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--secondary)' }}>No hay servicios registrados para este periodo.</p>
      </div>
    );
  }

  // Agrupar servicios por fecha
  const grupos = servicios.reduce((acc: GrupoDia[], s) => {
    // Normalizar fecha para agrupar (YYYY-MM-DD)
    const dateObj = typeof s.fecha === 'string' ? new Date(s.fecha + 'T12:00:00') : new Date(s.fecha);
    const dateStr = dateObj.toISOString().split('T')[0];

    const grupoExistente = acc.find(g => g.fecha === dateStr);
    if (grupoExistente) {
      grupoExistente.servicios.push(s);
      grupoExistente.totalMonto += Number(s.monto);
      grupoExistente.totalComision += Number(s.comision);
    } else {
      acc.push({
        fecha: dateStr,
        servicios: [s],
        totalMonto: Number(s.monto),
        totalComision: Number(s.comision)
      });
    }
    return acc;
  }, []);

  // Ordenar grupos por fecha (descendente)
  grupos.sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <>
      {/* Mobile Cards View */}
      <div className="mobile-cards">
        {grupos.map((grupo) => {
          const dateObj = new Date(grupo.fecha + 'T12:00:00');
          const dayName = dateObj.toLocaleDateString('es-AR', { weekday: 'long' });
          const dayNumber = dateObj.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

          return (
            <div key={`group-mobile-${grupo.fecha}`} className="day-group">
              <div className="day-header">
                <div className="day-title">
                  {dayName}, {dayNumber}
                </div>
                <div className="day-totals">
                  <div className="day-total-item">
                    <span className="day-total-label">Fact.</span>
                    <span className="day-total-value">${grupo.totalMonto.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="day-total-item">
                    <span className="day-total-label text-success">Com.</span>
                    <span className="day-total-value text-success">${grupo.totalComision.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>

              {grupo.servicios.map((s) => (
                <div key={`mobile-${s.id}`} className="mobile-item-card" style={{ marginBottom: '0.5rem' }}>
                  <div className="mobile-item-header">
                    <div>
                      <div className="mobile-item-name">{s.cliente}</div>
                    </div>
                    <button 
                      onClick={() => setDeletingId(s.id)}
                      className="secondary icon-only"
                      style={{ minHeight: '36px', minWidth: '36px', color: 'var(--danger)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mobile-item-details">
                    <div className="mobile-item-amount">
                      Total: ${Number(s.monto).toLocaleString('es-AR')}
                    </div>
                    <div className="mobile-item-commission">
                      ${Number(s.comision).toLocaleString('es-AR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="card table-desktop" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th className="text-right">Monto</th>
              <th className="text-right">Comisión</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((grupo) => {
              const dateObj = new Date(grupo.fecha + 'T12:00:00');
              const fechaFormateada = dateObj.toLocaleDateString('es-AR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              });

              return (
                <React.Fragment key={`group-desktop-${grupo.fecha}`}>
                  <tr className="table-group-header">
                    <td colSpan={2}>
                      <span style={{ textTransform: 'capitalize' }}>{fechaFormateada}</span>
                    </td>
                    <td colSpan={2} className="text-right">
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', fontSize: '0.85rem' }}>
                        <span>
                          <span style={{ color: 'var(--secondary)', textTransform: 'uppercase', fontSize: '0.7rem', marginRight: '0.5rem' }}>Total Dia:</span>
                          <strong>${grupo.totalMonto.toLocaleString('es-AR')}</strong>
                        </span>
                        <span>
                          <span style={{ color: 'var(--secondary)', textTransform: 'uppercase', fontSize: '0.7rem', marginRight: '0.5rem' }}>Comisión:</span>
                          <strong className="text-success">${grupo.totalComision.toLocaleString('es-AR')}</strong>
                        </span>
                        <span>
                          <span style={{ color: 'var(--secondary)', textTransform: 'uppercase', fontSize: '0.7rem', marginRight: '0.5rem' }}>Cant:</span>
                          <strong>{grupo.servicios.length}</strong>
                        </span>
                      </div>
                    </td>
                  </tr>
                  {grupo.servicios.map((s) => (
                    <tr key={`desktop-${s.id}`}>
                      <td>{s.cliente}</td>
                      <td className="text-right">${Number(s.monto).toLocaleString('es-AR')}</td>
                      <td className="text-right font-bold text-primary">
                        ${Number(s.comision).toLocaleString('es-AR')}
                      </td>
                      <td className="text-right">
                        <button 
                          onClick={() => setDeletingId(s.id)}
                          className="secondary icon-only"
                          style={{ padding: '0.4rem', minHeight: 'auto', minWidth: 'auto' }}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmación */}
      {deletingId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(8px)',
          padding: '1.5rem'
        }}>
          <div className="card" style={{ 
            maxWidth: '400px', 
            width: '100%', 
            textAlign: 'center', 
            animation: 'slideUp 0.3s ease-out',
            position: 'relative',
            padding: '2rem'
          }}>
            <button 
              onClick={() => setDeletingId(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                color: 'var(--secondary)',
                padding: '0.25rem',
                border: 'none',
                minHeight: 'auto',
                width: 'auto'
              }}
            >
              <X size={24} />
            </button>
            
            <div style={{ 
              backgroundColor: '#fee2e2', 
              color: 'var(--danger)', 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.25rem' 
            }}>
              <AlertCircle size={32} />
            </div>
            
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--primary)', fontSize: '1.25rem' }}>¿Eliminar servicio?</h3>
            <p style={{ color: 'var(--secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.5' }}>
              Esta acción no se puede deshacer. El registro se borrará permanentemente de tu historial.
            </p>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
              <button 
                onClick={confirmDelete} 
                style={{ backgroundColor: 'var(--danger)' }}
                disabled={isPending}
              >
                {isPending ? 'Eliminando...' : 'Sí, eliminar servicio'}
              </button>
              <button 
                onClick={() => setDeletingId(null)} 
                className="secondary" 
                disabled={isPending}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

import React from 'react';
