import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';

interface CommentItem {
  _id: string;
  content: string;
  user?: {
    _id?: string;
    name?: string;
  };
  authorName?: string;
  createdAt?: string;
}

interface RecipeDetailData {
  _id: string;
  title: string;
  description: string;
  ingredients?: unknown;
  steps?: unknown;
  instructions?: unknown;
  cookingSteps?: unknown;
  cooking_steps?: unknown;
  method?: unknown;
  procedure?: unknown;
  stepsList?: unknown;
  category?: string;
  image?: string;
  imageUrl?: string;
  likes?: string[] | number;
  likesCount?: number;
  commentsCount?: number;
  userId?: string;
  author?: string | { _id?: string; name?: string };
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<RecipeDetailData | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/recipes/${id}`);
        const data: RecipeDetailData = res.data?.recipe || res.data?.data || res.data;
        setRecipe(data);

        const rawLikes = data.likes;
        const likesArray = Array.isArray(rawLikes) ? rawLikes : [];
        const count =
          typeof data.likesCount === 'number'
            ? data.likesCount
            : typeof rawLikes === 'number'
              ? rawLikes
              : likesArray.length;
        setLikeCount(count);
        setLiked(Boolean(user?._id && likesArray.includes(user._id)));

        const commentRes = await api.get(`/comments/${id}`).catch(() => ({ data: [] }));
        const listComments: CommentItem[] = Array.isArray(commentRes.data)
          ? commentRes.data
          : commentRes.data?.comments || [];
        setComments(listComments);
        setTotalComments(
          typeof data.commentsCount === 'number' ? data.commentsCount : listComments.length
        );
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không tải được chi tiết món ăn!');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, user?._id]);

  const isOwner = Boolean(
    user?._id &&
      recipe &&
      ((recipe.userId && recipe.userId === user._id) ||
        (typeof recipe.author === 'string' && recipe.author === user._id) ||
        (typeof recipe.author === 'object' && recipe.author?._id === user._id))
  );

  const handleToggleLike = async () => {
    if (!id || isOwner) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để thả thích công thức!');
      navigate('/login');
      return;
    }

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await api.post(`/recipes/${id}/like`);
    } catch {
      setLiked(!nextLiked);
      setLikeCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim() || isOwner) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để bình luận!');
      navigate('/login');
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await api.post(`/comments/${id}`, { content: newComment.trim() });
      const created: CommentItem = res.data?.comment || res.data || {
        _id: String(Date.now()),
        content: newComment.trim(),
        user: { _id: user?._id, name: user?.name || 'Bạn' },
      };
      setComments((prev) => [created, ...prev]);
      setTotalComments((prev) => prev + 1);
      setNewComment('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gửi bình luận thất bại!');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Xóa bình luận này?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setTotalComments((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không xóa được bình luận!');
    }
  };

  const extractLines = (value: unknown): string[] => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === 'string' || typeof item === 'number') {
            return String(item).trim();
          }
          if (item && typeof item === 'object') {
            const obj = item as Record<string, unknown>;
            return String(
              obj.step ?? obj.content ?? obj.text ?? obj.description ?? obj.title ?? ''
            ).trim();
          }
          return '';
        })
        .filter(Boolean);
    }

    if (typeof value === 'string') {
      return value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    }

    return [];
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#FDFBF7',
          padding: '40px 20px',
          textAlign: 'center',
          color: '#4A2E1B',
        }}
      >
        Đang tải chi tiết công thức...
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#FDFBF7',
          padding: '40px 20px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: '#C92A2A', fontWeight: 600 }}>
          {error || 'Không tìm thấy món ăn.'}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 18px',
            background: '#E67E22',
            color: '#FFF',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Quay lại
        </button>
      </div>
    );
  }

  const recipeRecord = recipe as unknown as Record<string, unknown>;
  const displayImage = String(
    recipe.image || recipe.imageUrl || recipeRecord.thumbnail || ''
  ).trim();
  const displayCategory = String(
    recipe.category || recipeRecord.categoryName || ''
  ).trim();

  const ingredientLines = extractLines(recipe.ingredients);
  const stepLines = extractLines(
    recipe.steps ??
      recipe.instructions ??
      recipe.cookingSteps ??
      recipe.cooking_steps ??
      recipe.method ??
      recipe.procedure ??
      recipe.stepsList
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FDFBF7',
        padding: '40px 20px',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              background: '#FFFFFF',
              color: '#4A2E1B',
              border: '1px solid #E0DCD0',
              borderRadius: '8px',
              padding: '8px 14px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            &larr; Quay lại
          </button>

          {isOwner && (
            <Link
              to={`/recipes/edit/${recipe._id}`}
              style={{
                background: '#FEF9E7',
                color: '#4A2E1B',
                border: '1px solid #F3E2C7',
                borderRadius: '8px',
                padding: '8px 16px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              ✏️ Sửa công thức
            </Link>
          )}
        </div>

        {/* Thẻ chi tiết món ăn */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #F3EFE6',
            boxShadow: '0 6px 20px rgba(74, 46, 27, 0.06)',
            marginBottom: '24px',
            textAlign: 'left',
          }}
        >
          {displayImage && (
            <img
              src={displayImage}
              alt={recipe.title}
              style={{
                width: '100%',
                maxHeight: '360px',
                objectFit: 'cover',
                display: 'block',
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}

          <div style={{ padding: '28px', textAlign: 'left' }}>
            {displayCategory && (
              <span
                style={{
                  display: 'inline-block',
                  background: '#FEF9E7',
                  color: '#E67E22',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '10px',
                }}
              >
                {displayCategory}
              </span>
            )}

            <h1
              style={{
                margin: '0 0 12px 0',
                color: '#4A2E1B',
                fontSize: '26px',
                fontWeight: 700,
                textAlign: 'left',
              }}
            >
              {recipe.title}
            </h1>

            <p
              style={{
                margin: '0 0 22px 0',
                color: '#555',
                fontSize: '15px',
                lineHeight: 1.6,
                textAlign: 'left',
              }}
            >
              {recipe.description}
            </p>

            {/* Nguyên liệu */}
            <div style={{ marginBottom: '22px', textAlign: 'left' }}>
              <h3
                style={{
                  margin: '0 0 10px 0',
                  color: '#4A2E1B',
                  fontSize: '17px',
                  fontWeight: 700,
                  textAlign: 'left',
                }}
              >
                Nguyên liệu
              </h3>
              {ingredientLines.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {ingredientLines.map((line, idx) => (
                    <div
                      key={idx}
                      style={{
                        color: '#4A2E1B',
                        fontSize: '14px',
                        lineHeight: 1.5,
                        textAlign: 'left',
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, color: '#888', fontSize: '14px', textAlign: 'left' }}>
                  Chưa cập nhật nguyên liệu.
                </p>
              )}
            </div>

            {/* Các bước thực hiện */}
            <div style={{ marginBottom: '22px', textAlign: 'left' }}>
              <h3
                style={{
                  margin: '0 0 10px 0',
                  color: '#4A2E1B',
                  fontSize: '17px',
                  fontWeight: 700,
                  textAlign: 'left',
                }}
              >
                Các bước thực hiện
              </h3>
              {stepLines.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {stepLines.map((line, idx) => (
                    <div
                      key={idx}
                      style={{
                        color: '#4A2E1B',
                        fontSize: '14px',
                        lineHeight: 1.6,
                        textAlign: 'left',
                      }}
                    >
                      <strong>Bước {idx + 1}:</strong> {line}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, color: '#888', fontSize: '14px', textAlign: 'left' }}>
                  Chưa có các bước thực hiện cho món này.
                </p>
              )}
            </div>

            {/* Thống kê lượt thích */}
            <div
              style={{
                borderTop: '1px solid #F3EFE6',
                paddingTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              {isOwner ? (
                <span
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: '#FDFBF7',
                    border: '1px solid #F3EFE6',
                    color: '#4A2E1B',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  🧡 Lượt thích: {likeCount}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleLike}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: liked ? '1px solid #E67E22' : '1px solid #E0DCD0',
                    background: liked ? '#E67E22' : '#FAFAFA',
                    color: liked ? '#FFFFFF' : '#4A2E1B',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {liked ? '🧡 Đã thích' : '🤍 Thích'} ({likeCount})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Khối Bình luận */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px 28px',
            border: '1px solid #F3EFE6',
            boxShadow: '0 6px 20px rgba(74, 46, 27, 0.06)',
            textAlign: 'left',
          }}
        >
          <h3
            style={{
              margin: '0 0 16px 0',
              color: '#4A2E1B',
              fontSize: '18px',
              fontWeight: 700,
              textAlign: 'left',
            }}
          >
            Bình luận ({totalComments})
          </h3>

          {!isOwner && (
            <form
              onSubmit={handleAddComment}
              style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}
            >
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết cảm nghĩ hoặc mẹo nấu món này..."
                style={{
                  flex: 1,
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid #E0DCD0',
                  background: '#FAFAFA',
                  color: '#4A2E1B',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={submittingComment}
                style={{
                  padding: '11px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#E67E22',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {submittingComment ? 'Đang gửi...' : 'Gửi'}
              </button>
            </form>
          )}

          {comments.length === 0 ? (
            <p style={{ color: '#777', fontSize: '14px', margin: 0, textAlign: 'left' }}>
              {isOwner
                ? 'Chưa có bình luận nào trên công thức của bạn.'
                : 'Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ!'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {comments.map((cmt) => {
                const authorName = cmt.user?.name || cmt.authorName || 'Người dùng';
                const canDelete = Boolean(user?._id && cmt.user?._id === user._id);
                return (
                  <div
                    key={cmt._id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: '#FDFBF7',
                      border: '1px solid #F3EFE6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: '#4A2E1B',
                          fontSize: '13px',
                          marginBottom: '4px',
                        }}
                      >
                        {authorName}
                      </div>
                      <div style={{ color: '#4A2E1B', fontSize: '14px' }}>
                        {cmt.content}
                      </div>
                    </div>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(cmt._id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#C92A2A',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}