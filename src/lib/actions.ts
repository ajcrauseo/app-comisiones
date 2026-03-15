'use server';
import { sql, Servicio } from './db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// For production, use a secure SESSION_SECRET from environment variables
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_secret_only';

async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  return session?.value === SESSION_SECRET;
}

export async function login(prevState: any, formData: FormData) {
  const password = formData.get('password') as string;
  const correctPassword = process.env.APP_PASSWORD;

  if (!correctPassword) {
    return { error: 'Error de configuración del servidor' };
  }

  if (password === correctPassword) {
    const cookieStore = await cookies();
    cookieStore.set('session', SESSION_SECRET, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax',
    });
    return { success: true };
  }

  return { error: 'Contraseña incorrecta' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}

export async function getServicios(mes?: string): Promise<Servicio[]> {
  if (!(await isAuthenticated())) {
    return [];
  }

  try {
    let query;
    if (mes) {
      // mes format: YYYY-MM
      const [year, month] = mes.split('-');
      query = sql<Servicio>`
        SELECT * FROM servicios 
        WHERE EXTRACT(YEAR FROM fecha) = ${year} 
        AND EXTRACT(MONTH FROM fecha) = ${month}
        ORDER BY fecha DESC, id DESC
      `;
    } else {
      query = sql<Servicio>`SELECT * FROM servicios ORDER BY fecha DESC, id DESC LIMIT 50`;
    }
    const { rows } = await query;
    return rows;
  } catch (error) {
    console.error('Error getting services:', error);
    return [];
  }
}

export async function getConfiguracion() {
  if (!(await isAuthenticated())) {
    return 41.0;
  }

  try {
    const { rows } = await sql`SELECT porcentaje_default FROM configuracion WHERE id = 1`;
    return rows[0]?.porcentaje_default || 41.0;
  } catch (error) {
    return 41.0;
  }
}

export async function addServicio(prevState: any, formData: FormData) {
  if (!(await isAuthenticated())) {
    return { error: 'No autorizado' };
  }

  const fecha = formData.get('fecha') as string;
  const cliente = formData.get('cliente') as string;
  const monto = parseFloat(formData.get('monto') as string);
  
  if (!fecha || !cliente || isNaN(monto)) {
    return { error: 'Todos los campos son obligatorios' };
  }

  const porcentaje = await getConfiguracion();
  const comision = (monto * porcentaje) / 100;

  try {
    await sql`
      INSERT INTO servicios (fecha, cliente, monto, comision, porcentaje_comision)
      VALUES (${fecha}, ${cliente}, ${monto}, ${comision}, ${porcentaje})
    `;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error adding service:', error);
    return { error: 'Error al guardar el servicio' };
  }
}

export async function deleteServicio(id: number) {
  if (!(await isAuthenticated())) {
    return { error: 'No autorizado' };
  }

  try {
    await sql`DELETE FROM servicios WHERE id = ${id}`;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Error al eliminar' };
  }
}

export async function toggleResaltado(id: number, currentStatus: boolean) {
  if (!(await isAuthenticated())) {
    return { error: 'No autorizado' };
  }

  try {
    await sql`UPDATE servicios SET resaltado = ${!currentStatus} WHERE id = ${id}`;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error toggling highlight:', error);
    return { error: 'Error al actualizar resaltado' };
  }
}

export async function updateServicio(id: number, formData: FormData) {
  if (!(await isAuthenticated())) {
    return { error: 'No autorizado' };
  }

  const fecha = formData.get('fecha') as string;
  const cliente = formData.get('cliente') as string;
  const monto = parseFloat(formData.get('monto') as string);
  
  if (!fecha || !cliente || isNaN(monto)) {
    return { error: 'Todos los campos son obligatorios' };
  }

  try {
    // Obtener el porcentaje de comisión original para este servicio
    const { rows } = await sql<Servicio>`SELECT porcentaje_comision FROM servicios WHERE id = ${id}`;
    const porcentaje = rows[0]?.porcentaje_comision || 41.0;
    const comision = (monto * porcentaje) / 100;

    await sql`
      UPDATE servicios 
      SET fecha = ${fecha}, cliente = ${cliente}, monto = ${monto}, comision = ${comision}
      WHERE id = ${id}
    `;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating service:', error);
    return { error: 'Error al actualizar el servicio' };
  }
}

export async function updateConfiguracion(porcentaje: number) {
  if (!(await isAuthenticated())) {
    return { error: 'No autorizado' };
  }

  try {
    await sql`UPDATE configuracion SET porcentaje_default = ${porcentaje} WHERE id = 1`;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Error al actualizar configuración' };
  }
}
