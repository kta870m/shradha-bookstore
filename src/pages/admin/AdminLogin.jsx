import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, Alert } from 'antd';

const { Title, Text } = Typography;

function AdminLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setError('');
    setLoading(true);
    try {
      const response = await window.$axios.post('/auth/login', {
        email: values.email,
        password: values.password
      });

      const { token, user } = response.data;

      // Automatically treat as Admin
      const adminUser = { ...user, userType: 'Admin' };

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(adminUser));

      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err?.response) {
        setError(err.response.data?.message || 'Email hoặc mật khẩu không đúng');
      } else if (err?.request) {
        setError('Không thể kết nối đến server');
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại');
      }
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display:'flex', alignItems:'center', justifyContent:'center', padding: 24 }}>
      <div style={{ width: 420, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 8 }}>
        <Title level={3}>Admin Login</Title>
        <Text type="secondary">Sign in to the admin dashboard</Text>

        {error && <Alert style={{ marginTop: 16 }} message={error} type="error" showIcon />}

        <Form layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email' }]}>
            <Input placeholder="Enter your email" disabled={loading} />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter your password' }]}>
            <Input.Password placeholder="Enter your password" disabled={loading} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default AdminLogin;