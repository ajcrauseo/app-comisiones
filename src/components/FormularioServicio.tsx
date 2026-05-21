'use client';

import { useActionState, useEffect, useState } from 'react';
import { addServicio } from '@/lib/actions';
import { PlusCircle, Clock } from 'lucide-react';
import { CATALOGO_SERVICIOS } from '@/lib/constants';

export default function FormularioServicio() {
  const [state, action, isPending] = useActionState(addServicio, null);
  const [dismissedState, setDismissedState] = useState<unknown>(null);
  const [selectedServicio, setSelectedServicio] = useState('');
  const [duracion, setDuracion] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [customServicio, setCustomServicio] = useState('');

  // Efecto para manejar el timeout del mensaje de éxito
  useEffect(() => {
    if (state?.success && state !== dismissedState) {
      const timer = setTimeout(() => {
        setDismissedState(state);
      }, 5000); // 5 segundos

      return () => clearTimeout(timer);
    }
  }, [state, dismissedState]);

  const handleServicioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nombre = e.target.value;
    
    if (nombre === 'CUSTOM') {
      setIsCustom(true);
      setSelectedServicio('CUSTOM');
      setDuracion('');
      return;
    }

    setIsCustom(false);
    setSelectedServicio(nombre);
    
    // Buscar la duración en el catálogo
    for (const cat of CATALOGO_SERVICIOS) {
      const s = cat.servicios.find(serv => serv.nombre === nombre);
      if (s) {
        setDuracion(s.duracion);
        break;
      }
    }
  };

  const showSuccess = state?.success && state !== dismissedState;

  // Obtener fecha local en formato YYYY-MM-DD
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const localToday = `${year}-${month}-${day}`;

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.25rem', fontSize: '1.25rem', color: 'var(--primary)' }}>
        Nuevo Servicio
      </h2>
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
            placeholder="Ej: Celeste Rengifo" 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="nombre_servicio_select">Servicio Realizado</label>
          <select 
            id="nombre_servicio_select" 
            value={selectedServicio}
            onChange={handleServicioChange}
            required
            style={{ width: '100%' }}
          >
            <option value="">Selecciona un servicio</option>
            {CATALOGO_SERVICIOS.map((cat) => (
              <optgroup key={cat.categoria} label={cat.categoria}>
                {cat.servicios.map((s) => (
                  <option key={s.nombre} value={s.nombre}>
                    {s.nombre}
                  </option>
                ))}
              </optgroup>
            ))}
            <optgroup label="OTROS">
              <option value="CUSTOM">Otro servicio (Manual)</option>
            </optgroup>
          </select>
          <input type="hidden" name="nombre_servicio" value={isCustom ? customServicio : selectedServicio} />
        </div>

        {isCustom && (
          <div className="form-group" style={{ animation: 'slideDown 0.2s ease-out' }}>
            <label htmlFor="custom_servicio">Nombre del Servicio Especial</label>
            <input 
              type="text" 
              id="custom_servicio" 
              placeholder="Escribe el nombre del servicio" 
              value={customServicio}
              onChange={(e) => setCustomServicio(e.target.value)}
              required
            />
            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="custom_duracion">Duración (Opcional)</label>
              <input 
                type="text" 
                name="duracion"
                id="custom_duracion" 
                placeholder="Ej: 30 min, 1 h 15 min" 
              />
            </div>
          </div>
        )}

        {!isCustom && duracion && (
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontSize: '0.875rem', marginTop: '-0.5rem', marginBottom: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
            <Clock size={16} />
            <span>Duración estimada: <strong>{duracion}</strong></span>
            <input type="hidden" name="duracion" value={duracion} />
          </div>
        )}

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
        
        {state?.error && <p className="text-danger mb-4" style={{ fontSize: '0.875rem' }}>{state.error}</p>}
        {showSuccess && (
          <p className="text-success mb-4" style={{ 
            fontSize: '0.875rem',
            animation: 'fadeInOut 0.3s ease-in-out'
          }}>
            ¡Servicio guardado con éxito!
          </p>
        )}

        <button type="submit" disabled={isPending} style={{ width: '100%' }}>
          {isPending ? (
            'Guardando...'
          ) : (
            <>
              <PlusCircle size={20} />
              <span>Agregar Servicio</span>
            </>
          )}
        </button>
      </form>

      <style jsx>{`
        @keyframes fadeInOut {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
