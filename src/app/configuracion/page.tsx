'use client';

import { useState } from 'react';
import { updateConfiguracion } from '@/lib/actions';
import { ChevronLeft } from 'lucide-react';
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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', textDecoration: 'none' }}>
          <ChevronLeft size={20} />
          Volver al Inicio
        </Link>
        <h1>Configuración</h1>
      </header>

      <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Porcentaje de Comisión</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="porcentaje">Porcentaje (%)</label>
            <input 
              type="number" 
              id="porcentaje" 
              step="0.01" 
              value={porcentaje} 
              onChange={(e) => setPorcentaje(parseFloat(e.target.value))}
              required 
            />
          </div>
          {msg && <p style={{ marginBottom: '1rem', color: msg.includes('Error') ? 'red' : 'var(--success)' }}>{msg}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </main>
  );
}
