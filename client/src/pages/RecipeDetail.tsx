import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addComment, getRecipe } from '../api/recipes';
import { useAuth } from '../context/useAuth';
import type { RecipeDetails as RecipeDetailsData } from '../types';
import { getErrorMessage } from '../utils/errors';

export default function RecipeDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<RecipeDetailsData | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getRecipe(id)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: unknown) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const comment = await addComment(id, content);
      setData((current) => current && { ...current, comments: [comment, ...current.comments] });
      setContent('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Đang tải công thức...</p>;
  if (!data) return <p className="form-error" role="alert">{error || 'Không tìm thấy công thức.'}</p>;

  const { recipe, comments } = data;
  const author = typeof recipe.author === 'object' && recipe.author ? recipe.author.name : 'Không rõ';
  const category = typeof recipe.category === 'object' && recipe.category ? recipe.category.name : 'Chưa phân loại';

  return (
    <article className="recipe-detail">
      <Link to="/">← Khám phá công thức</Link>
      <h1>{recipe.title}</h1>
      <p className="muted">{category} · Tác giả: {author}</p>
      {recipe.image && <img className="recipe-detail-image" src={recipe.image} alt={recipe.title} />}
      <p>{recipe.description}</p>
      <h2>Nguyên liệu</h2>
      <ul>{recipe.ingredients.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
      <h2>Cách làm</h2>
      <ol>{recipe.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol>
      <section className="comments">
        <h2>Bình luận ({comments.length})</h2>
        {error && <p className="form-error" role="alert">{error}</p>}
        {user ? (
          <form className="form-grid" onSubmit={submitComment}>
            <label>
              Viết bình luận
              <textarea value={content} onChange={(event) => setContent(event.target.value)} required />
            </label>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Đang gửi...' : 'Gửi bình luận'}
            </button>
          </form>
        ) : (
          <p><Link to="/login">Đăng nhập</Link> để bình luận.</p>
        )}
        {comments.map((comment) => (
          <p className="comment" key={comment._id}>
            <strong>
              {typeof comment.user === 'object' && comment.user ? comment.user.name : 'Người dùng'}
            </strong>
            : {comment.content}
          </p>
        ))}
      </section>
    </article>
  );
}
