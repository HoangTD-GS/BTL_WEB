import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listCategories } from '../api/admin';
import { createRecipe, getRecipe, updateRecipe } from '../api/recipes';
import ListEditor from '../components/recipe/ListEditor';
import { newItem } from '../components/recipe/listItems';
import type { ListItem } from '../components/recipe/listItems';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import Textarea from '../components/ui/Textarea';
import { useAuth } from '../context/useAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import { toast } from '../store/useToastStore';
import type { Category } from '../types';
import { getErrorMessage } from '../utils/errors';
import { isOwner, recipeCategory } from '../utils/recipe';

type Errors = Partial<Record<'title' | 'description' | 'cookTime' | 'servings' | 'image' | 'ingredients' | 'steps', string>>;

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

function ImagePreview({ url }: { url: string }) {
  const [failedUrl, setFailedUrl] = useState('');
  const trimmed = url.trim();
  const valid = isHttpUrl(trimmed);
  return (
    <div className="image-preview">
      {valid && failedUrl !== trimmed ? (
        <img src={trimmed} alt="Xem trước ảnh món ăn" onError={() => setFailedUrl(trimmed)} />
      ) : (
        <div className="preview-empty">
          <Icon name="image" size={28} />
          <span>{valid ? 'Không tải được ảnh từ đường dẫn này' : 'Ảnh xem trước sẽ hiện ở đây'}</span>
        </div>
      )}
    </div>
  );
}

const toItems = (texts: string[]): ListItem[] => (texts.length ? texts.map((t) => newItem(t)) : [newItem()]);

