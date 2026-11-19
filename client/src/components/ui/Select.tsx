import { useId } from 'react';
import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export default function Select({ label, id, className = '', children, ...rest }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className="field">
      <label htmlFor={selectId}>{label}</label>
      <select id={selectId} className={`input ${className}`.trim()} {...rest}>
        {children}
      </select>
    </div>
  );
}
