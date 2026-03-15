'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Servicio } from '@/lib/db';
import { deleteServicio, toggleResaltado, updateServicio } from '@/lib/actions';
import { Trash2, AlertCircle, X, Edit, Save, Hash } from 'lucide-react';
import React from 'react';

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
  const router = useRouter();
  const [isPendingToggle, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isPendingEdit, setIsPendingEdit] = useState(false);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsPending(true);
    await deleteServicio(deletingId);
    setIsPending(false);
    setDeletingId(null);
  };

  const handleToggleStar = (id: number, current: boolean) => {
    startTransition(async () => {
      await toggleResaltado(id, current);
      router.refresh();
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingServicio) return;
    
    setIsPendingEdit(true);
    const formData = new FormData(e.currentTarget);
    await updateServicio(editingServicio.id, formData);
    setIsPendingEdit(false);
    setEditingServicio(null);
    router.refresh();
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
                <div className="day-totals" style={{ gap: '0.75rem' }}>
                  <div className="day-total-item">
                    <span className="day-total-label">Fact.</span>
                    <span className="day-total-value">${grupo.totalMonto.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="day-total-item">
                    <span className="day-total-label text-success">Com.</span>
                    <span className="day-total-value text-success">${grupo.totalComision.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="day-total-item">
                    <span className="day-total-label">Cant.</span>
                    <span className="day-total-value">{grupo.servicios.length}</span>
                  </div>
                </div>
              </div>

              {grupo.servicios.map((s) => (
                <div 
                  key={`mobile-${s.id}`} 
                  className="mobile-item-card" 
                  style={{ 
                    marginBottom: '0.5rem',
                    borderLeft: s.resaltado ? '4px solid var(--danger)' : '1px solid var(--border)',
                    backgroundColor: s.resaltado ? '#fef2f2' : 'white',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="mobile-item-header">
                    <div style={{ flex: 1 }}>
                      <div className="mobile-item-name" style={{ color: s.resaltado ? 'var(--danger)' : 'inherit', fontWeight: s.resaltado ? '700' : '600' }}>{s.cliente}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button 
                        onClick={() => handleToggleStar(s.id, !!s.resaltado)}
                        className="secondary icon-only"
                        disabled={isPendingToggle}
                        style={{ minHeight: '36px', minWidth: '36px', color: s.resaltado ? 'var(--danger)' : 'var(--secondary)', opacity: isPendingToggle ? 0.7 : 1 }}
                      >
                        <AlertCircle size={18} />
                      </button>
                      <button 
                        onClick={() => setEditingServicio(s)}
                        className="secondary icon-only"
                        style={{ minHeight: '36px', minWidth: '36px' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => setDeletingId(s.id)}
                        className="secondary icon-only"
                        style={{ minHeight: '36px', minWidth: '36px', color: 'var(--danger)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="mobile-item-details">
                    <div className="mobile-item-amount">
                      Total: ${Number(s.monto).toLocaleString('es-AR')}
                    </div>
                    <div className="mobile-item-commission" style={{ color: s.resaltado ? 'var(--danger)' : 'var(--primary)' }}>
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
              <th style={{ width: '40px' }}></th>
              <th>Cliente</th>
              <th className="text-right">Monto</th>
              <th className="text-right">Comisión</th>
              <th style={{ width: '120px' }}></th>
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
                    <td colSpan={2} style={{ paddingLeft: '1rem' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 800, color: 'var(--primary)' }}>{fechaFormateada}</span>
                    </td>
                    <td colSpan={3} className="text-right" style={{ paddingRight: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', fontSize: '0.8rem' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ color: 'var(--secondary)', textTransform: 'uppercase', fontSize: '0.6rem', marginRight: '0.3rem' }}>Tot:</span>
                          <strong>${grupo.totalMonto.toLocaleString('es-AR')}</strong>
                        </span>
                        <span style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ color: 'var(--secondary)', textTransform: 'uppercase', fontSize: '0.6rem', marginRight: '0.3rem' }}>Com:</span>
                          <strong className="text-success">${grupo.totalComision.toLocaleString('es-AR')}</strong>
                        </span>
                        <span style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ color: 'var(--secondary)', textTransform: 'uppercase', fontSize: '0.6rem', marginRight: '0.3rem' }}>Serv:</span>
                          <strong>{grupo.servicios.length}</strong>
                        </span>
                      </div>
                    </td>
                  </tr>
                  {grupo.servicios.map((s) => (
                    <tr key={`desktop-${s.id}`} style={{ backgroundColor: s.resaltado ? '#fef2f2' : 'transparent', transition: 'background-color 0.2s ease' }}>
                      <td className="text-center">
                        <button 
                          onClick={() => handleToggleStar(s.id, !!s.resaltado)}
                          disabled={isPendingToggle}
                          style={{ background: 'none', border: 'none', color: s.resaltado ? 'var(--danger)' : '#cbd5e1', cursor: 'pointer', padding: 0, minHeight: 'auto', width: 'auto', opacity: isPendingToggle ? 0.7 : 1 }}
                        >
                          <AlertCircle size={18} />
                        </button>
                      </td>
                      <td style={{ fontWeight: s.resaltado ? '700' : 'normal', color: s.resaltado ? 'var(--danger)' : 'inherit' }}>{s.cliente}</td>
                      <td className="text-right">${Number(s.monto).toLocaleString('es-AR')}</td>
                      <td className="text-right font-bold text-primary">
                        ${Number(s.comision).toLocaleString('es-AR')}
                      </td>
                      <td className="text-right">
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => setEditingServicio(s)}
                            className="secondary icon-only"
                            style={{ padding: '0.4rem', minHeight: 'auto', minWidth: 'auto' }}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => setDeletingId(s.id)}
                            className="secondary icon-only"
                            style={{ padding: '0.4rem', minHeight: 'auto', minWidth: 'auto' }}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Edición */}
      {editingServicio && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(8px)', padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '450px', width: '100%', animation: 'slideUp 0.3s ease-out' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--primary)' }}>Editar Servicio</h3>
                <button onClick={() => setEditingServicio(null)} style={{ background: 'none', color: 'var(--secondary)', width: 'auto', minHeight: 'auto' }}>
                  <X size={24} />
                </button>
             </div>
             
             <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label htmlFor="edit-fecha">Fecha</label>
                  <input 
                    type="date" id="edit-fecha" name="fecha" 
                    defaultValue={typeof editingServicio.fecha === 'string' ? editingServicio.fecha.split('T')[0] : new Date(editingServicio.fecha).toISOString().split('T')[0]} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-cliente">Nombre del Cliente</label>
                  <input type="text" id="edit-cliente" name="cliente" defaultValue={editingServicio.cliente} required />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-monto">Precio del Servicio ($)</label>
                  <input type="number" id="edit-monto" name="monto" step="0.01" defaultValue={Number(editingServicio.monto)} required />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" onClick={() => setEditingServicio(null)} className="secondary" style={{ flex: 1 }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={isPendingEdit} style={{ flex: 1 }}>
                    {isPendingEdit ? 'Guardando...' : <><Save size={18} /> Guardar</>}
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Borrado */}
      {deletingId && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(8px)', padding: '1.5rem'
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', animation: 'slideUp 0.3s ease-out', position: 'relative', padding: '2rem' }}>
            <button 
              onClick={() => setDeletingId(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', color: 'var(--secondary)', padding: '0.25rem', border: 'none', minHeight: 'auto', width: 'auto' }}
            >
              <X size={24} />
            </button>
            <div style={{ backgroundColor: '#fee2e2', color: 'var(--danger)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <AlertCircle size={32} />
            </div>
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--primary)', fontSize: '1.25rem' }}>¿Eliminar servicio?</h3>
            <p style={{ color: 'var(--secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.5' }}>
              Esta acción no se puede deshacer. El registro se borrará permanentemente.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
              <button onClick={confirmDelete} style={{ backgroundColor: 'var(--danger)' }} disabled={isPending}>
                {isPending ? 'Eliminando...' : 'Sí, eliminar servicio'}
              </button>
              <button onClick={() => setDeletingId(null)} className="secondary" disabled={isPending}>
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
