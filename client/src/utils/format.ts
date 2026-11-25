export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN');
}

export function truncate(text: string, max = 100): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/** "vừa xong", "5 phút trước", "3 ngày trước"... (quá 30 ngày thì hiện ngày tháng) */
export function timeAgo(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 45) return 'vừa xong';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return formatDate(iso);
}

/** 75 -> "1 giờ 15 phút" (short: "1h15"), 30 -> "30 phút", 0 -> "—" */
export function formatCookTime(minutes: number, short = false): string {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} phút`;
  if (short) return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}

/** Chữ cái đầu của tên để làm ảnh đại diện */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[parts.length - 1][0] ?? '?').toUpperCase();
}
