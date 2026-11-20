import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteRecipe, getRecipe } from '../api/recipes';
import CommentSection from '../components/recipe/CommentSection';
import { LikeButton, SaveButton } from '../components/recipe/LikeSaveButtons';
import RecipeCard from '../components/recipe/RecipeCard';
import RecipeGrid from '../components/recipe/RecipeGrid';
import RecipeImage from '../components/recipe/RecipeImage';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import type { IconName } from '../components/ui/Icon';
import { useAuth } from '../context/useAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import { toast } from '../store/useToastStore';
import type { Comment, RecipeDetails } from '../types';
import { getErrorMessage } from '../utils/errors';
import { formatCookTime, formatDate, initials, timeAgo } from '../utils/format';
import { authorName, categoryName, isOwner, recipeAuthor, recipeCategory } from '../utils/recipe';

export default function RecipeDetail() {
  const { id = '' } = useParams();
  // key: chuyển sang công thức khác thì dựng lại toàn bộ trạng thái (tick, bình luận...)
  return <RecipeDetailContent key={id} id={id} />;
}

function Stat({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="stat-tile">
      <span className="icon-wrap">
        <Icon name={icon} size={18} />
      </span>
      <div>
        <strong>{value}</strong>
        <span className="label">{label}</span>
      </div>
    </div>
  );
}

function toggleIn(set: Set<number>, index: number): Set<number> {
  const next = new Set(set);
  if (next.has(index)) next.delete(index);
  else next.add(index);
  return next;
}

