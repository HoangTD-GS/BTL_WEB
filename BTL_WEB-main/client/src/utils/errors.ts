import axios from 'axios';

/** Lấy thông báo lỗi tiếng Việt từ lỗi bất kỳ (ưu tiên message do server trả về). */
export function getErrorMessage(err: unknown, fallback = 'Đã có lỗi xảy ra, vui lòng thử lại'): string {
  if (axios.isAxiosError<{ message?: string }>(err)) {
    if (!err.response) return 'Không kết nối được máy chủ';
    return err.response.data?.message || fallback;
  }
  return err instanceof Error && err.message ? err.message : fallback;
}
