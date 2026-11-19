import mongoose, { type InferSchemaType } from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, trim: true },
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export type Comment = InferSchemaType<typeof commentSchema>;

export default mongoose.model<Comment>('Comment', commentSchema);
