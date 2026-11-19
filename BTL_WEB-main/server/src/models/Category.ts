import mongoose, { type InferSchemaType } from 'mongoose';

const categorySchema = new mongoose.Schema(
  { name: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true }
);

export type Category = InferSchemaType<typeof categorySchema>;

export default mongoose.model<Category>('Category', categorySchema);
