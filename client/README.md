# Client

Frontend React + TypeScript, được chạy bằng Vite.

## Cài đặt và chạy local

Trong PowerShell, chạy từ thư mục `client`:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Kiểm tra kiểu và build giao diện:

```powershell
npm run typecheck
npm run build
```

`VITE_API_URL` trong `.env` cấu hình địa chỉ API; mặc định dùng
`http://localhost:5000/api`.
