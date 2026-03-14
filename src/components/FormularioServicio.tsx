'use client';

import { useActionState, useEffect, useState } from 'react';
import { addServicio } from '@/lib/actions';

export default function FormularioServicio() {
  const [state, action, isPending] = useActionState(addServicio, null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Efecto para manejar el timeout del mensaje de éxito
  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000); // 5 segundos

      return () => clearTimeout(timer);
    }
  }, [state]);

  // Obtener fecha local en formato YYYY-MM-DD
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const localToday = `${year}-${month}-${day}`;

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Nuevo Servicio</h2>
      <form action={action}>
        <div className="form-group">
          <label htmlFor="fecha">Fecha</label>
          <input 
            type="date" 
            id="fecha" 
            name="fecha" 
            defaultValue={localToday} 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="cliente">Nombre del Cliente</label>
          <input 
            type="text" 
            id="cliente" 
            name="cliente" 
            placeholder="Ej: Maria Juliana" 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="monto">Precio del Servicio ($)</label>
          <input 
            type="number" 
            id="monto" 
            name="monto" 
            step="0.01" 
            placeholder="0.00" 
            required 
          />
        </div>
        
        {state?.error && <p style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>{state.error}</p>}
        {showSuccess && (
          <p style={{ 
            color: 'var(--success)', 
            marginBottom: '1rem', 
            fontSize: '0.875rem',
            animation: 'fadeInOut 0.3s ease-in-out'
          }}>
            ¡Servicio guardado con éxito!
          </p>
        )}

        <button type="submit" disabled={isPending} style={{ width: '100%' }}>
          {isPending ? 'Guardando...' : 'Agregar Servicio'}
        </button>
      </form>

      <style jsx>{`
        @keyframes fadeInOut {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
