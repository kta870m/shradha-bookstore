import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { login, register } from '../../api/auth';

const LoginModal = ({ visible, onClose, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const response = await login(values.email, values.password);
      
      // Lưu token và user info
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      message.success('Login successfully!');
      loginForm.resetFields();
      onClose();
      onLoginSuccess();
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    try {
      setLoading(true);
      await register({
        username: values.username,
        password: values.password,
        email: values.email,
        fullName: values.fullName,
        userType: 'Customer',
        address: values.address || null,
        birthDate: null,
        gender: null
      });
      
      message.success('Registration successful! Please login.');
      registerForm.resetFields();
      setActiveTab('login');
    } catch (error) {
      console.error('Register error:', error);
      message.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    loginForm.resetFields();
    registerForm.resetFields();
    setActiveTab('login');
    onClose();
  };

  const loginTab = (
    <Form
      form={loginForm}
      name="login"
      onFinish={handleLogin}
      layout="vertical"
      requiredMark={false}
    >
      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Please enter your email!' },
          { type: 'email', message: 'Invalid email address!' }
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Email"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please enter your password!' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Password"
          size="large"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          size="large"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            fontWeight: '600',
          }}
        >
          Login
        </Button>
      </Form.Item>
    </Form>
  );

  const registerTab = (
    <Form
      form={registerForm}
      name="register"
      onFinish={handleRegister}
      layout="vertical"
      requiredMark={false}
    >
      <Form.Item
        name="fullName"
        rules={[{ required: true, message: 'Please enter your full name!' }]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="Full Name"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Please enter your email!' },
          { type: 'email', message: 'Invalid email address!' }
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Email"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="username"
        rules={[
          { required: true, message: 'Please enter your username!' },
          { min: 4, message: 'Username must be at least 4 characters!' }
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="Username"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="address"
        rules={[{ required: false }]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Address (optional)"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: 'Please enter your password!' },
          { min: 6, message: 'Password must be at least 6 characters!' }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Password"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Please confirm your password!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords do not match!'));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Confirm Password"
          size="large"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          size="large"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            fontWeight: '600',
          }}
        >
          Register
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <Modal
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={450}
      centered
      destroyOnClose
    >
      <div style={{ padding: '20px 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '24px', fontWeight: 'bold' }}>
          Welcome to Shradha
        </h2>
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            {
              key: 'login',
              label: 'Login',
              children: loginTab,
            },
            {
              key: 'register',
              label: 'Register',
              children: registerTab,
            },
          ]}
        />
      </div>
    </Modal>
  );
};

export default LoginModal;
