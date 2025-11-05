import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sử dụng window.$axios
      const response = await window.$axios.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const { token, user } = response.data;

      // Kiểm tra userType phải là Admin
      if (user.userType !== 'Admin') {
        setError('Bạn không có quyền truy cập trang Admin');
        setLoading(false);
        return;
      }

      // Lưu token và user info vào localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));

      // Redirect đến dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        setError(err.response.data.message || 'Email hoặc mật khẩu không đúng');
      } else if (err.request) {
        setError('Không thể kết nối đến server');
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại');
      }
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h1>Admin Login</h1>
        <p className="subtitle">Đăng nhập vào hệ thống quản trị</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Nhập email của bạn"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="login-footer">
          <p>Chưa có tài khoản? <a href="/admin/register">Đăng ký ngay</a></p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
