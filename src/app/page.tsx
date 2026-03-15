import { createTables } from '@/lib/db';
import { getServicios, getConfiguracion, logout } from '@/lib/actions';
import FormularioServicio from '@/components/FormularioServicio';
import { ListaServicios, ResumenMes } from '@/components/ListaServicios';
import FiltroMes from '@/components/FiltroMes';
import { Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
          <div className="header-logo-container">
            <Image 
              src="/logo-celeste.png" 
              alt="Logo Celeste" 
              width={40} 
              height={40} 
              className="logo"
              unoptimized
            />
            <h1>Comisiones de Celes</h1>
          </div>
          <p>Control de Comisiones y Servicios</p>
        </div>
        <div className="actions">
          <FiltroMes currentMonth={currentMonth} />
          <Link href="/configuracion" className="button secondary icon-only" title="Configuración">
            <Settings size={22} />
          </Link>
          <form action={logout}>
            <button type="submit" className="secondary icon-only" title="Cerrar Sesión">
              <LogOut size={22} />
            </button>
          </form>
        </div>
      </header>

      <ResumenMes servicios={servicios} />

      <div className="grid">
        <aside>
          <FormularioServicio />
          <div className="card" style={{ fontSize: '0.875rem', color: 'var(--secondary)', borderLeft: '4px solid #cbd5e1' }}>
            <p>Comisión actual: <strong className="text-primary">{porcentaje}%</strong></p>
            <p className="mt-2">
              Puedes cambiar este porcentaje en el panel de configuración.
            </p>
          </div>
        </aside>

        <section>
          <h2 className="mb-4" style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
            Servicios de {new Date(currentMonth + '-02').toLocaleString('es-AR', { month: 'long', year: 'numeric' })}
          </h2>
          <ListaServicios servicios={servicios} />
        </section>
      </div>
    </main>
  );
}
