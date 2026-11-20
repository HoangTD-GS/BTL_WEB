import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { RecipeListItem } from '../../types';
import { formatCookTime } from '../../utils/format';
import { authorName, categoryName, recipeCategory } from '../../utils/recipe';
import Avatar from '../ui/Avatar';
import Icon from '../ui/Icon';
import { LikeButton, SaveButton } from './LikeSaveButtons';
import RecipeImage from './RecipeImage';

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

interface RecipeCardProps {
  recipe: RecipeListItem;
  /** Nút riêng của trang (ví dụ Sửa/Xóa ở "Công thức của tôi") */
  actions?: ReactNode;
  onSaveChange?: (saved: boolean) => void;
}

export default function RecipeCard({ recipe, actions, onSaveChange }: RecipeCardProps) {
  const href = `/recipes/${recipe._id}`;
  const category = recipeCategory(recipe);
  const categorySlug = category ? getCategorySlug(category.name) : 'general';
  const author = authorName(recipe);
  const isHot = (recipe.likes?.length ?? 0) >= 2;
  const difficulty =
    recipe.cookTime <= 0
      ? null
      : recipe.cookTime <= 25
      ? { label: 'Dễ làm', cls: 'diff-easy' }
      : recipe.cookTime <= 60
      ? { label: 'Vừa sức', cls: 'diff-medium' }
      : { label: 'Cầu kỳ', cls: 'diff-hard' };

  return (
    <article className={`recipe-card cat-${categorySlug}`}>
      <Link to={href} className="recipe-card-media" tabIndex={-1} aria-hidden="true">
        <RecipeImage src={recipe.image} title={recipe.title} seed={categoryName(recipe)} decorative />
        <div className="card-badge-row">
          {category && (
            <span className={`recipe-badge cat-${categorySlug}`}>
              {category.name}
            </span>
          )}
          {difficulty && <span className={`recipe-badge ${difficulty.cls}`}>{difficulty.label}</span>}
          {isHot && (
            <span className="recipe-badge badge-hot">
              <Icon name="flame" size={12} /> Phổ biến
            </span>
          )}
        </div>
        <div className="card-media-overlay" />
      </Link>
      <div className="recipe-card-body">
        <span className="recipe-author">
          <Avatar name={author} size="sm" />
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
