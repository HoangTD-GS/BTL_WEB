import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('Thiếu cấu hình MONGO_URI');
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB đã kết nối');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Lỗi kết nối MongoDB:', message);
    process.exit(1);
  }
};

export default connectDB;