function RecipeDetailContent({ id }: { id: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [details, setDetails] = useState<RecipeDetails | null>(null);
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null);
  const [version, setVersion] = useState(0);
  const [doneIngredients, setDoneIngredients] = useState<Set<number>>(new Set());
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  usePageTitle(details?.recipe.title ?? (error ? 'Không tìm thấy công thức' : undefined));

  useEffect(() => {
    let cancelled = false;
    getRecipe(id)
      .then((res) => {
        if (!cancelled) {
          setDetails(res);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        setError({ message: getErrorMessage(err), notFound: status === 404 || status === 400 });
      });
    return () => {
      cancelled = true;
    };
  }, [id, version]);

  if (error) {
    return error.notFound ? (
      <EmptyState
        icon="search"
        title="Không tìm thấy công thức"
        actions={
          <Link to="/" className="btn btn-primary">
            Khám phá công thức khác
          </Link>
        }
      >
        Công thức này có thể đã bị xóa hoặc đường dẫn không đúng.
      </EmptyState>
    ) : (
      <div className="stack">
        <Alert type="error">{error.message}</Alert>
        <div>
          <Button variant="secondary" size="sm" onClick={() => setVersion((v) => v + 1)}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="recipe-detail" role="status" aria-label="Đang tải công thức">
        <div className="skeleton" style={{ height: 36, width: '60%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 20, width: '35%', marginBottom: 20 }} />
        <div className="skeleton detail-hero" />
      </div>
    );
  }

  const { recipe, comments, related } = details;
  const author = recipeAuthor(recipe);
  const category = recipeCategory(recipe);
  const owner = isOwner(recipe, user?._id);

  const setComments = (next: Comment[]) => setDetails({ ...details, comments: next });

  const share = async () => {
    const url = window.location.href;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: recipe.title, url });
      } catch {
        /* người dùng đóng hộp thoại chia sẻ */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép liên kết công thức');
    } catch {
      toast.error('Không sao chép được liên kết');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteRecipe(recipe._id);
      toast.success(`Đã xóa "${recipe.title}"`);
      navigate('/my-recipes', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setConfirmingDelete(false);
    }
  };

  return (
    <article className="recipe-detail">
      <nav className="breadcrumb no-print" aria-label="Đường dẫn">
        <Link to="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        {category && (
          <>
            <Link to={`/?category=${category._id}`}>{category.name}</Link>
            <span aria-hidden="true">/</span>
          </>
        )}
        <span aria-current="page">{recipe.title}</span>
      </nav>

      <h1 className="detail-title">{recipe.title}</h1>
      <div className="detail-byline">
        <span className="recipe-author">
          <span className="avatar">{initials(authorName(recipe))}</span>
          <span>
            Đăng bởi <strong>{author?.name ?? 'Không rõ'}</strong>
          </span>
        </span>
        <time dateTime={recipe.createdAt} title={formatDate(recipe.createdAt)}>
          {timeAgo(recipe.createdAt)}
        </time>
        {category && (
          <Link className="badge" to={`/?category=${category._id}`}>
            {category.name}
          </Link>
        )}
      </div>

      <div className="action-bar no-print">
        <LikeButton recipeId={recipe._id} likes={recipe.likes} />
        <SaveButton recipeId={recipe._id} withLabel />
        <button type="button" className="icon-btn" onClick={share}>
          <Icon name="share" size={16} /> Chia sẻ
        </button>
        <button type="button" className="icon-btn" onClick={() => window.print()}>
          <Icon name="printer" size={16} /> In
        </button>
        <span className="spacer" />
        {owner && (
          <>
            <Link to={`/recipes/edit/${recipe._id}`} className="btn btn-secondary btn-sm">
              <Icon name="edit" size={14} /> Sửa
            </Link>
            <Button variant="ghost" size="sm" className="btn-link-danger" onClick={() => setConfirmingDelete(true)}>
              <Icon name="trash" size={14} /> Xóa
            </Button>
          </>
        )}
      </div>

      <div className={`detail-hero ${recipe.image ? '' : 'is-placeholder'}`}>
        <RecipeImage src={recipe.image} title={recipe.title} seed={categoryName(recipe)} iconSize={64} />
      </div>

      <div className="stat-tiles">
        <Stat icon="clock" label="Thời gian nấu" value={formatCookTime(recipe.cookTime)} />
        <Stat icon="users" label="Khẩu phần" value={`${recipe.servings} người`} />
        <Stat icon="utensils" label="Nguyên liệu" value={`${recipe.ingredients.length} loại`} />
        <Stat icon="check" label="Các bước" value={`${recipe.steps.length} bước`} />
      </div>

      {recipe.description && <p className="detail-desc">{recipe.description}</p>}

      <div className="detail-columns">
        <section className="panel" aria-labelledby="ingredients-title">
          <h2 id="ingredients-title">
            Nguyên liệu
            <small>
              {doneIngredients.size}/{recipe.ingredients.length} đã chuẩn bị
            </small>
          </h2>
          <div className="progress no-print" aria-hidden="true">
            <div style={{ width: `${(doneIngredients.size / recipe.ingredients.length) * 100}%` }} />
          </div>
          <ul className="check-list">
            {recipe.ingredients.map((item, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="check-item"
                  aria-pressed={doneIngredients.has(index)}
                  onClick={() => setDoneIngredients((s) => toggleIn(s, index))}
                >
                  <span className="check-box">
                    <Icon name="check" size={13} strokeWidth={3} />
                  </span>
                  <span className="check-text">{item}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel" aria-labelledby="steps-title">
          <h2 id="steps-title">
            Cách làm
            <small>
              {doneSteps.size}/{recipe.steps.length} bước đã xong
            </small>
          </h2>
          <ol className="steps-list">
            {recipe.steps.map((step, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="step-item"
                  aria-pressed={doneSteps.has(index)}
                  onClick={() => setDoneSteps((s) => toggleIn(s, index))}
                >
                  <span className="step-num">{doneSteps.has(index) ? <Icon name="check" size={16} strokeWidth={3} /> : index + 1}</span>
                  <span className="step-text">{step}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <CommentSection
        recipeId={recipe._id}
        recipeAuthorId={author?._id}
        comments={comments}
        onChange={setComments}
      />

      {related.length > 0 && (
        <section className="related no-print" aria-labelledby="related-title">
          <h2 id="related-title">{category ? `Món khác trong “${category.name}”` : 'Có thể bạn cũng thích'}</h2>
          <RecipeGrid>
            {related.map((r) => (
              <RecipeCard key={r._id} recipe={r} />
            ))}
          </RecipeGrid>
        </section>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        danger
        title="Xóa công thức?"
        confirmLabel="Xóa"
        message={
          <p>
            Xóa <strong>{recipe.title}</strong>? {comments.length} bình luận của bài này cũng sẽ bị xóa. Không thể hoàn tác.
          </p>
        }
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </article>
  );
}
