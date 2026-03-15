'use client';

import { useState } from 'react';
import { updateConfiguracion } from '@/lib/actions';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function ConfiguracionPage() {
  const [porcentaje, setPorcentaje] = useState<number>(41);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateConfiguracion(porcentaje);
    setLoading(false);
    if (res.success) setMsg('¡Configuración actualizada!');
    else setMsg('Error al actualizar');
  };

  return (
    <main className="container">
      <header>
        <div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <ChevronLeft size={16} />
            Volver
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Configuración</h1>
        </div>
      </header>

      <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--primary)' }}>Ajustes del Sistema</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="porcentaje">Porcentaje de Comisión (%)</label>
            <input 
              type="number" 
              id="porcentaje" 
              step="0.01" 
              value={porcentaje} 
              onChange={(e) => setPorcentaje(parseFloat(e.target.value))}
              required 
            />
            <p className="mt-2" style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
              Este valor se usará para calcular automáticamente la comisión de cada nuevo servicio.
            </p>
          </div>
          
          {msg && (
            <p className={msg.includes('Error') ? 'text-danger mb-4' : 'text-success mb-4'} style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {msg}
            </p>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Guardando...' : (
              <>
                <Save size={18} />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
