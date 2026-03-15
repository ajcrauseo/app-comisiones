import { Pool, QueryResultRow } from 'pg';

// Create a pool that uses POSTGRES_URL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// A helper for template literals that mimics @vercel/postgres
export async function sql<T extends QueryResultRow>(
  strings: TemplateStringsArray,
  ...values: any[]
) {
  // Simple conversion of template literal to $1, $2, etc.
  const queryText = strings.reduce((acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ''), '');
  const { rows } = await pool.query<T>(queryText, values);
  return { rows };
}

export type Servicio = {
  id: number;
  fecha: string;
  cliente: string;
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
      monto NUMERIC(12, 2) NOT NULL,
      comision NUMERIC(12, 2) NOT NULL,
      porcentaje_comision NUMERIC(5, 2) NOT NULL,
      resaltado BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}
