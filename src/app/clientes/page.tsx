'use client';

import { useState, useTransition } from 'react';
import { getServiciosByCliente } from '@/lib/actions';
import { Servicio } from '@/lib/db';
import { Search, ChevronLeft, User, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function ClientesPage() {
  const [query, setQuery] = useState('');
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [isSearching, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    startTransition(async () => {
      const results = await getServiciosByCliente(query.trim());
      setServicios(results);
      setHasSearched(true);
    });
  };

  // Agrupar servicios por cliente para cuando la búsqueda es parcial
  const clientesAgrupados = servicios.reduce((acc: Record<string, Servicio[]>, s) => {
    const nombre = s.cliente;
    if (!acc[nombre]) acc[nombre] = [];
    acc[nombre].push(s);
    return acc;
  }, {});

  const nombresClientes = Object.keys(clientesAgrupados);

  return (
    <main className="container">
      <header>
        <div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <ChevronLeft size={16} />
            Volver al Panel
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Historial de Clientes</h1>
        </div>
      </header>

      <section style={{ maxWidth: '600px', margin: '0 auto 2.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search 
              size={20} 
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} 
            />
            <input 
              type="text" 
              placeholder="Buscar por nombre de cliente..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: '3rem' }}
              required
            />
          </div>
          <button type="submit" disabled={isSearching} style={{ width: 'auto' }}>
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </section>

      {hasSearched && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {nombresClientes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {nombresClientes.map(nombreCliente => {
                const serviciosCliente = clientesAgrupados[nombreCliente];
                const totalFacturado = serviciosCliente.reduce((acc, s) => acc + Number(s.monto), 0);
                
                return (
                  <div key={nombreCliente} className="cliente-group">
                    <h2 style={{ 
                      fontSize: '1.5rem', 
                      color: 'var(--primary)', 
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      paddingBottom: '0.5rem',
                      borderBottom: '2px solid var(--border)'
                    }}>
                      <User size={24} /> {nombreCliente}
                    </h2>

                    <div className="summary-grid" style={{ marginBottom: '1.5rem' }}>
                      <div className="card stat-card" style={{ padding: '0.75rem' }}>
                        <div className="stat-label">Visitas</div>
                        <div className="stat-value" style={{ fontSize: '1.25rem' }}>{serviciosCliente.length}</div>
                      </div>
                      <div className="card stat-card" style={{ borderLeftColor: 'var(--success)', padding: '0.75rem' }}>
                        <div className="stat-label">Total Invertido</div>
                        <div className="stat-value text-success" style={{ fontSize: '1.25rem' }}>
                          ${totalFacturado.toLocaleString('es-AR')}
                        </div>
                      </div>
                    </div>

                    <div className="mobile-cards">
                      {serviciosCliente.map((s) => {
                        const fechaRaw = (s.fecha as any) instanceof Date 
                          ? (s.fecha as any).toISOString() 
                          : (typeof s.fecha === 'object' && s.fecha !== null && 'toISOString' in (s.fecha as any) ? (s.fecha as any).toISOString() : String(s.fecha));
                        const dateStr = fechaRaw.split('T')[0];
                        const [year, month, day] = dateStr.split('-');
                        const fechaFormateada = `${day}/${month}/${year}`;
                        return (
                          <div key={s.id} className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--primary)', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontSize: '0.875rem' }}>
                                <Calendar size={14} />
                                {fechaFormateada}
                              </div>
                              <div style={{ fontWeight: 800, color: 'var(--primary)' }}>
                                ${Number(s.monto).toLocaleString('es-AR')}
                              </div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                              {s.nombre_servicio || 'Servicio General'}
                            </div>
                            {s.duracion && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--secondary)' }}>
                                <Clock size={12} />
                                {s.duracion}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="card table-desktop" style={{ padding: 0, overflow: 'hidden' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Servicio</th>
                            <th>Duración</th>
                            <th className="text-right">Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {serviciosCliente.map((s) => {
                            const fechaRaw = (s.fecha as any) instanceof Date 
                              ? (s.fecha as any).toISOString() 
                              : (typeof s.fecha === 'object' && s.fecha !== null && 'toISOString' in (s.fecha as any) ? (s.fecha as any).toISOString() : String(s.fecha));
                            const dateStr = fechaRaw.split('T')[0];
                            const [year, month, day] = dateStr.split('-');
                            const fechaFormateada = `${day}/${month}/${year}`;
                            return (
                              <tr key={`desktop-${s.id}`}>
                                <td>
                                  {fechaFormateada}
                                </td>
                                <td style={{ fontWeight: 600 }}>{s.nombre_servicio || 'Servicio General'}</td>
                                <td>
                                  {s.duracion ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.875rem' }}>
                                      <Clock size={14} /> {s.duracion}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="text-right" style={{ fontWeight: 700 }}>
                                  ${Number(s.monto).toLocaleString('es-AR')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <User size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>No se encontraron registros</h3>
              <p style={{ color: 'var(--secondary)' }}>No tenemos servicios registrados para &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
