'use client';

import { useRouter } from 'next/navigation';

export default function FiltroMes({ currentMonth }: { currentMonth: string }) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value;
    if (newMonth) {
      router.push(`/?mes=${newMonth}`);
    }
  };

  return (
    <input 
      type="month" 
      name="mes" 
      defaultValue={currentMonth} 
      onChange={handleChange}
      style={{ padding: '0.5rem', width: 'auto', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
    />
  );
}
