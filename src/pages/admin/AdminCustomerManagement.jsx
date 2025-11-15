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
            message.error('Lỗi khi tải danh sách khách hàng');
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
                message.success('Cập nhật khách hàng thành công!');
            } else {
                // Create customer
                customerData.password = values.password;
                await axios.post('/customers', customerData);
                message.success('Thêm khách hàng thành công!');
            }

            setModalVisible(false);
            form.resetFields();
            setEditingCustomer(null);
            fetchCustomers(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
            console.error('[CUSTOMERS] Error saving customer:', error);
            const errorMessage = error.response?.data || 'Lỗi khi lưu khách hàng';
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
            message.success(`Đã xóa khách hàng ${customerName}`);
            fetchCustomers(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
            console.error('[CUSTOMERS] Error deleting customer:', error);
            const errorMessage = error.response?.data || 'Lỗi khi xóa khách hàng';
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
            title: 'Tên đăng nhập',
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
            title: 'Họ và tên',
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
                        <Tag color="green">Đã xác thực</Tag>
                    ) : (
                        <Tag color="orange">Chưa xác thực</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            render: (text) => text || '-',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            render: (text) => text || '-',
            ellipsis: true,
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            render: (text) => {
                if (!text) return '-';
                return (
                    <Tag color={text === 'Male' ? 'blue' : 'pink'}>
                        {text === 'Male' ? 'Nam' : text === 'Female' ? 'Nữ' : text}
                    </Tag>
                );
            },
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'birthDate',
            key: 'birthDate',
            render: (text) => text ? moment(text).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Thao tác',
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
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description={`Bạn có chắc chắn muốn xóa khách hàng "${record.fullName}"?`}
                        onConfirm={() => handleDeleteCustomer(record.id, record.fullName)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        >
                            Xóa
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
                            <UserOutlined /> Quản lý khách hàng
                        </Title>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleRefresh}
                                loading={loading}
                            >
                                Làm mới
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={openAddModal}
                            >
                                Thêm khách hàng
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8}>
                        <Input.Search
                            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
                            `${range[0]}-${range[1]} của ${total} khách hàng`
                        }
                    />
                </Row>
            </Card>

            {/* Add/Edit Customer Modal */}
            <Modal
                title={editingCustomer ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
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
                                label="Tên đăng nhập"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                                    { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
                                ]}
                            >
                                <Input placeholder="Nhập tên đăng nhập" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input placeholder="Nhập email" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={editingCustomer ? 12 : 24}>
                            <Form.Item
                                name="password"
                                label={editingCustomer ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
                                rules={editingCustomer ? [] : [
                                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                ]}
                            >
                                <Input.Password placeholder="Nhập mật khẩu" />
                            </Form.Item>
                        </Col>

                    </Row>

                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ và tên!' },
                            { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' }
                        ]}
                    >
                        <Input placeholder="Nhập họ và tên" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="phoneNumber"
                                label="Số điện thoại"
                                rules={[
                                    {
                                        pattern: /^[0-9]{10,11}$/,
                                        message: 'Số điện thoại phải có 10-11 chữ số!'
                                    }
                                ]}
                            >
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="gender" label="Giới tính">
                                <Select placeholder="Chọn giới tính" allowClear>
                                    <Option value="Male">Nam</Option>
                                    <Option value="Female">Nữ</Option>
                                    <Option value="Other">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="birthDate" label="Ngày sinh">
                                <DatePicker
                                    placeholder="Chọn ngày sinh"
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="address" label="Địa chỉ">
                        <Input.TextArea
                            placeholder="Nhập địa chỉ"
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
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                {editingCustomer ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Space>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminCustomerManagement;