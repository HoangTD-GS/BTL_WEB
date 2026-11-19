import { useToastStore } from '../../store/useToastStore';

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
          <span>{t.message}</span>
          <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Đóng thông báo">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
