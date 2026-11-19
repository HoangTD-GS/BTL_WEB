export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN');
}

export function truncate(text: string, max = 100): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
