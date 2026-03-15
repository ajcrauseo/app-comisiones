'use client';

import { useActionState, useEffect } from 'react';
import { login } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import Image from 'next/image';

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
      minHeight: '100dvh',
      background: 'var(--background)',
      padding: '1.5rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '1.5rem' 
        }}>
          <Image 
            src="/logo-celeste.png" 
            alt="Logo Celeste" 
            width={80} 
            height={80} 
            className="logo-large"
            priority
          />
        </div>
        
        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.75rem', fontWeight: 800 }}>Comisiones de Celes</h1>
        <p style={{ textAlign: 'center', color: 'var(--secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
          Ingresa tu contraseña para acceder al sistema
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
              autoFocus
            />
          </div>

          {state?.error && (
            <p className="text-danger mb-4" style={{ fontSize: '0.875rem', textAlign: 'center' }}>
              {state.error}
            </p>
          )}

          <button type="submit" disabled={isPending} style={{ width: '100%', marginTop: '0.5rem' }}>
            {isPending ? 'Verificando...' : 'Entrar al Sistema'}
          </button>
        </form>
      </div>
    </main>
  );
}
