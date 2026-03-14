'use client';

import { useActionState, useEffect } from 'react';
import { login } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push('/');
      router.refresh();
    }
  }, [state, router]);

  return (
    <main style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'var(--background)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Comisiones de Celes</h1>
        <p style={{ textAlign: 'center', color: 'var(--secondary)', marginBottom: '2rem' }}>
          Ingresa tu contraseña para acceder
        </p>

        <form action={action}>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="••••••••"
              required 
            />
          </div>

          {state?.error && (
            <p style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
              {state.error}
            </p>
          )}

          <button type="submit" disabled={isPending} style={{ width: '100%' }}>
            {isPending ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}
