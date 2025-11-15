import { useState } from 'react';
import { Form, Input, Button, Card, message, Space } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';

function AdminRegister() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await window.$axios.post('/auth/register', {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        userType: 'Admin'
      });

      message.success('Tạo tài khoản admin thành công!');
      form.resetFields();
    } catch (err) {
      console.error('Register error:', err);
      if (err?.response) {
        message.error(err.response.data?.message || 'Có lỗi xảy ra khi tạo tài khoản');
      } else if (err?.request) {
        message.error('Không thể kết nối đến server');
      } else {
        message.error('Có lỗi xảy ra. Vui lòng thử lại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={
          <Space>
            <UserAddOutlined />
            <span>Tạo tài khoản Admin mới</span>
          </Space>
        }
        style={{ maxWidth: 600 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              { required: true, message: 'Vui lòng nhập họ tên' },
              { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
            ]}
          >
            <Input placeholder="Nhập họ và tên" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập email" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu" disabled={loading} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Tạo tài khoản Admin
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default AdminRegister;