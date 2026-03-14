'use client';

import { useState } from 'react';
import { Servicio } from '@/lib/db';
import { deleteServicio } from '@/lib/actions';
import { Trash2, AlertCircle, X } from 'lucide-react';

export function ResumenMes({ servicios }: { servicios: Servicio[] }) {
  const totalFacturado = servicios.reduce((acc, s) => acc + Number(s.monto), 0);
  const totalComisiones = servicios.reduce((acc, s) => acc + Number(s.comision), 0);

  return (
    <div className="summary-grid">
      <div className="card stat-card">
        <div className="stat-label">Total Facturado</div>
        <div className="stat-value">${totalFacturado.toLocaleString('es-AR')}</div>
      </div>
      <div className="card stat-card">
        <div className="stat-label">Total Comisiones</div>
        <div className="stat-value" style={{ color: 'var(--success)' }}>
          ${totalComisiones.toLocaleString('es-AR')}
        </div>
      </div>
      <div className="card stat-card">
        <div className="stat-label">Servicios</div>
        <div className="stat-value">{servicios.length}</div>
      </div>
    </div>
  );
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

  return (
    <>
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th className="text-right">Monto</th>
                <th className="text-right">Comisión</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => {
                // Ensure date stays on the same day by adding noon (T12:00:00) 
                // when parsing the date string from Postgres
                const dateObj = typeof s.fecha === 'string' ? new Date(s.fecha + 'T12:00:00') : new Date(s.fecha);
                const fechaFormateada = dateObj.toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                });

                return (
                  <tr key={s.id}>
                    <td>{fechaFormateada}</td>
                    <td>{s.cliente}</td>
                    <td className="text-right">${Number(s.monto).toLocaleString('es-AR')}</td>
                    <td className="text-right font-bold text-primary">
                      ${Number(s.comision).toLocaleString('es-AR')}
                    </td>
                    <td className="text-right">
                      <button 
                        onClick={() => setDeletingId(s.id)}
                        className="secondary"
                        style={{ padding: '0.25rem', borderRadius: '0.25rem', display: 'flex' }}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmación Elegante */}
      {deletingId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
          padding: '1rem'
        }}>
          <div className="card" style={{ 
            maxWidth: '400px', 
            width: '100%', 
            textAlign: 'center', 
            animation: 'fadeIn 0.2s ease-out',
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
                border: 'none'
              }}
            >
              <X size={20} />
            </button>
            
            <div style={{ 
              backgroundColor: '#fee2e2', 
              color: '#dc2626', 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1rem' 
            }}>
              <AlertCircle size={24} />
            </div>
            
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>¿Eliminar servicio?</h3>
            <p style={{ color: 'var(--secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Esta acción no se puede deshacer. El registro se borrará permanentemente de tu historial.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setDeletingId(null)} 
                className="secondary" 
                style={{ flex: 1 }}
                disabled={isPending}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete} 
                style={{ flex: 1, backgroundColor: '#dc2626' }}
                disabled={isPending}
              >
                {isPending ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
