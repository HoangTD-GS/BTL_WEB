import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface Recipe {
  _id: string;
  title: string;
  description: string;
  category?: string;
  imageUrl?: string;
}

export default function MyRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Lấy danh sách công thức của user hiện tại khi vào trang
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để xem trang cá nhân!');
      navigate('/login');
      return;
    }

    // Gọi API lấy bài viết của tôi (hoặc lọc từ danh sách recipes theo user)
    fetch('http://localhost:5000/api/recipes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Không thể tải danh sách bài viết');
        return data;
      })
      .then((data) => {
        // Nếu backend trả về tất cả, có thể lọc theo user hoặc backend đã có route riêng
        setRecipes(Array.isArray(data) ? data : data.recipes || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Xử lý xóa công thức
  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa công thức này không?')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/recipes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Xóa bài viết thất bại!');

      // Cập nhật lại giao diện sau khi xóa thành công
      setRecipes(recipes.filter((r) => r._id !== id));
      alert('Đã xóa công thức thành công!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FDFBF7', // Nền Vani ấm áp
      padding: '40px 20px',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header trang cá nhân */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px',
          background: '#FFFFFF',
          padding: '24px 30px',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(74, 46, 27, 0.06)',
          border: '1px solid #F3EFE6'
        }}>
          <div>
            <h2 style={{ color: '#4A2E1B', fontWeight: '700', margin: '0 0 6px 0' }}>👤 Trang Cá Nhân Của Tôi</h2>
            <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Quản lý các công thức nấu ăn do chính tay bạn sáng tạo</p>
          </div>
          <Link 
            to="/recipes/new" // Hoặc đường dẫn đến form đăng bài
            style={{
              padding: '10px 18px',
              background: '#E67E22',
              color: '#FFFFFF',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(230, 126, 34, 0.2)'
            }}
          >
            + Đăng Món Mới
          </Link>
        </div>

        {error && (
          <div style={{ padding: '12px', background: '#FDF2F2', color: '#C92A2A', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #F8D7DA' }}>
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Đang tải danh sách món ăn của bạn...</p>
        ) : recipes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #F3EFE6' }}>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '16px' }}>Bạn chưa đăng công thức nấu ăn nào cả.</p>
            <Link to="/recipes/new" style={{ color: '#E67E22', fontWeight: '600', textDecoration: 'none' }}>Tạo công thức đầu tiên ngay &rarr;</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {recipes.map((recipe) => (
              <div key={recipe._id} style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 6px 20px rgba(74, 46, 27, 0.06)',
                border: '1px solid #F3EFE6',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {recipe.imageUrl && (
                  <img src={recipe.imageUrl} alt={recipe.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {recipe.category && (
                      <span style={{ fontSize: '12px', background: '#FEF9E7', color: '#E67E22', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>
                        {recipe.category}
                      </span>
                    )}
                    <h3 style={{ color: '#4A2E1B', margin: '10px 0 8px 0', fontSize: '18px', fontWeight: '700' }}>{recipe.title}</h3>
                    <p style={{ color: '#666', fontSize: '14px', margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {recipe.description}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #F3EFE6', paddingTop: '14px' }}>
                    <Link 
                      to={`/recipes/edit/${recipe._id}`}
                      style={{ 
                        flex: 1, 
                        textAlign: 'center', 
                        padding: '8px', 
                        background: '#FEF9E7', 
                        color: '#4A2E1B', 
                        borderRadius: '6px', 
                        textDecoration: 'none', 
                        fontWeight: '600',
                        fontSize: '13px'
                      }}
                    >
                      ✏️ Sửa
                    </Link>
                    <button 
                      onClick={() => handleDelete(recipe._id)}
                      style={{ 
                        flex: 1, 
                        padding: '8px', 
                        background: '#FDF2F2', 
                        color: '#C92A2A', 
                        border: 'none', 
                        borderRadius: '6px', 
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}