export default function RecipeForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  usePageTitle(editing ? 'Sửa công thức' : 'Đăng công thức');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('2');
  const [ingredients, setIngredients] = useState<ListItem[]>(() => [newItem()]);
  const [steps, setSteps] = useState<ListItem[]>(() => [newItem()]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [loadingRecipe, setLoadingRecipe] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  // Sửa công thức: nạp dữ liệu hiện có
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getRecipe(id)
      .then(({ recipe }) => {
        if (cancelled) return;
        if (!isOwner(recipe, user?._id)) {
          toast.error('Bạn không có quyền sửa công thức này');
          navigate(`/recipes/${id}`, { replace: true });
          return;
        }
        setTitle(recipe.title);
        setDescription(recipe.description ?? '');
        setCategory(recipeCategory(recipe)?._id ?? '');
        setImage(recipe.image ?? '');
        setCookTime(recipe.cookTime ? String(recipe.cookTime) : '');
        setServings(String(recipe.servings || 1));
        setIngredients(toItems(recipe.ingredients));
        setSteps(toItems(recipe.steps));
        setLoadingRecipe(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        toast.error(getErrorMessage(err));
        navigate('/my-recipes', { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, [id, user?._id, navigate]);

  // Cảnh báo khi đóng tab lúc đang nhập dở
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const edit =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setDirty(true);
    };

  const validate = (): Errors => {
    const e: Errors = {};
    const t = title.trim();
    if (t.length < 3 || t.length > 120) e.title = 'Tên món ăn phải từ 3 đến 120 ký tự';
    if (description.trim().length > 1000) e.description = 'Mô tả tối đa 1000 ký tự';
    if (!ingredients.some((i) => i.text.trim())) e.ingredients = 'Vui lòng nhập ít nhất một nguyên liệu';
    if (!steps.some((s) => s.text.trim())) e.steps = 'Vui lòng nhập ít nhất một bước thực hiện';
    const time = cookTime.trim() === '' ? 0 : Number(cookTime);
    if (!Number.isInteger(time) || time < 0 || time > 1440) e.cookTime = 'Nhập số phút từ 0 đến 1440';
    const people = Number(servings);
    if (!Number.isInteger(people) || people < 1 || people > 100) e.servings = 'Nhập số người từ 1 đến 100';
    if (image.trim() && !isHttpUrl(image.trim())) e.image = 'Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://';
    return e;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError('');
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // đưa con trỏ tới ô lỗi đầu tiên
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      ingredients: ingredients.map((i) => i.text.trim()).filter(Boolean),
      steps: steps.map((s) => s.text.trim()).filter(Boolean),
      image: image.trim(),
      cookTime: cookTime.trim() === '' ? 0 : Number(cookTime),
      servings: Number(servings),
      category,
    };

    setSaving(true);
    try {
      const saved = id ? await updateRecipe(id, payload) : await createRecipe(payload);
      setDirty(false);
      toast.success(id ? 'Đã lưu thay đổi' : 'Đã đăng công thức');
      navigate(`/recipes/${saved._id}`);
    } catch (err) {
      setServerError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loadingRecipe) return <Spinner label="Đang tải công thức..." />;

  return (
    <form className="recipe-form" onSubmit={submit} noValidate>
      <div className="page-header">
        <h1>{editing ? 'Sửa công thức' : 'Đăng công thức mới'}</h1>
        <p className="page-sub">Điền càng đầy đủ, mọi người càng dễ nấu theo.</p>
      </div>

      {serverError && (
        <div style={{ marginBottom: 16 }}>
          <Alert type="error">{serverError}</Alert>
        </div>
      )}

      <section className="form-section" aria-labelledby="basic-title">
        <h2 id="basic-title">Thông tin cơ bản</h2>
        <Input
          label="Tên món ăn *"
          placeholder="Ví dụ: Phở bò Hà Nội"
          value={title}
          maxLength={120}
          error={errors.title}
          autoFocus={!editing}
          onChange={(e) => edit(setTitle)(e.target.value)}
        />
        <Textarea
          label="Mô tả ngắn"
          placeholder="Món này có gì đặc biệt? Hợp với dịp nào?"
          value={description}
          maxLength={1000}
          error={errors.description}
          onChange={(e) => edit(setDescription)(e.target.value)}
        />
        <div className="form-two">
          <Select label="Danh mục" value={category} onChange={(e) => edit(setCategory)(e.target.value)}>
            <option value="">— Chưa phân loại —</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
          <div className="form-two">
            <Input
              label="Thời gian nấu (phút)"
              type="number"
              inputMode="numeric"
              min={0}
              max={1440}
              placeholder="30"
              value={cookTime}
              error={errors.cookTime}
              onChange={(e) => edit(setCookTime)(e.target.value)}
            />
            <Input
              label="Khẩu phần (người)"
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              value={servings}
              error={errors.servings}
              onChange={(e) => edit(setServings)(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="form-section" aria-labelledby="image-title">
        <h2 id="image-title">Hình ảnh</h2>
        <Input
          label="Đường dẫn ảnh (không bắt buộc)"
          type="url"
          inputMode="url"
          placeholder="https://..."
          value={image}
          error={errors.image}
          hint="Dán link ảnh món ăn. Bỏ trống thì hệ thống dùng ảnh nền mặc định."
          onChange={(e) => edit(setImage)(e.target.value)}
        />
        <ImagePreview url={image} />
      </section>

      <section className="form-section" aria-labelledby="ingredients-title">
        <h2 id="ingredients-title">Nguyên liệu *</h2>
        <ListEditor
          label="Nguyên liệu"
          items={ingredients}
          onChange={edit(setIngredients)}
          placeholder="Ví dụ: 300g thịt bò"
          addLabel="Thêm nguyên liệu"
          maxLength={200}
          error={errors.ingredients}
          hint="Nhấn Enter để thêm dòng mới."
        />
      </section>

      <section className="form-section" aria-labelledby="steps-title">
        <h2 id="steps-title">Cách làm *</h2>
        <ListEditor
          label="Bước"
          items={steps}
          onChange={edit(setSteps)}
          placeholder="Mô tả bước"
          addLabel="Thêm bước"
          multiline
          numbered
          maxLength={1000}
          error={errors.steps}
        />
      </section>

      <div className="form-actions">
        <Button variant="secondary" onClick={() => navigate(-1)} disabled={saving}>
          Hủy
        </Button>
        <Button type="submit" loading={saving}>
          {editing ? 'Lưu thay đổi' : 'Đăng công thức'}
        </Button>
      </div>
    </form>
  );
}
