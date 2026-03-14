import { createTables } from '@/lib/db';
import { getServicios, getConfiguracion, logout } from '@/lib/actions';
import FormularioServicio from '@/components/FormularioServicio';
import { ListaServicios, ResumenMes } from '@/components/ListaServicios';
import FiltroMes from '@/components/FiltroMes';
import { Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  // Initialize tables on first load
  await createTables();

  const { mes } = await searchParams;
  const currentMonth = mes || new Date().toISOString().slice(0, 7); // YYYY-MM

  const servicios = await getServicios(currentMonth);
  const porcentaje = await getConfiguracion();

  return (
    <main className="container">
      <header>
        <div>
          <h1>Comisiones de Celes</h1>
          <p style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>Control de Comisiones y Servicios</p>
        </div>
        <div className="actions">
          <FiltroMes currentMonth={currentMonth} />
          <Link href="/configuracion" className="button secondary" title="Configuración" style={{ padding: '0.5rem' }}>
            <Settings size={24} />
          </Link>
          <form action={logout}>
            <button type="submit" className="secondary" style={{ padding: '0.5rem' }} title="Cerrar Sesión">
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </header>

      <ResumenMes servicios={servicios} />

      <div className="grid">
        <aside>
          <FormularioServicio />
          <div className="card" style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>
            <p>Comisión actual: <strong>{porcentaje}%</strong></p>
            <p style={{ marginTop: '0.5rem' }}>
              Puedes cambiar este porcentaje en el panel de configuración.
            </p>
          </div>
        </aside>

        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
            Servicios de {new Date(currentMonth + '-02').toLocaleString('es-AR', { month: 'long', year: 'numeric' })}
          </h2>
          <ListaServicios servicios={servicios} />
        </section>
      </div>
    </main>
  );
}
