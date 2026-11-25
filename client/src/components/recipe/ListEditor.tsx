import { useRef } from 'react';
import Icon from '../ui/Icon';
import { newItem } from './listItems';
import type { ListItem } from './listItems';

interface ListEditorProps {
  label: string;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  placeholder: string;
  addLabel: string;
  multiline?: boolean;
  numbered?: boolean;
  maxLength: number;
  error?: string;
  hint?: string;
}

/** Danh sách nhập nhiều dòng: thêm, xóa, đổi thứ tự. Enter ở ô nguyên liệu = thêm dòng mới. */
export default function ListEditor({
  label,
  items,
  onChange,
  placeholder,
  addLabel,
  multiline = false,
  numbered = false,
  maxLength,
  error,
  hint,
}: ListEditorProps) {
  const pendingFocus = useRef<string | null>(null);

  const update = (id: string, text: string) => onChange(items.map((it) => (it.id === id ? { ...it, text } : it)));

  const insertAfter = (index: number) => {
    const created = newItem();
    pendingFocus.current = created.id;
    onChange([...items.slice(0, index + 1), created, ...items.slice(index + 1)]);
  };

  const remove = (id: string) => {
    if (items.length === 1) onChange([newItem()]);
    else onChange(items.filter((it) => it.id !== id));
  };

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="list-editor" role="group" aria-label={label}>
      <span className="sr-only">{label}</span>
      {items.map((item, index) => {
        const common = {
          value: item.text,
          placeholder: numbered ? `${placeholder} ${index + 1}` : placeholder,
          maxLength,
          'aria-label': `${label} ${index + 1}`,
          'aria-invalid': error && index === 0 ? (true as const) : undefined,
          className: `input ${error && index === 0 ? 'input-error' : ''}`.trim(),
          onChange: (e: { target: { value: string } }) => update(item.id, e.target.value),
          ref: (el: HTMLInputElement | HTMLTextAreaElement | null) => {
            if (el && pendingFocus.current === item.id) {
              el.focus();
              pendingFocus.current = null;
            }
          },
        };
        return (
          <div className="list-row" key={item.id}>
            {numbered && <span className="row-num">{index + 1}</span>}
            {multiline ? (
              <textarea rows={2} {...common} />
            ) : (
              <input
                {...common}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (item.text.trim()) insertAfter(index);
                  }
                }}
              />
            )}
            <div className="list-row-actions">
              <button type="button" className="mini-btn" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Chuyển lên">
                <Icon name="chevronUp" size={16} />
              </button>
              <button type="button" className="mini-btn" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Chuyển xuống">
                <Icon name="chevronDown" size={16} />
              </button>
              <button type="button" className="mini-btn danger" onClick={() => remove(item.id)} aria-label={`Xóa dòng ${index + 1}`}>
                <Icon name="trash" size={16} />
              </button>
            </div>
          </div>
        );
      })}
      {error ? <p className="field-error">{error}</p> : hint && <p className="field-hint">{hint}</p>}
      <div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => insertAfter(items.length - 1)}>
          <Icon name="plus" size={14} /> {addLabel}
        </button>
      </div>
    </div>
  );
}
