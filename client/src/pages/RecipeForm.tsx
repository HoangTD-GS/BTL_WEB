import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function RecipeForm() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing && id) {
      fetch(`http://localhost:5000/api/recipes/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setTitle(data.title || '');
          setDescription(data.description || '');
          setIngredients(Array.isArray(data.ingredients) ? data.ingredients.join('\n') : data.ingredients || '');
          setInstructions(Array.isArray(data.instructions) ? data.instructions.join('\n') : data.instructions || '');
          setCategory(data.category || '');
          setImageUrl(data.imageUrl || '');
        })
        .catch((err) => console.error('Lỗi khi tải thông tin công thức:', err));
    }
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

    const payload = {
      title,
      description,
      ingredients: ingredients.split('\n').filter(Boolean),
      instructions: instructions.split('\n').filter(Boolean),
      category,
      imageUrl,
    };

    const endpoint = isEditing 
      ? `http://localhost:5000/api/recipes/${id}` 
      : 'http://localhost:5000/api/recipes';
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Không thể lưu công thức!');
      }

      alert(isEditing ? 'Cập nhật công thức thành công!' : 'Đăng món ăn thành công!');
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FDFBF7', // Nền tổng thể Vani ấm áp
      padding: '40px 20px',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ 
        maxWidth: '750px', 
        margin: '0 auto', 
        padding: '35px', 
        background: '#FFFFFF', 
        borderRadius: '16px', 
        boxShadow: '0 8px 24px rgba(74, 46, 27, 0.08)',
        border: '1px solid #F3EFE6'
      }}>
        <h2 style={{ marginBottom: '24px', color: '#4A2E1B', fontWeight: '700', borderBottom: '2px solid #FEF9E7', paddingBottom: '12px' }}>
          {isEditing ? '✏️ Chỉnh Sửa Công Thức Món Ăn' : '🍳 Đăng Công Thức Nấu Ăn Mới'}
        </h2>

        {error && (
          <div style={{ padding: '12px', background: '#FDF2F2', color: '#C92A2A', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #F8D7DA' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4A2E1B' }}>Tên món ăn</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Ví dụ: Phở Bò Truyền Thống"
              required 
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #E0DCD0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#FAFAFA', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4A2E1B' }}>Mô tả ngắn</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Mô tả hấp dẫn về món ăn..."
              rows={2}
              required 
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #E0DCD0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#FAFAFA', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4A2E1B' }}>Nguyên liệu (Mỗi dòng một nguyên liệu)</label>
            <textarea 
              value={ingredients} 
              onChange={(e) => setIngredients(e.target.value)} 
              placeholder="500g thịt bò&#10;1kg bánh phở&#10;Hành hoa, gia vị..."
              rows={4}
              required 
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #E0DCD0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#FAFAFA', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4A2E1B' }}>Các bước thực hiện (Mỗi dòng một bước)</label>
            <textarea 
              value={instructions} 
              onChange={(e) => setInstructions(e.target.value)} 
              placeholder="Bước 1: Sơ chế thịt bò...&#10;Bước 2: Ninh xương làm nước dùng..."
              rows={5}
              required 
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #E0DCD0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#FAFAFA', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4A2E1B' }}>Danh mục</label>
              <input 
                type="text" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                placeholder="Món chính / Khai vị..."
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #E0DCD0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#FAFAFA', outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4A2E1B' }}>Link hình ảnh món ăn</label>
              <input 
                type="text" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                placeholder="https://example.com/pho.jpg"
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #E0DCD0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#FAFAFA', outline: 'none' }}
              />
            </div>
          </div>

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
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Đang lưu...' : (isEditing ? 'Cập Nhật Công Thức' : 'Đăng Bài Viết Ngay')}
          </button>
        </form>
      </div>
    </div>
  );
}