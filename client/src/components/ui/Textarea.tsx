import { useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export default function Textarea({ label, error, hint, id, className = '', ...rest }: TextareaProps) {
  const autoId = useId();
  const areaId = id ?? autoId;
  const length = typeof rest.value === 'string' ? rest.value.length : 0;
  return (
    <div className="field">
      <label htmlFor={areaId}>{label}</label>
      <textarea
        id={areaId}
        className={`input ${error ? 'input-error' : ''} ${className}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${areaId}-error` : undefined}
        {...rest}
      />
      <div className="field-row">
        {error ? (
          <p id={`${areaId}-error`} className="field-error">
            {error}
          </p>
        ) : (
          <p className="field-hint">{hint}</p>
        )}
        {rest.maxLength && (
          <span className="field-hint" aria-hidden="true">
            {length}/{rest.maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
