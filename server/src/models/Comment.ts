import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  recipe: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>({
  recipe: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IComment>('Comment', commentSchema);