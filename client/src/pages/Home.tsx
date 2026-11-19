import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listRecipes } from '../api/recipes';
import type { Recipe } from '../types';
import { getErrorMessage } from '../utils/errors';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    listRecipes()
      .then((items) => {
        if (active) setRecipes(items);
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
  }, []);

  if (loading) return <p>Đang tải công thức...</p>;

  return (
    <section>
      <div className="page-header">
        <h1>Khám phá công thức</h1>
        <p>Chia sẻ và tìm cảm hứng cho món ăn tiếp theo của bạn.</p>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {!error && recipes.length === 0 ? (
        <p>Chưa có công thức nào được đăng.</p>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <article className="recipe-card" key={recipe._id}>
              {recipe.image && <img src={recipe.image} alt={recipe.title} loading="lazy" />}
              <div className="recipe-card-body">
                <h2><Link to={`/recipes/${recipe._id}`}>{recipe.title}</Link></h2>
                <p>{recipe.description}</p>
                <span className="muted">
                  {typeof recipe.category === 'object' && recipe.category ? recipe.category.name : 'Chưa phân loại'}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
