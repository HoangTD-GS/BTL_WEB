import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listCategories } from '../api/admin';
import { createRecipe, getRecipe, updateRecipe } from '../api/recipes';
import type { Category } from '../types';
import { getErrorMessage } from '../utils/errors';

export default function RecipeForm() {
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const categoryItems = await listCategories();
        if (active) setCategories(categoryItems);
        if (id) {
          const { recipe } = await getRecipe(id);
          if (!active) return;
          setTitle(recipe.title);
          setDescription(recipe.description);
          setIngredients(recipe.ingredients.join('\n'));
          setSteps(recipe.steps.join('\n'));
          setImage(recipe.image);
          setCategory(typeof recipe.category === 'string' ? recipe.category : recipe.category?._id ?? '');
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [id]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    const input = {
      title: title.trim(),
      description: description.trim(),
      ingredients: ingredients.split('\n').map((item) => item.trim()).filter(Boolean),
      steps: steps.split('\n').map((step) => step.trim()).filter(Boolean),
      image: image.trim(),
      category: category || undefined,
    };

    try {
      const recipe = id ? await updateRecipe(id, input) : await createRecipe(input);
      navigate(`/recipes/${recipe._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Đang tải công thức...</p>;

  return (
    <section className="form-card">
      <h1>{editing ? 'Sửa công thức' : 'Đăng công thức'}</h1>
      {error && <p className="form-error" role="alert">{error}</p>}
      <form className="form-grid" onSubmit={submit}>
        <label>
          Tên món ăn
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Mô tả
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </label>
        <label>
          Nguyên liệu (mỗi dòng một mục)
          <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} required />
        </label>
        <label>
          Các bước thực hiện (mỗi dòng một bước)
          <textarea value={steps} onChange={(e) => setSteps(e.target.value)} required />
        </label>
        <label>
          Danh mục
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Chưa phân loại</option>
            {categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </select>
        </label>
        <label>
          Đường dẫn hình ảnh
          <input type="url" value={image} onChange={(e) => setImage(e.target.value)} />
        </label>
        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Đăng công thức'}
        </button>
      </form>
    </section>
  );
}
