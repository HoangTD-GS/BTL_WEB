// Chạy:
//   npm run seed         tạo tài khoản admin và các danh mục mẫu
//   npm run seed:demo    như trên, kèm người dùng/công thức/bình luận giả để xem trang admin
// Chạy lại nhiều lần vẫn an toàn (không tạo trùng).
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Category from './models/Category.js';
import Recipe from './models/Recipe.js';
import Comment from './models/Comment.js';

const ADMIN = {
  name: 'Quản trị viên',
  email: (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase(),
  password: process.env.ADMIN_PASSWORD || 'admin123',
};

const CATEGORIES = ['Món chính', 'Món canh', 'Món chay', 'Tráng miệng', 'Đồ uống', 'Ăn vặt'];

const DEMO_DOMAIN = '@demo.local';
const DEMO_PASSWORD = '123456';
const DEMO_USERS = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Minh Châu', 'Phạm Quốc Dũng', 'Hoàng Thu Hà'];

const DEMO_RECIPES: { title: string; category: string; time: number; ingredients: string[]; steps: string[] }[] = [
  { title: 'Phở bò Hà Nội', category: 'Món chính', time: 180, ingredients: ['Xương bò', 'Bánh phở', 'Thịt bò', 'Hành tây', 'Gừng nướng'], steps: ['Ninh xương 3 tiếng', 'Chần bánh phở', 'Xếp thịt, chan nước dùng'] },
  { title: 'Bún chả', category: 'Món chính', time: 60, ingredients: ['Thịt ba chỉ', 'Bún', 'Nước mắm', 'Đu đủ xanh'], steps: ['Ướp thịt', 'Nướng than', 'Pha nước chấm'] },
  { title: 'Canh chua cá lóc', category: 'Món canh', time: 40, ingredients: ['Cá lóc', 'Me', 'Cà chua', 'Dứa', 'Giá đỗ'], steps: ['Nấu nước me', 'Cho cá và rau', 'Nêm vừa ăn'] },
  { title: 'Đậu hũ sốt cà chua', category: 'Món chay', time: 25, ingredients: ['Đậu hũ', 'Cà chua', 'Hành lá'], steps: ['Chiên đậu', 'Xào sốt cà', 'Đun nhỏ lửa'] },
  { title: 'Chè đậu xanh', category: 'Tráng miệng', time: 45, ingredients: ['Đậu xanh', 'Đường', 'Nước cốt dừa'], steps: ['Nấu đậu mềm', 'Thêm đường', 'Rưới nước cốt dừa'] },
  { title: 'Bánh flan caramel', category: 'Tráng miệng', time: 70, ingredients: ['Trứng', 'Sữa tươi', 'Đường'], steps: ['Làm caramel', 'Trộn trứng sữa', 'Hấp 25 phút'] },
  { title: 'Gỏi cuốn tôm thịt', category: 'Ăn vặt', time: 30, ingredients: ['Bánh tráng', 'Tôm', 'Thịt luộc', 'Rau thơm'], steps: ['Luộc tôm thịt', 'Cuốn bánh tráng', 'Chấm tương'] },
  { title: 'Trà đào cam sả', category: 'Đồ uống', time: 20, ingredients: ['Trà túi lọc', 'Đào ngâm', 'Cam', 'Sả'], steps: ['Pha trà', 'Thêm đào, cam, sả', 'Dùng lạnh'] },
];

const DEMO_COMMENTS = [
  'Làm theo thấy ngon lắm, cảm ơn bạn!',
  'Mình thêm chút tiêu thì thơm hơn.',
  'Công thức dễ làm, cả nhà đều thích.',
  'Cho mình hỏi có thể thay nguyên liệu này không?',
  'Lần sau mình sẽ giảm bớt đường.',
  'Trình bày đẹp quá!',
  'Mua hàng giá rẻ tại website abc.xyz (quảng cáo)',
  'Nấu lần đầu mà thành công luôn.',
];

async function seedAdmin(): Promise<void> {
  const admin = await User.findOne({ email: ADMIN.email });
  if (!admin) {
    await User.create({ ...ADMIN, role: 'admin' });
    console.log(`Đã tạo admin: ${ADMIN.email} / ${ADMIN.password}`);
  } else if (admin.role !== 'admin') {
    admin.role = 'admin';
    await admin.save();
    console.log(`Đã nâng ${ADMIN.email} lên admin`);
  } else {
    console.log(`Admin ${ADMIN.email} đã tồn tại, bỏ qua`);
  }
}

async function seedCategories(): Promise<void> {
  for (const name of CATEGORIES) {
    const res = await Category.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
    if (res.upsertedCount) console.log(`Đã thêm danh mục: ${name}`);
  }
}

async function seedDemo(): Promise<void> {
  if (await User.exists({ email: new RegExp(`${DEMO_DOMAIN.replace('.', '\\.')}$`) })) {
    console.log('Dữ liệu demo đã có, bỏ qua');
    return;
  }

  const users = [];
  for (const [i, name] of DEMO_USERS.entries()) {
    users.push(await User.create({ name, email: `user${i + 1}${DEMO_DOMAIN}`, password: DEMO_PASSWORD }));
  }
  const categories = await Category.find().lean();
  const catId = new Map(categories.map((c) => [c.name, c._id]));

  const recipes = [];
  for (const [i, r] of DEMO_RECIPES.entries()) {
    const likers = users.filter((_, j) => (i + j) % 2 === 0).map((u) => u._id);
    recipes.push(
      await Recipe.create({
        title: r.title,
        description: `Hướng dẫn nấu ${r.title.toLowerCase()} đơn giản tại nhà.`,
        ingredients: r.ingredients,
        steps: r.steps,
        cookTime: r.time,
        servings: 2 + (i % 3),
        author: users[i % users.length]._id,
        category: catId.get(r.category),
        likes: likers,
      })
    );
  }

  for (const [i, content] of DEMO_COMMENTS.entries()) {
    await Comment.create({
      content,
      recipe: recipes[i % recipes.length]._id,
      user: users[(i + 1) % users.length]._id,
    });
  }

  // Mỗi người dùng lưu vài công thức
  for (const [i, u] of users.entries()) {
    u.savedRecipes.push(recipes[i]._id, recipes[(i + 3) % recipes.length]._id);
    await u.save();
  }

  console.log(
    `Đã tạo dữ liệu demo: ${users.length} người dùng (mật khẩu ${DEMO_PASSWORD}), ` +
      `${recipes.length} công thức, ${DEMO_COMMENTS.length} bình luận`
  );
}

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('Thiếu cấu hình MONGO_URI trong server/.env');
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri);
  await seedAdmin();
  await seedCategories();
  if (process.argv.includes('--demo')) await seedDemo();
  console.log('Seed xong.');
} catch (err) {
  console.error('Seed lỗi:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
