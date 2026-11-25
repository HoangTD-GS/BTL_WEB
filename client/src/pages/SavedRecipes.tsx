import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listSavedRecipes } from '../api/recipes';
import RecipeCard from '../components/recipe/RecipeCard';
import RecipeGrid, { RecipeGridSkeleton } from '../components/recipe/RecipeGrid';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { usePageTitle } from '../hooks/usePageTitle';
import { useRecipeStore } from '../store/useRecipeStore';
import type { RecipeListItem } from '../types';
import { getErrorMessage } from '../utils/errors';

export default function SavedRecipes() {
  usePageTitle('Công thức đã lưu');
  const setSaved = useRecipeStore((s) => s.setSaved);
  const [recipes, setRecipes] = useState<RecipeListItem[] | null>(null);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listSavedRecipes()
      .then((res) => {
        if (cancelled) return;
        setRecipes(res);
        setError('');
        res.forEach((r) => setSaved(r._id, true)); // để nút "Lưu" trên thẻ hiển thị đúng ngay
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [version, setSaved]);

  // Bỏ lưu thì thẻ biến mất khỏi trang ngay
  const removeFromList = (id: string) => setRecipes((list) => (list ?? []).filter((r) => r._id !== id));

  return (
    <div>
      <div className="page-header">
        <h1>Công thức đã lưu</h1>
        {recipes && recipes.length > 0 && <p className="page-sub">{recipes.length} công thức trong bộ sưu tập của bạn</p>}
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
          icon="bookmark"
          title="Bạn chưa lưu công thức nào"
          actions={
            <Link to="/" className="btn btn-primary">
              Khám phá công thức
            </Link>
          }
        >
          Bấm biểu tượng đánh dấu trên một công thức để lưu lại và xem sau.
        </EmptyState>
      ) : (
        <RecipeGrid>
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              onSaveChange={(saved) => {
                if (!saved) removeFromList(recipe._id);
              }}
            />
          ))}
        </RecipeGrid>
      )}
    </div>
  );
}
