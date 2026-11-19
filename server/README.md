# Server

Backend Express + TypeScript dùng MongoDB.

## Cài đặt và chạy local

```powershell
npm install
copy .env.example .env
npm run dev
```

Server mặc định chạy tại `http://localhost:5000`; kiểm tra kết nối bằng
`http://localhost:5000/api/health`. MongoDB cần chạy tại địa chỉ `MONGO_URI`
trong `.env`.

Các lệnh hữu ích:

```powershell
npm run typecheck
npm run build
npm run seed
```

`npm run seed` tạo tài khoản admin theo `ADMIN_EMAIL` và `ADMIN_PASSWORD`.
Giá trị mặc định trong cấu hình local chỉ dùng để phát triển; hãy thay đổi
chúng trước khi dùng ở môi trường khác. Không đưa file `.env` lên Git.
