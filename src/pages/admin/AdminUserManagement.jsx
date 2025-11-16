import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    DatePicker,
    Select,
    Space,
    Popconfirm,
    message,
    Card,
    Row,
    Col,
    Pagination,
    Tag,
    Typography,
    Divider,
    Alert
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    SearchOutlined,
    ReloadOutlined,
    CrownOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from '../../api/axios';
import '../../styles/AdminCustomerManagement.css';

const { Title } = Typography;
const { Option } = Select;

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [selectedRole, setSelectedRole] = useState(''); // For form role
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    // Fetch users
    const fetchUsers = async (page = 1, pageSize = 10, search = '') => {
        try {
            setLoading(true);
            console.log('[USERS] Fetching users:', { page, pageSize, search });
            
            const response = await axios.get('/auth/users', {
                params: { page, pageSize, search }
            });
            
            console.log('[USERS] Response:', response.data);
            
            setUsers(response.data.users || []);
            setPagination({
                current: response.data.pagination.currentPage,
                pageSize: response.data.pagination.pageSize,
                total: response.data.pagination.totalCount
            });
        } catch (error) {
            console.error('[USERS] Error fetching users:', error);
            message.error('Error loading user list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle search
    const handleSearch = (value) => {
        setSearchText(value);
        fetchUsers(1, pagination.pageSize, value);
    };

    // Handle pagination change
    const handlePaginationChange = (page, pageSize) => {
        fetchUsers(page, pageSize, searchText);
    };

    // Handle add/edit user
    const handleSaveUser = async (values) => {
        try {
            setLoading(true);
            console.log('[USERS] Saving user:', values);

            const userData = {
                userName: values.userName,
                email: values.email,
                fullName: values.fullName,
                phoneNumber: values.phoneNumber || null,
                address: values.address || null,
                birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
                gender: values.gender || null,
                userType: values.userType // Include role selection
            };

            if (editingUser) {
                // Update user
                if (values.password) {
                    userData.newPassword = values.password;
                }
                
                await axios.put(`/auth/users/${editingUser.id}`, userData);
                message.success('User updated successfully!');
            } else {
                // Create user
                userData.password = values.password;
                await axios.post('/auth/users', userData);
                message.success(`${values.userType} account created successfully!`);
            }

            setModalVisible(false);
            form.resetFields();
            setEditingUser(null);
            setSelectedRole('');
            fetchUsers(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
            console.error('[USERS] Error saving user:', error);
            const errorMessage = error.response?.data?.message || error.response?.data || 'Error saving user';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Handle delete user
    const handleDeleteUser = async (userId, userName) => {
        try {
            setLoading(true);
            console.log('[USERS] Deleting user:', userId);
            
            await axios.delete(`/auth/users/${userId}`);
            message.success(`User ${userName} deleted successfully`);
            fetchUsers(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
            console.error('[USERS] Error deleting user:', error);
            const errorMessage = error.response?.data?.message || error.response?.data || 'Error deleting user';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Open add user modal
    const openAddModal = () => {
        setEditingUser(null);
        form.resetFields();
        setSelectedRole('');
        setModalVisible(true);
    };

    // Open edit user modal
    const openEditModal = (user) => {
        setEditingUser(user);
        setSelectedRole(user.userType);
        form.setFieldsValue({
            userName: user.userName,
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            address: user.address,
            birthDate: user.birthDate ? moment(user.birthDate) : null,
            gender: user.gender,
            userType: user.userType
        });
        setModalVisible(true);
    };

    // Refresh data
    const handleRefresh = () => {
        fetchUsers(pagination.current, pagination.pageSize, searchText);
    };

    // Table columns
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Username',
            dataIndex: 'userName',
            key: 'userName',
            render: (text) => (
                <Space>
                    <UserOutlined />
                    <span>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Full Name',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text, record) => (
                <Space direction="vertical" size="small">
                    <span>{text}</span>
                    {record.emailConfirmed ? (
                        <Tag color="green">Verified</Tag>
                    ) : (
                        <Tag color="orange">Not Verified</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'userType',
            key: 'userType',
            width: 120,
            render: (text) => {
                const isAdmin = text?.toLowerCase() === 'admin';
                return (
                    <Tag icon={isAdmin ? <CrownOutlined /> : <UserOutlined />} color={isAdmin ? 'gold' : 'blue'}>
                        {text || 'Customer'}
                    </Tag>
                );
            },
            filters: [
                { text: 'Admin', value: 'Admin' },
                { text: 'Customer', value: 'Customer' },
            ],
            onFilter: (value, record) => record.userType?.toLowerCase() === value.toLowerCase(),
        },
        {
            title: 'Phone Number',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            render: (text) => text || '-',
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            render: (text) => {
                if (!text) return '-';
                return (
                    <Tag color={text === 'Male' ? 'blue' : 'pink'}>
                        {text}
                    </Tag>
                );
            },
        },
        {
            title: 'Birth Date',
            dataIndex: 'birthDate',
            key: 'birthDate',
            render: (text) => text ? moment(text).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(record)}
                        size="small"
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Confirm Delete"
                        description={`Are you sure you want to delete user "${record.fullName}"?`}
                        onConfirm={() => handleDeleteUser(record.id, record.fullName)}
                        okText="Delete"
                        cancelText="Cancel"
                        okType="danger"
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>
                            <UserOutlined /> User Management
                        </Title>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleRefresh}
                                loading={loading}
                            >
                                Refresh
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={openAddModal}
                            >
                                Add User
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8}>
                        <Input.Search
                            placeholder="Search by name, email, phone number..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            onSearch={handleSearch}
                            loading={loading}
                        />
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 1300 }}
                    size="middle"
                />

                <Row justify="end" style={{ marginTop: 16 }}>
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={handlePaginationChange}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total, range) =>
                            `${range[0]}-${range[1]} of ${total} users`
                        }
                    />
                </Row>
            </Card>

            {/* Add/Edit User Modal */}
            <Modal
                title={editingUser ? 'Edit User Information' : 'Add New User'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingUser(null);
                    setSelectedRole('');
                }}
                footer={null}
                width={600}
                destroyOnHidden
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSaveUser}
                    autoComplete="off"
                >
                    {/* Role Selection - Important Field */}
                    <Alert
                        message="Role Selection"
                        description="Only administrators can create Admin accounts. Regular users will be created as Customers."
                        type="info"
                        showIcon
                        icon={<CrownOutlined />}
                        style={{ marginBottom: 16 }}
                    />

                    <Form.Item
                        name="userType"
                        label="User Role"
                        rules={[{ required: true, message: 'Please select user role!' }]}
                    >
                        <Select 
                            placeholder="Select user role" 
                            size="large"
                            onChange={(value) => setSelectedRole(value)}
                        >
                            <Option value="Customer">
                                <Space>
                                    <UserOutlined />
                                    Customer
                                </Space>
                            </Option>
                            <Option value="Admin">
                                <Space>
                                    <CrownOutlined />
                                    Administrator
                                </Space>
                            </Option>
                        </Select>
                    </Form.Item>

                    {selectedRole === 'Admin' && (
                        <Alert
                            message="Creating Admin Account"
                            description="You are creating an administrator account with full system access. Please ensure this is intended."
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Divider />

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="userName"
                                label="Username"
                                rules={[
                                    { required: true, message: 'Please enter username!' },
                                    { min: 3, message: 'Username must be at least 3 characters!' }
                                ]}
                            >
                                <Input placeholder="Enter username" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Please enter email!' },
                                    { type: 'email', message: 'Invalid email format!' }
                                ]}
                            >
                                <Input placeholder="Enter email" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="password"
                                label={editingUser ? "New Password (leave blank if no change)" : "Password"}
                                rules={editingUser ? [] : [
                                    { required: true, message: 'Please enter password!' },
                                    { min: 6, message: 'Password must be at least 6 characters!' }
                                ]}
                            >
                                <Input.Password placeholder="Enter password" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="fullName"
                                label="Full Name"
                                rules={[
                                    { required: true, message: 'Please enter full name!' },
                                    { min: 2, message: 'Full name must be at least 2 characters!' }
                                ]}
                            >
                                <Input placeholder="Enter full name" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="phoneNumber"
                                label="Phone Number"
                                rules={[
                                    {
                                        pattern: /^[0-9]{10,11}$/,
                                        message: 'Phone number must be 10-11 digits!'
                                    }
                                ]}
                            >
                                <Input placeholder="Enter phone number" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="gender" label="Gender">
                                <Select placeholder="Select gender" allowClear>
                                    <Option value="Male">Male</Option>
                                    <Option value="Female">Female</Option>
                                    <Option value="Other">Other</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="birthDate" label="Birth Date">
                                <DatePicker
                                    placeholder="Select birth date"
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="address" label="Address">
                        <Input.TextArea
                            placeholder="Enter address"
                            rows={3}
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <Divider />

                    <Row justify="end">
                        <Space>
                            <Button
                                onClick={() => {
                                    setModalVisible(false);
                                    form.resetFields();
                                    setEditingUser(null);
                                    setSelectedRole('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                {editingUser ? 'Update' : 'Create Account'}
                            </Button>
                        </Space>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminUserManagement;
