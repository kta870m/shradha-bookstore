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
    Divider
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    SearchOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from '../../api/axios';
import '../../styles/AdminCustomerManagement.css';

const { Title } = Typography;
const { Option } = Select;

const AdminCustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    // Fetch customers
    const fetchCustomers = async (page = 1, pageSize = 10, search = '') => {
        try {
            setLoading(true);
            console.log('[CUSTOMERS] Fetching customers:', { page, pageSize, search });
            
            const response = await axios.get('/customers', {
                params: { page, pageSize, search }
            });
            
            console.log('[CUSTOMERS] Response:', response.data);
            
            setCustomers(response.data.customers || []);
            setPagination({
                current: response.data.pagination.currentPage,
                pageSize: response.data.pagination.pageSize,
                total: response.data.pagination.totalCount
            });
        } catch (error) {
            console.error('[CUSTOMERS] Error fetching customers:', error);
            message.error('Error loading customer list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Handle search
    const handleSearch = (value) => {
        setSearchText(value);
        fetchCustomers(1, pagination.pageSize, value);
    };

    // Handle pagination change
    const handlePaginationChange = (page, pageSize) => {
        fetchCustomers(page, pageSize, searchText);
    };

    // Handle add/edit customer
    const handleSaveCustomer = async (values) => {
        try {
            setLoading(true);
            console.log('[CUSTOMERS] Saving customer:', values);

            const customerData = {
                userName: values.userName,
                email: values.email,
                fullName: values.fullName,
                phoneNumber: values.phoneNumber || null,
                address: values.address || null,
                birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
                gender: values.gender || null
            };

            if (editingCustomer) {
                // Update customer
                if (values.password) {
                    customerData.newPassword = values.password;
                }
                
                await axios.put(`/customers/${editingCustomer.id}`, customerData);
                message.success('Customer updated successfully!');
            } else {
                // Create customer
                customerData.password = values.password;
                await axios.post('/customers', customerData);
                message.success('Customer added successfully!');
            }

            setModalVisible(false);
            form.resetFields();
            setEditingCustomer(null);
            fetchCustomers(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
            console.error('[CUSTOMERS] Error saving customer:', error);
            const errorMessage = error.response?.data || 'Error saving customer';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Handle delete customer
    const handleDeleteCustomer = async (customerId, customerName) => {
        try {
            setLoading(true);
            console.log('[CUSTOMERS] Deleting customer:', customerId);
            
            await axios.delete(`/customers/${customerId}`);
            message.success(`Customer ${customerName} deleted successfully`);
            fetchCustomers(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
            console.error('[CUSTOMERS] Error deleting customer:', error);
            const errorMessage = error.response?.data || 'Error deleting customer';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Open add customer modal
    const openAddModal = () => {
        setEditingCustomer(null);
        form.resetFields();
        setModalVisible(true);
    };

    // Open edit customer modal
    const openEditModal = (customer) => {
        setEditingCustomer(customer);
        form.setFieldsValue({
            userName: customer.userName,
            email: customer.email,
            fullName: customer.fullName,
            phoneNumber: customer.phoneNumber,
            address: customer.address,
            birthDate: customer.birthDate ? moment(customer.birthDate) : null,
            gender: customer.gender
        });
        setModalVisible(true);
    };

    // Refresh data
    const handleRefresh = () => {
        fetchCustomers(pagination.current, pagination.pageSize, searchText);
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
            title: 'Phone Number',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            render: (text) => text || '-',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            render: (text) => text || '-',
            ellipsis: true,
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            render: (text) => {
                if (!text) return '-';
                return (
                    <Tag color={text === 'Male' ? 'blue' : 'pink'}>
                        {text === 'Male' ? 'Male' : text === 'Female' ? 'Female' : text}
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
                        description={`Are you sure you want to delete customer "${record.fullName}"?`}
                        onConfirm={() => handleDeleteCustomer(record.id, record.fullName)}
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
                            <UserOutlined /> Customer Management
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
                                Add Customer
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
                    dataSource={customers}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 1200 }}
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
                            `${range[0]}-${range[1]} of ${total} customers`
                        }
                    />
                </Row>
            </Card>

            {/* Add/Edit Customer Modal */}
            <Modal
                title={editingCustomer ? 'Edit Customer Information' : 'Add New Customer'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingCustomer(null);
                }}
                footer={null}
                width={600}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSaveCustomer}
                    autoComplete="off"
                >
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
                        <Col span={editingCustomer ? 12 : 24}>
                            <Form.Item
                                name="password"
                                label={editingCustomer ? "New Password (leave blank if no change)" : "Password"}
                                rules={editingCustomer ? [] : [
                                    { required: true, message: 'Please enter password!' },
                                    { min: 6, message: 'Password must be at least 6 characters!' }
                                ]}
                            >
                                <Input.Password placeholder="Enter password" />
                            </Form.Item>
                        </Col>

                    </Row>

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
                                    setEditingCustomer(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                {editingCustomer ? 'Update' : 'Add New'}
                            </Button>
                        </Space>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminCustomerManagement;