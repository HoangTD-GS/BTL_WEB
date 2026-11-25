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
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import type { IconName } from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/useAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import { toast } from '../store/useToastStore';
import type { Comment, RecipeDetails } from '../types';
import { getErrorMessage } from '../utils/errors';
import { formatCookTime, formatDate, timeAgo } from '../utils/format';
import { authorName, categoryName, isOwner, recipeAuthor, recipeCategory } from '../utils/recipe';

function getCategorySlug(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('chính')) return 'main';
  if (lower.includes('canh')) return 'soup';
  if (lower.includes('chay')) return 'veg';
  if (lower.includes('tráng miệng')) return 'dessert';
  if (lower.includes('uống')) return 'drink';
  if (lower.includes('vặt')) return 'snack';
  return 'general';
}

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

function scaleIngredient(text: string, ratio: number): string {
  if (ratio === 1) return text;
  const match = text.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return text;
  const num = parseFloat(match[1].replace(',', '.'));
  if (isNaN(num)) return text;
  const scaled = Math.round(num * ratio * 10) / 10;
  return `${scaled} ${match[2]}`.trim();
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
  const [servingsScale, setServingsScale] = useState<number | null>(null);
  const [cookingMode, setCookingMode] = useState(false);
  const [cookingStep, setCookingStep] = useState(0);

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
          <Avatar name={authorName(recipe)} />
          <span>
            Đăng bởi <strong>{author?.name ?? 'Không rõ'}</strong>
          </span>
        </span>
        <time dateTime={recipe.createdAt} title={formatDate(recipe.createdAt)}>
          {timeAgo(recipe.createdAt)}
        </time>
        {category && (
          <Link className={`recipe-badge cat-${getCategorySlug(category.name)}`} to={`/?category=${category._id}`}>
            {category.name}
          </Link>
        )}
      </div>

      <div className="action-bar no-print">
        <LikeButton recipeId={recipe._id} likes={recipe.likes} />
        <SaveButton recipeId={recipe._id} withLabel />
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setCookingStep(0);
            setCookingMode(true);
          }}
          title="Mở hướng dẫn nấu ăn từng bước toàn màn hình"
        >
          <Icon name="play" size={14} /> Chế độ nấu
        </button>
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
        <Stat icon="users" label="Khẩu phần gốc" value={`${recipe.servings} người`} />
        <Stat icon="utensils" label="Nguyên liệu" value={`${recipe.ingredients.length} loại`} />
        <Stat icon="check" label="Các bước" value={`${recipe.steps.length} bước`} />
      </div>

      {recipe.description && <p className="detail-desc">{recipe.description}</p>}

      {(() => {
        const currentServings = servingsScale ?? recipe.servings ?? 1;
        const scaleRatio = (recipe.servings && recipe.servings > 0) ? currentServings / recipe.servings : 1;
        return (
          <div className="detail-columns">
            <section className="panel" aria-labelledby="ingredients-title">
              <h2 id="ingredients-title">
                Nguyên liệu
                <small>
                  {doneIngredients.size}/{recipe.ingredients.length} đã chuẩn bị
                </small>
              </h2>

              <div className="serving-scaler-wrap no-print">
                <span className="serving-scaler-label">Khẩu phần:</span>
                <div className="serving-scaler-controls">
                  <button
                    type="button"
                    className="serving-adjust-btn"
                    onClick={() => setServingsScale(Math.max(1, currentServings - 1))}
                    aria-label="Giảm khẩu phần"
                  >
                    -
                  </button>
                  <span className="serving-val">{currentServings} người</span>
                  <button
                    type="button"
                    className="serving-adjust-btn"
                    onClick={() => setServingsScale(Math.min(30, currentServings + 1))}
                    aria-label="Tăng khẩu phần"
                  >
                    +
                  </button>
                  {scaleRatio !== 1 && (
                    <button
                      type="button"
                      className="serving-reset"
                      onClick={() => setServingsScale(recipe.servings)}
                    >
                      Đặt lại
                    </button>
                  )}
                </div>
              </div>

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
                      <span className="check-text">{scaleIngredient(item, scaleRatio)}</span>
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
        );
      })()}

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

      {/* Modal Chế độ nấu ăn */}
      <Modal
        open={cookingMode}
        title={`👨‍🍳 Chế độ nấu: ${recipe.title}`}
        onClose={() => setCookingMode(false)}
        footer={
          <div className="cooking-nav-actions" style={{ width: '100%' }}>
            <Button
              variant="secondary"
              disabled={cookingStep === 0}
              onClick={() => setCookingStep((s) => Math.max(0, s - 1))}
            >
              &larr; Bước trước
            </Button>
            <span>
              {cookingStep + 1} / {recipe.steps.length}
            </span>
            {cookingStep < recipe.steps.length - 1 ? (
              <Button
                variant="primary"
                onClick={() => {
                  setDoneSteps((s) => new Set(s).add(cookingStep));
                  setCookingStep((s) => Math.min(recipe.steps.length - 1, s + 1));
                }}
              >
                Bước tiếp &rarr;
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  setDoneSteps((s) => new Set(s).add(cookingStep));
                  toast.success('Chúc mừng bạn đã hoàn thành món ăn! 🎉');
                  setCookingMode(false);
                }}
              >
                Hoàn thành 🎉
              </Button>
            )}
          </div>
        }
      >
        <div className="cooking-assistant">
          <div className="cooking-progress-bar">
            <div
              className="cooking-progress-fill"
              style={{ width: `${((cookingStep + 1) / recipe.steps.length) * 100}%` }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <span className="cooking-step-badge">
              Bước {cookingStep + 1} / {recipe.steps.length}
            </span>
            <p className="cooking-step-desc">{recipe.steps[cookingStep]}</p>
            <Button
              variant={doneSteps.has(cookingStep) ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setDoneSteps((s) => toggleIn(s, cookingStep))}
            >
              <Icon name="check" size={14} />
              {doneSteps.has(cookingStep) ? 'Đã đánh dấu hoàn thành' : 'Đánh dấu xong bước này'}
            </Button>
          </div>
        </div>
      </Modal>

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
