import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteRecipe, listMyRecipes } from '../api/recipes';
import type { Recipe } from '../types';
import { getErrorMessage } from '../utils/errors';

export default function MyRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    listMyRecipes()
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

  const remove = async (recipe: Recipe) => {
    if (!window.confirm(`Xóa công thức "${recipe.title}"?`)) return;
    try {
      await deleteRecipe(recipe._id);
      setRecipes((current) => current.filter((item) => item._id !== recipe._id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <p>Đang tải công thức...</p>;

  return (
    <section>
      <div className="page-header">
        <h1>Công thức của tôi</h1>
        <Link className="primary-button" to="/recipes/new">Đăng công thức</Link>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {recipes.length === 0 ? (
        <p>Bạn chưa đăng công thức nào.</p>
      ) : (
        <div className="recipe-list">
          {recipes.map((recipe) => (
            <article className="recipe-card" key={recipe._id}>
              {recipe.image && <img src={recipe.image} alt={recipe.title} />}
              <h2><Link to={`/recipes/${recipe._id}`}>{recipe.title}</Link></h2>
              <p>{recipe.description}</p>
              <div className="recipe-actions">
                <Link to={`/recipes/edit/${recipe._id}`}>Sửa</Link>
                <button onClick={() => void remove(recipe)}>Xóa</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
