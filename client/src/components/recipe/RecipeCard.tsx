import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { RecipeListItem } from '../../types';
import { formatCookTime, initials } from '../../utils/format';
import { authorName, categoryName, recipeCategory } from '../../utils/recipe';
import Icon from '../ui/Icon';
import { LikeButton, SaveButton } from './LikeSaveButtons';
import RecipeImage from './RecipeImage';

interface RecipeCardProps {
  recipe: RecipeListItem;
  /** Nút riêng của trang (ví dụ Sửa/Xóa ở "Công thức của tôi") */
  actions?: ReactNode;
  onSaveChange?: (saved: boolean) => void;
}

export default function RecipeCard({ recipe, actions, onSaveChange }: RecipeCardProps) {
  const href = `/recipes/${recipe._id}`;
  const category = recipeCategory(recipe);
  const author = authorName(recipe);
  return (
    <article className="recipe-card">
      <Link to={href} className="recipe-card-media" tabIndex={-1} aria-hidden="true">
        <RecipeImage src={recipe.image} title={recipe.title} seed={categoryName(recipe)} decorative />
        {category && <span className="recipe-badge">{category.name}</span>}
      </Link>
      <div className="recipe-card-body">
        <span className="recipe-author">
          <span className="avatar avatar-sm">{initials(author)}</span>
          <span>{author}</span>
        </span>
        <h3>
          <Link to={href}>{recipe.title}</Link>
        </h3>
        {recipe.description && <p className="line-clamp-2">{recipe.description}</p>}
        <div className="recipe-meta">
          {recipe.cookTime > 0 && (
            <span>
              <Icon name="clock" size={14} /> {formatCookTime(recipe.cookTime, true)}
            </span>
          )}
          <span>
            <Icon name="users" size={14} /> {recipe.servings} người
          </span>
        </div>
        <div className="recipe-card-footer">
          <LikeButton recipeId={recipe._id} likes={recipe.likes} />
          <span className="recipe-comments" title={`${recipe.commentCount} bình luận`}>
            <Icon name="message" size={15} /> {recipe.commentCount}
          </span>
          <span className="spacer" />
          <SaveButton recipeId={recipe._id} onChange={onSaveChange} />
        </div>
      </div>
      {actions && <div className="card-owner-actions">{actions}</div>}
    </article>
  );
}
