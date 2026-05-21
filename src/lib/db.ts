import { Pool, QueryResultRow } from 'pg';

// Create a pool that uses POSTGRES_URL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Track if the database is available
let dbError: Error | null = null;

export function getDbError() {
  return dbError;
}

// Track if we've already warned about connection in this cycle to avoid spam
let lastWarned = 0;

// A helper for template literals that mimics @vercel/postgres
export async function sql<T extends QueryResultRow>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  try {
    // Simple conversion of template literal to $1, $2, etc.
    const queryText = strings.reduce((acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ''), '');
    const { rows } = await pool.query<T>(queryText, values);
    dbError = null; // Reset error on success
    return { rows };
  } catch (error) {
    const err = error as Error & { code?: string };
    dbError = err;
    if (err.code === 'ECONNREFUSED') {
      const now = Date.now();
      if (now - lastWarned > 10000) { // Only warn every 10 seconds
        console.warn('Database connection refused. Check if DB is running.');
        lastWarned = now;
      }
    } else {
      console.error('Database query error:', error);
    }
    throw error;
  }
}

export type Servicio = {
  id: number;
  fecha: string;
  cliente: string;
  nombre_servicio?: string;
  duracion?: string;
  monto: number;
  comision: number;
  porcentaje_comision: number;
  resaltado: boolean;
  created_at?: string;
};

export type Configuracion = {
  id: number;
  porcentaje_default: number;
};

export async function createTables() {
  try {
    // Test connection first
    await pool.query('SELECT 1');
    
    await sql`
      CREATE TABLE IF NOT EXISTS configuracion (
        id SERIAL PRIMARY KEY,
        porcentaje_default NUMERIC(5, 2) NOT NULL DEFAULT 41.00
      );
    `;

    await sql`
      INSERT INTO configuracion (id, porcentaje_default)
      SELECT 1, 41.00
      WHERE NOT EXISTS (SELECT 1 FROM configuracion WHERE id = 1);
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS servicios (
        id SERIAL PRIMARY KEY,
        fecha DATE NOT NULL,
        cliente TEXT NOT NULL,
        nombre_servicio TEXT,
        duracion TEXT,
        monto NUMERIC(12, 2) NOT NULL,
        comision NUMERIC(12, 2) NOT NULL,
        porcentaje_comision NUMERIC(5, 2) NOT NULL,
        resaltado BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Asegurar que las columnas existen para retrocompatibilidad
    try {
      await sql`ALTER TABLE servicios ADD COLUMN IF NOT EXISTS resaltado BOOLEAN DEFAULT FALSE`;
      await sql`ALTER TABLE servicios ADD COLUMN IF NOT EXISTS nombre_servicio TEXT`;
      await sql`ALTER TABLE servicios ADD COLUMN IF NOT EXISTS duracion TEXT`;
    } catch (e) {
      console.error('Error adding columns:', e);
    }
    dbError = null;
  } catch (error) {
    const err = error as Error & { code?: string };
    dbError = err;
    if (err.code === 'ECONNREFUSED') {
      console.warn('Failed to connect to database. App will run in degraded mode.');
    } else {
      console.error('Failed to create tables:', error);
    }
    // We don't re-throw here to allow the app to boot even without DB
  }
}
