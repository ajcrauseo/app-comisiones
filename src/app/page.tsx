import { createTables, getDbError } from '@/lib/db';
import { getServicios, getConfiguracion, logout, getServiciosSemana } from '@/lib/actions';
import FormularioServicio from '@/components/FormularioServicio';
import { ListaServicios, ResumenMes, ResumenSemanal } from '@/components/ListaServicios';
import FiltroMes from '@/components/FiltroMes';
import { Settings, LogOut, DatabaseZap, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; semana?: string }>;
}) {
  // Initialize tables on first load
  await createTables();

  const { mes, semana } = await searchParams;
  const currentMonth = mes || new Date().toISOString().slice(0, 7); // YYYY-MM

  const servicios = await getServicios(currentMonth);
  const porcentaje = await getConfiguracion();
  const dbError = getDbError();

  // Calcular fechas de la semana (Lunes a Domingo)
  const fechaReferencia = semana ? new Date(semana + 'T12:00:00') : new Date();
  const diaSemana = fechaReferencia.getDay(); // 0 = Domingo, 1 = Lunes, etc.
  const diffAlLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  
  const fechaLunes = new Date(fechaReferencia);
  fechaLunes.setDate(fechaReferencia.getDate() + diffAlLunes);
  const inicioSemana = fechaLunes.toISOString().split('T')[0];
  
  const fechaDomingo = new Date(fechaLunes);
  fechaDomingo.setDate(fechaLunes.getDate() + 6);
  const finSemana = fechaDomingo.toISOString().split('T')[0];

  const serviciosSemana = await getServiciosSemana(inicioSemana, finSemana);

  return (
    <main className='container'>
      <header>
        <div>
          <div className='header-logo-container'>
            <Image
              src='https://res.cloudinary.com/dchchsyil/image/upload/v1773546985/anything/logo-celeste_b2iser.png'
              alt='Logo Celeste'
              width={40}
              height={40}
              className='logo'
            />
            <h1>Comisiones de Celes</h1>
          </div>
          <p>Control de Comisiones y Servicios</p>
        </div>
        <div className='actions'>
          <FiltroMes currentMonth={currentMonth} />
          <Link
            href='/clientes'
            className='button secondary icon-only'
            title='Historial de Clientes'
          >
            <Users size={22} />
          </Link>
          <Link
            href='/configuracion'
            className='button secondary icon-only'
            title='Configuración'
          >
            <Settings size={22} />
          </Link>
          <form action={logout}>
            <button
              type='submit'
              className='secondary icon-only'
              title='Cerrar Sesión'
            >
              <LogOut size={22} />
            </button>
          </form>
        </div>
      </header>

      {dbError && (
        <div className="card" style={{ 
          backgroundColor: '#fef2f2', 
          borderColor: '#fee2e2', 
          color: '#991b1b',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <DatabaseZap size={24} />
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>La base de datos no está disponible</h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
              No se pueden cargar o guardar datos en este momento. Por favor, comprueba tu conexión.
            </p>
          </div>
        </div>
      )}

      <ResumenSemanal servicios={serviciosSemana} inicio={inicioSemana} fin={finSemana} />

      <ResumenMes servicios={servicios} />

      <div className='grid'>
        <aside>
          <FormularioServicio />
          <div
            className='card'
            style={{
              fontSize: '0.875rem',
              color: 'var(--secondary)',
              borderLeft: '4px solid #cbd5e1',
            }}
          >
            <p>
              Comisión actual:{' '}
              <strong className='text-primary'>{porcentaje}%</strong>
            </p>
            <p className='mt-2'>
              Puedes cambiar este porcentaje en el panel de configuración.
            </p>
          </div>
        </aside>

        <section>
          <h2
            className='mb-4'
            style={{ fontSize: '1.25rem', color: 'var(--primary)' }}
          >
            Servicios de{' '}
            {new Date(currentMonth + '-02').toLocaleString('es-AR', {
              month: 'long',
              year: 'numeric',
            })}
          </h2>
          <ListaServicios servicios={servicios} />
        </section>
      </div>
    </main>
  );
}
