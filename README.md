# CookBook - Chia sẻ công thức nấu ăn

Bài tập lớn cuối kỳ - ứng dụng web fullstack (React + Express + MongoDB), viết bằng TypeScript.

## Thành viên và phân công
| Thành viên | Chức năng | Frontend | Backend |
| --- | --- | --- | --- |
| TV1 (Trần Dương An) | Người dùng và Công thức | Đăng nhập, đăng ký, `AuthProvider`, `ProtectedRoute`, trang chủ, form đăng/sửa công thức, "Của tôi" | `/api/auth` (JWT, bcrypt), `/api/recipes` (CRUD) |
| TV2 (Trưởng nhóm) (Trần Đức Hoàng) | Khám phá, tương tác, quản trị | Tìm kiếm/lọc/phân trang, thích/lưu, bình luận, trang đã lưu, trang quản trị (5 tab), bộ component giao diện dùng chung | Tìm kiếm/lọc/phân trang, thích/lưu, `/api/comments`, `/api/categories`, `/api/admin` |

## Tính năng
- **Khách**: xem, tìm kiếm (theo tên món hoặc nguyên liệu), lọc theo danh mục và thời gian nấu, sắp xếp (mới nhất, nhiều lượt thích), phân trang; bộ lọc nằm trên URL nên chia sẻ được liên kết.
- **Người dùng**: đăng ký/đăng nhập (quay lại đúng trang đang xem), đăng/sửa/xóa công thức (nguyên liệu và các bước nhập theo từng dòng, xem trước ảnh), thích, lưu vào bộ sưu tập, bình luận (xóa bình luận của mình), chia sẻ liên kết, in công thức.
- **Admin**: thống kê, quản lý người dùng (đổi vai trò, xóa kèm dữ liệu), danh mục, kiểm duyệt công thức và bình luận.

## Cài đặt và chạy
```bash
# Server
cd server
cp .env.example .env     # điền MONGO_URI, JWT_SECRET
npm install
npm run seed             # tạo admin + danh mục mẫu
npm run seed:demo        # (tùy chọn) thêm người dùng/công thức/bình luận mẫu, mật khẩu 123456
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
npm run lint
npm run build            # kiểm tra kiểu và build giao diện
```

Tài khoản admin mặc định sau `npm run seed`: `admin@example.com` / `admin123` (đổi bằng `ADMIN_EMAIL`, `ADMIN_PASSWORD` trong `server/.env` trước khi seed).

Frontend dùng React với TypeScript (`.tsx`/`.ts`); backend Express dùng TypeScript và được biên dịch sang `server/dist`.

## API (tóm tắt)
Mọi lỗi trả về JSON `{ "message": "..." }` với mã trạng thái tương ứng (400, 401, 403, 404, 409, 500).

| Nhóm | Endpoint | Quyền |
| --- | --- | --- |
| Tài khoản | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` | công khai / đăng nhập |
| Công thức | `GET /api/recipes?q=&category=&maxTime=&sort=&page=&limit=` (phân trang) | công khai |
| | `GET /api/recipes/:id` (kèm bình luận và món gợi ý) | công khai |
| | `POST /api/recipes`, `PUT /api/recipes/:id`, `DELETE /api/recipes/:id` | đăng nhập, sửa/xóa chỉ tác giả |
| | `GET /api/recipes/my-recipes`, `GET /api/recipes/saved`, `GET /api/recipes/saved/ids` | đăng nhập |
| Tương tác | `PUT /api/recipes/:id/like`, `PUT /api/recipes/:id/save` (bật/tắt) | đăng nhập |
| Bình luận | `POST /api/comments/:recipeId`, `DELETE /api/comments/:commentId` | đăng nhập, xóa chỉ chủ bình luận hoặc admin |
| Danh mục | `GET /api/categories` | công khai |
| | `POST`, `PUT /:id`, `DELETE /:id` tại `/api/categories` | admin |
| Quản trị | `GET /api/admin/stats`, `/users`, `/recipes`, `/comments` | admin |
| | `PATCH /api/admin/users/:id/role`, `DELETE /api/admin/users|recipes|comments/:id` | admin |
