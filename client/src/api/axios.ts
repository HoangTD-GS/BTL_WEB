import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Nếu đang trong phiên duyệt web có yêu cầu auth nhưng token hỏng/hết hạn thì làm mới trang login
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
        // Chỉ chuyển hướng nếu đang ở route cần đăng nhập
        if (currentPath.startsWith('/recipes/new') || currentPath.startsWith('/my-recipes') || currentPath.startsWith('/saved') || currentPath.startsWith('/admin')) {
          window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
