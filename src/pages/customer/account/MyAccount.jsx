import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Input, Button, message, Tabs, DatePicker, Select, Space, Typography, Divider, Modal } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, LockOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons';
import { getUserProfile, updateUserProfile, changePassword } from '../../../api/user';
import moment from 'moment';
import './MyAccount.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const MyAccount = () => {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const loadUserProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const data = await getUserProfile();
      
      // Set form values
      profileForm.setFieldsValue({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        birthDate: data.birthDate ? moment(data.birthDate) : null,
        gender: data.gender
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      message.error('Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  }, [profileForm]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      
      // Format data
      const profileData = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        address: values.address,
        birthDate: values.birthDate ? values.birthDate.toISOString() : null,
        gender: values.gender
      };

      await updateUserProfile(profileData);
      message.success('Profile updated successfully!');
      await loadUserProfile(); // Reload profile
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });

      message.success('Password changed successfully!');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Error changing password:', error);
      message.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-account-container">
      <div className="my-account-wrapper">
        <Title level={2}>
          <UserOutlined /> My Account
        </Title>

        <Card loading={profileLoading}>
          <Tabs defaultActiveKey="profile" size="large">
            {/* Profile Tab */}
            <TabPane tab="Profile Information" key="profile">
              <Form
                form={profileForm}
                layout="vertical"
                onFinish={handleUpdateProfile}
                autoComplete="off"
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Text strong style={{ fontSize: '16px' }}>Personal Information</Text>
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <Form.Item
                      label="Full Name"
                      name="fullName"
                      rules={[{ required: true, message: 'Please enter your full name' }]}
                    >
                      <Input 
                        prefix={<UserOutlined />} 
                        placeholder="Enter your full name" 
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Email"
                      name="email"
                    >
                      <Input 
                        prefix={<MailOutlined />} 
                        placeholder="Email" 
                        size="large"
                        disabled
                      />
                    </Form.Item>

                    <Form.Item
                      label="Phone Number"
                      name="phoneNumber"
                    >
                      <Input 
                        prefix={<PhoneOutlined />} 
                        placeholder="Enter phone number" 
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Birth Date"
                      name="birthDate"
                    >
                      <DatePicker 
                        style={{ width: '100%' }} 
                        size="large"
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Gender"
                      name="gender"
                    >
                      <Select size="large" placeholder="Select gender">
                        <Option value="Male">
                          <ManOutlined /> Male
                        </Option>
                        <Option value="Female">
                          <WomanOutlined /> Female
                        </Option>
                        <Option value="Other">Other</Option>
                      </Select>
                    </Form.Item>
                  </div>

                  <div>
                    <Text strong style={{ fontSize: '16px' }}>Address Information</Text>
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <Form.Item
                      label="Address"
                      name="address"
                    >
                      <Input.TextArea 
                        prefix={<HomeOutlined />}
                        placeholder="Enter your address" 
                        rows={3}
                        size="large"
                      />
                    </Form.Item>
                  </div>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      size="large" 
                      loading={loading}
                      block
                    >
                      Update Profile
                    </Button>
                  </Form.Item>
                </Space>
              </Form>
            </TabPane>

            {/* Change Password Tab */}
            <TabPane tab="Change Password" key="password">
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleChangePassword}
                autoComplete="off"
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Text strong style={{ fontSize: '16px' }}>Password Settings</Text>
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <Form.Item
                      label="Current Password"
                      name="currentPassword"
                      rules={[
                        { required: true, message: 'Please enter current password' }
                      ]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined />} 
                        placeholder="Enter current password" 
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="New Password"
                      name="newPassword"
                      rules={[
                        { required: true, message: 'Please enter new password' },
                        { min: 6, message: 'Password must be at least 6 characters' }
                      ]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined />} 
                        placeholder="Enter new password" 
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Confirm New Password"
                      name="confirmPassword"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Please confirm new password' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Passwords do not match'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined />} 
                        placeholder="Confirm new password" 
                        size="large"
                      />
                    </Form.Item>
                  </div>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      size="large" 
                      loading={loading}
                      block
                    >
                      Change Password
                    </Button>
                  </Form.Item>
                </Space>
              </Form>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default MyAccount;
