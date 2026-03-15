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
      className="month-input"
      style={{ 
        padding: '0 0.8rem', 
        width: 'auto', 
        borderRadius: '0.75rem', 
        border: '1px solid var(--border)',
        height: '48px',
        minWidth: '140px',
        boxSizing: 'border-box'
      }}
    />
  );
}
