import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteRecipe, listMyRecipes } from '../api/recipes';
import RecipeCard from '../components/recipe/RecipeCard';
import RecipeGrid, { RecipeGridSkeleton } from '../components/recipe/RecipeGrid';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import { usePageTitle } from '../hooks/usePageTitle';
import { toast } from '../store/useToastStore';
import type { RecipeListItem } from '../types';
import { getErrorMessage } from '../utils/errors';

export default function MyRecipes() {
  usePageTitle('Công thức của tôi');
  const [recipes, setRecipes] = useState<RecipeListItem[] | null>(null);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState<RecipeListItem | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listMyRecipes()
      .then((res) => {
        if (!cancelled) {
          setRecipes(res);
          setError('');
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteRecipe(toDelete._id);
      setRecipes((list) => (list ?? []).filter((r) => r._id !== toDelete._id));
      toast.success(`Đã xóa "${toDelete.title}"`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setToDelete(null);
  };

  const totalLikes = (recipes ?? []).reduce((sum, r) => sum + r.likes.length, 0);

  return (
    <div>
      <div className="page-header with-actions">
        <div>
          <h1>Công thức của tôi</h1>
          {recipes && recipes.length > 0 && (
            <p className="page-sub">
              {recipes.length} công thức · {totalLikes} lượt thích nhận được
            </p>
          )}
        </div>
        <Link to="/recipes/new" className="btn btn-primary">
          <Icon name="plus" size={16} /> Đăng công thức mới
        </Link>
      </div>

      {error ? (
        <div className="stack">
          <Alert type="error">{error}</Alert>
          <div>
            <Button variant="secondary" size="sm" onClick={() => setVersion((v) => v + 1)}>
              Thử lại
            </Button>
          </div>
        </div>
      ) : !recipes ? (
        <RecipeGridSkeleton count={4} />
      ) : recipes.length === 0 ? (
        <EmptyState
          title="Bạn chưa đăng công thức nào"
          actions={
            <Link to="/recipes/new" className="btn btn-primary">
              Đăng công thức đầu tiên
            </Link>
          }
        >
          Chia sẻ món ngon của bạn để mọi người cùng thử.
        </EmptyState>
      ) : (
        <RecipeGrid>
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              actions={
                <>
                  <Link to={`/recipes/edit/${recipe._id}`} className="btn btn-secondary btn-sm">
                    <Icon name="edit" size={14} /> Sửa
                  </Link>
                  <Button variant="ghost" size="sm" className="btn-link-danger" onClick={() => setToDelete(recipe)}>
                    <Icon name="trash" size={14} /> Xóa
                  </Button>
                </>
              }
            />
          ))}
        </RecipeGrid>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        danger
        title="Xóa công thức?"
        confirmLabel="Xóa"
        message={
          toDelete && (
            <p>
              Xóa <strong>{toDelete.title}</strong>? {toDelete.commentCount} bình luận của bài này cũng sẽ bị xóa. Không
              thể hoàn tác.
            </p>
          )
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
