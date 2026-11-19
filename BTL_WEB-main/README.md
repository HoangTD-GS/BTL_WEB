# Chia sẻ công thức nấu ăn

Bài tập lớn cuối kỳ - ứng dụng web fullstack (React + Express + MongoDB).

## Thành viên và phân công
| Thành viên | Chức năng | Frontend | Backend |
| --- | --- | --- | --- |
| TV1  (Trần Dương An)| Người dùng và Công thức | ... | ... |
| TV2 (Trưởng nhóm) (Trần Đức Hoàng)| Khám phá, tương tác, quản trị | ... | ... |

## Cài đặt và chạy
```bash
# Server
cd server
cp .env.example .env     # điền MONGO_URI, JWT_SECRET
npm install
npm run dev              # chạy TypeScript trực tiếp tại http://localhost:5000

# Kiểm tra kiểu / build backend
npm run typecheck
npm run build            # tạo server/dist để chạy production

# Client (mở terminal khác)
cd client
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
npm run typecheck        # kiểm tra TypeScript
npm run build            # kiểm tra kiểu và build giao diện
```

Frontend dùng React với TypeScript (`.tsx`/`.ts`); backend Express dùng TypeScript và được biên dịch sang `server/dist`.

## API
Xem mục API trong báo cáo.
