import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Space,
    Typography,
    Tag,
    message,
    Card,
    Row,
    Col,
    Statistic,
    Rate,
    Avatar,
    Popconfirm,
    Tooltip,
    Image
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    StarOutlined,
    UserOutlined,
    ShoppingOutlined,
    CalendarOutlined,
    CommentOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import { reviewApi } from '../../api/admin/reviewApi';
import { productApi } from '../../api/admin/productApi';
import { customerApi } from '../../api/admin/customerApi';
import '../../styles/AdminReviewManagement.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [form] = Form.useForm();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedRating, setSelectedRating] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        fetchReviews();
        fetchStatistics();
        fetchProducts();
        fetchCustomers();
    }, [pagination.current, pagination.pageSize, selectedProduct, selectedRating]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                pageSize: pagination.pageSize,
                productId: selectedProduct || undefined,
                rating: selectedRating || undefined
            };

            const response = await reviewApi.getReviews(params);
            setReviews(response.reviews || []);
            setPagination(prev => ({
                ...prev,
                total: response.pagination?.totalCount || 0
            }));
        } catch (error) {
            console.error('Error fetching reviews:', error);
            message.error('Không thể tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const stats = await reviewApi.getStatistics();
            setStatistics(stats);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            console.log('[REVIEW MANAGEMENT] Fetching products...');
            const response = await productApi.getProducts({ pageSize: 1000 });
            console.log('[REVIEW MANAGEMENT] Products response:', response);
            const productList = response.products || response.items || [];
            setProducts(productList);
            console.log('[REVIEW MANAGEMENT] Products set:', productList);
        } catch (error) {
            console.error('Error fetching products:', error);
            message.error('Không thể tải danh sách sản phẩm');
        }
    };

    const fetchCustomers = async () => {
        try {
            console.log('[REVIEW MANAGEMENT] Fetching customers...');
            const response = await customerApi.getCustomers({ pageSize: 1000 });
            console.log('[REVIEW MANAGEMENT] Customers response:', response);
            setCustomers(response.customers || []);
            console.log('[REVIEW MANAGEMENT] Customers set:', response.customers || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
            message.error('Không thể tải danh sách khách hàng');
        }
    };

    const handleTableChange = (newPagination) => {
        setPagination({
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize
        });
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchReviews();
    };

    const handleReset = () => {
        setSelectedProduct(null);
        setSelectedRating(null);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const showModal = (review = null) => {
        setEditingReview(review);
        setModalVisible(true);
        if (review) {
            form.setFieldsValue({
                productId: review.productId,
                userId: review.userId,
                rating: review.rating,
                comment: review.comment
            });
        } else {
            form.resetFields();
        }
    };

    const handleModalOk = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            if (editingReview) {
                await reviewApi.updateReview(editingReview.reviewId, {
                    rating: values.rating,
                    comment: values.comment
                });
                message.success('Cập nhật đánh giá thành công!');
                
                // Refresh data from server to ensure consistency
                await fetchReviews();
            } else {
                await reviewApi.createReview(values);
                message.success('Thêm đánh giá thành công!');
                await fetchReviews();
            }
            setModalVisible(false);
            await fetchStatistics();
        } catch (error) {
            console.error('Error saving review:', error);
            message.error(editingReview ? 'Không thể cập nhật đánh giá' : 'Không thể thêm đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (reviewId) => {
        try {
            await reviewApi.deleteReview(reviewId);
            message.success('Xóa đánh giá thành công!');
            // Refresh both reviews list and statistics
            await Promise.all([fetchReviews(), fetchStatistics()]);
        } catch (error) {
            console.error('Error deleting review:', error);
            message.error('Không thể xóa đánh giá');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'reviewId',
            key: 'reviewId',
            width: 80,
            sorter: true
        },
        {
            title: 'Sản phẩm',
            key: 'product',
            width: 200,
            render: (record) => (
                <div className="product-info">
                    <Space>
                        {record.productThumbnail && (
                            <Image
                                width={40}
                                height={40}
                                src={record.productThumbnail}
                                alt={record.productName}
                                style={{ objectFit: 'cover', borderRadius: 4 }}
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                            />
                        )}
                        <div>
                            <div className="product-name">{record.productName}</div>
                            <Text type="secondary" className="product-code">
                                {record.productCode}
                            </Text>
                        </div>
                    </Space>
                </div>
            )
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            width: 150,
            render: (record) => (
                <div className="customer-info">
                    <div className="customer-name">
                        <UserOutlined className="customer-icon" />
                        {record.userName}
                    </div>
                    <Text type="secondary" className="customer-email">
                        {record.userEmail}
                    </Text>
                </div>
            )
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            width: 120,
            render: (rating) => (
                <div className="rating-display">
                    <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} />
                    <Text className="rating-number">({rating}/5)</Text>
                </div>
            ),
            sorter: true
        },
        {
            title: 'Bình luận',
            dataIndex: 'comment',
            key: 'comment',
            ellipsis: true,
            render: (comment) => (
                <Tooltip title={comment}>
                    <Text className="comment-text">
                        {comment ? (comment.length > 50 ? `${comment.substring(0, 50)}...` : comment) : 'Không có bình luận'}
                    </Text>
                </Tooltip>
            )
        },
        {
            title: 'Ngày đánh giá',
            dataIndex: 'reviewDate',
            key: 'reviewDate',
            width: 130,
            render: (date) => (
                <div className="date-display">
                    <CalendarOutlined className="date-icon" />
                    {new Date(date).toLocaleDateString('vi-VN')}
                </div>
            ),
            sorter: true
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => showModal(record)}
                            className="edit-btn"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa đánh giá này?"
                            onConfirm={() => handleDelete(record.reviewId)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                type="primary"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                className="delete-btn"
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div className="admin-review-management">
            <div className="page-header">
                <Title level={2} className="page-title">
                    <CommentOutlined className="title-icon" />
                    Quản lý Đánh giá
                </Title>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="statistics-row">
                <Col xs={24} sm={12} md={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="Tổng đánh giá"
                            value={statistics.totalReviews || 0}
                            prefix={<CommentOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="Đánh giá trung bình"
                            value={statistics.averageRating || 0}
                            precision={2}
                            prefix={<StarOutlined />}
                            suffix="/ 5"
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="Đánh giá tuần này"
                            value={statistics.recentReviews || 0}
                            prefix={<BarChartOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="Đánh giá 5 sao"
                            value={statistics.ratingDistribution?.find(r => r.rating === 5)?.count || 0}
                            prefix={<StarOutlined />}
                            valueStyle={{ color: '#eb2f96' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="filter-card">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Select
                            placeholder="Chọn sản phẩm"
                            value={selectedProduct}
                            onChange={setSelectedProduct}
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                            className="filter-select"
                        >
                            {products.map(product => (
                                <Option key={product.productId} value={product.productId}>
                                    {product.productName}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Select
                            placeholder="Chọn số sao"
                            value={selectedRating}
                            onChange={setSelectedRating}
                            allowClear
                            className="filter-select"
                        >
                            {[1, 2, 3, 4, 5].map(rating => (
                                <Option key={rating} value={rating}>
                                    {rating} sao
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                                Lọc
                            </Button>
                            <Button onClick={handleReset}>
                                Đặt lại
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Action Bar */}
            <Card className="action-bar">
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={4} className="table-title">
                            Danh sách đánh giá ({pagination.total})
                        </Title>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => showModal()}
                            className="add-btn"
                        >
                            Thêm đánh giá
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Reviews Table */}
            <Card className="table-card">
                <Table
                    columns={columns}
                    dataSource={reviews}
                    rowKey="reviewId"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} đánh giá`,
                        pageSizeOptions: ['10', '20', '50', '100']
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1200 }}
                    className="reviews-table"
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={editingReview ? 'Chỉnh sửa đánh giá' : 'Thêm đánh giá mới'}
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={() => setModalVisible(false)}
                width={600}
                className="review-modal"
                okText={editingReview ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                confirmLoading={loading}
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="review-form"
                >
                    <Form.Item
                        name="productId"
                        label="Sản phẩm"
                        rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}
                    >
                        <Select
                            placeholder="Chọn sản phẩm"
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                            disabled={editingReview}
                        >
                            {products.map(product => (
                                <Option key={product.productId} value={product.productId}>
                                    {product.productName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="userId"
                        label="Khách hàng"
                        rules={[{ required: true, message: 'Vui lòng chọn khách hàng!' }]}
                    >
                        <Select
                            placeholder="Chọn khách hàng"
                            showSearch
                            filterOption={(input, option) => {
                                const text = option.children.toLowerCase();
                                return text.includes(input.toLowerCase());
                            }}
                            disabled={editingReview}
                        >
                            {customers.map(customer => (
                                <Option key={customer.id} value={customer.id}>
                                    {customer.fullName} ({customer.email})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="rating"
                        label="Đánh giá"
                        rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
                    >
                        <Rate />
                    </Form.Item>

                    <Form.Item
                        name="comment"
                        label="Bình luận"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Nhập bình luận..."
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminReviewManagement;