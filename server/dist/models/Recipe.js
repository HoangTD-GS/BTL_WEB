import mongoose from 'mongoose';
const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    ingredients: [{ type: String, required: true }],
    steps: [{ type: String, required: true }],
    cookTime: { type: Number, default: 0 }, // phút
    servings: { type: Number, default: 1 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
recipeSchema.index({ title: 'text', description: 'text' });
export default mongoose.model('Recipe', recipeSchema);
