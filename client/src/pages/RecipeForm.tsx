import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function RecipeForm() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingEdit, setFetchingEdit] = useState(isEditing);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEditing || !id) {
      setFetchingEdit(false);
      return;
    }

    const token = localStorage.getItem('token');
    setFetchingEdit(true);
    setError('');

    fetch(`http://localhost:5000/api/recipes/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Lỗi khi tải thông tin công thức.');
        }
        return data;
      })
      .then((data) => {
        const item = data?.recipe || data?.data || data;
        setTitle(item.title || '');
        setDescription(item.description || '');
        setIngredients(
          Array.isArray(item.ingredients)
            ? item.ingredients.join('\n')
            : item.ingredients || ''
        );
        const rawSteps = item.steps ?? item.instructions ?? '';
        setSteps(Array.isArray(rawSteps) ? rawSteps.join('\n') : String(rawSteps));
        setCategory(item.category ?? item.categoryName ?? '');
        setImageUrl(item.image ?? item.imageUrl ?? '');
      })
      .catch((err: any) => {
        console.error('Lỗi khi tải thông tin công thức:', err);
        setError(err.message || 'Không tải được thông tin công thức để sửa.');
      })
      .finally(() => {
        setFetchingEdit(false);
      });
  }, [isEditing, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Bạn chưa đăng nhập! Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    const parsedIngredients = ingredients
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedSteps = steps
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const trimmedCategory = category.trim();
    const trimmedImage = imageUrl.trim();

    const payload = {
      title: title.trim(),
      description: description.trim(),
      ingredients: parsedIngredients,
      steps: parsedSteps,
      category: trimmedCategory,
      image: trimmedImage,
      imageUrl: trimmedImage,
    };

    const endpoint = isEditing
      ? `http://localhost:5000/api/recipes/${id}`
      : 'http://localhost:5000/api/recipes';

    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Không thể lưu công thức!');
      }

      alert(isEditing ? 'Cập nhật công thức thành công!' : 'Đăng món ăn thành công!');
      navigate('/my-recipes');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #E0DCD0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    background: '#FAFAFA',
    color: '#4A2E1B',
    outline: 'none',
  };

  if (fetchingEdit) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#FDFBF7',
          padding: '40px 20px',
          textAlign: 'center',
          color: '#4A2E1B',
          fontFamily: 'sans-serif',
        }}
      >
        Đang tải thông tin công thức...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FDFBF7',
        padding: '40px 20px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '750px',
          margin: '0 auto',
          padding: '35px',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(74, 46, 27, 0.08)',
          border: '1px solid #F3EFE6',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            borderBottom: '2px solid #FEF9E7',
            paddingBottom: '12px',
          }}
        >
          <h2 style={{ margin: 0, color: '#4A2E1B', fontWeight: '700' }}>
            {isEditing ? '✏️ Chỉnh Sửa Công Thức Món Ăn' : '🍳 Đăng Công Thức Nấu Ăn Mới'}
          </h2>

          <button
            type="button"
            onClick={() => navigate('/my-recipes')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #E0DCD0',
              background: '#FAFAFA',
              color: '#4A2E1B',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Hủy
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px',
              background: '#FDF2F2',
              color: '#C92A2A',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              border: '1px solid #F8D7DA',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#4A2E1B',
              }}
            >
              Tên món ăn
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={fieldStyle}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#4A2E1B',
              }}
            >
              Mô tả ngắn
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              required
              style={fieldStyle}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#4A2E1B',
              }}
            >
              Nguyên liệu (Mỗi dòng một nguyên liệu)
            </label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={4}
              required
              style={fieldStyle}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#4A2E1B',
              }}
            >
              Các bước thực hiện (Mỗi dòng một bước)
            </label>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              rows={5}
              required
              style={fieldStyle}
              placeholder="Mỗi dòng là một bước"
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '18px' }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600',
                  color: '#4A2E1B',
                }}
              >
                Danh mục
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={fieldStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600',
                  color: '#4A2E1B',
                }}
              >
                Link hình ảnh món ăn
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={fieldStyle}
              />
            </div>
          </div>

          {imageUrl.trim() && (
            <div style={{ marginBottom: '22px' }}>
              <img
                src={imageUrl.trim()}
                alt="Xem trước món ăn"
                style={{
                  width: '100%',
                  maxHeight: '220px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  border: '1px solid #E0DCD0',
                  display: 'block',
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: '#E67E22',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(230, 126, 34, 0.2)',
              transition: 'background 0.2s',
            }}
          >
            {loading
              ? 'Đang lưu...'
              : isEditing
                ? 'Cập Nhật Công Thức'
                : 'Đăng Bài Viết Ngay'}
          </button>
        </form>
      </div>
    </div>
  );
}