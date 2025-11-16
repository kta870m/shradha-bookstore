import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Tooltip,
  Descriptions,
  DatePicker,
  InputNumber,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import axiosInstance from '../../../api/axios';
import moment from 'moment';
import '../../../styles/AdminOrderManagement.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function AdminOrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearchValue, setProductSearchValue] = useState('');
  const [users, setUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchValue, setUserSearchValue] = useState('');
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.current, pagination.pageSize]);

  // Debug selectedProducts changes
  useEffect(() => {
    console.log('selectedProducts changed:', selectedProducts);
  }, [selectedProducts]);

  // Clear all form state
  const clearAllState = () => {
    console.log('Clearing all state...');
    setSelectedProducts([]);
    setProducts([]);
    setProductSearchValue('');
    setSelectedUser(null);
    setUsers([]);
    setUserSearchValue('');
    form.resetFields();
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/orders', {
        params: {
          page: pagination.current,
          pageSize: pagination.pageSize,
        }
      });
      
      if (response.data.items) {
        setOrders(response.data.items);
        setPagination(prev => ({
          ...prev,
          total: response.data.totalItems
        }));
      } else {
        setOrders(response.data);
      }
    } catch (error) {
      message.error('Unable to load order list');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch order details
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      setSelectedOrder(response.data);
      setOrderDetails(response.data.orderDetails || []);
    } catch (error) {
      message.error('Unable to load order details');
      console.error('Error fetching order details:', error);
    }
  };

  // Get new order code
  const getNewOrderCode = async () => {
    try {
      const response = await axiosInstance.get('/orders/new-code');
      return response.data.orderCode;
    } catch (error) {
      console.error('Error getting new order code:', error);
      return 'OR000001'; // fallback
    }
  };

  // Search products
  const searchProducts = async (searchText) => {
    if (!searchText) {
      setProducts([]);
      return;
    }

    setSearchingProducts(true);
    try {
      const response = await axiosInstance.get(`/products/search?q=${searchText}&limit=20`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error searching products:', error);
      message.error('Unable to search products');
    } finally {
      setSearchingProducts(false);
    }
  };

  // Add product to order
  const addProductToOrder = (product) => {
    const existingIndex = selectedProducts.findIndex(p => p.productId === product.productId);
    
    if (existingIndex >= 0) {
      // Update quantity if product already exists
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingIndex].quantity += 1;
      setSelectedProducts(updatedProducts);
      message.success(`Increased quantity of ${product.productName}`);
    } else {
      // Add new product
      setSelectedProducts([...selectedProducts, {
        productId: product.productId,
        productCode: product.productCode,
        productName: product.productName,
        unitPrice: product.price,
        quantity: 1,
        thumbnailUrl: product.thumbnailUrl
      }]);
      message.success(`Added ${product.productName} to order`);
    }

    // Clear search after adding product
    setProductSearchValue('');
    setProducts([]);
  };

  // Remove product from order
  const removeProductFromOrder = (productId) => {
    console.log('Removing product:', productId);
    const filteredProducts = selectedProducts.filter(p => p.productId !== productId);
    console.log('After removal:', filteredProducts);
    setSelectedProducts(filteredProducts);
  };

  // Update product quantity
  const updateProductQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeProductFromOrder(productId);
      return;
    }

    const updatedProducts = selectedProducts.map(p => 
      p.productId === productId ? { ...p, quantity } : p
    );
    setSelectedProducts(updatedProducts);
  };

  // Calculate total amount
  const calculateTotalAmount = () => {
    return selectedProducts.reduce((total, product) => 
      total + (product.quantity * product.unitPrice), 0
    );
  };

  // Search users
  const searchUsers = async (searchText) => {
    if (!searchText) {
      setUsers([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const response = await axiosInstance.get(`/auth/users/search?q=${searchText}&limit=20`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
      message.error('Unable to search customers');
    } finally {
      setSearchingUsers(false);
    }
  };

  // Select user
  const selectUser = (user) => {
    setSelectedUser(user);
    setUserSearchValue(`${user.fullName} (ID: ${user.id})`);
    setUsers([]);
    form.setFieldsValue({ userId: user.id });
    message.success(`Selected customer: ${user.fullName}`);
  };

  // Clear selected user
  const clearSelectedUser = () => {
    setSelectedUser(null);
    setUserSearchValue('');
    setUsers([]);
    form.setFieldsValue({ userId: null });
  };

  // Handle create/update order
  const handleSubmit = async (values) => {
    try {
      if (editingOrder) {
        // Update order validation
        if (selectedProducts.length === 0) {
          message.error('Please select at least one product');
          return;
        }

        if (!selectedUser) {
          message.error('Please select a customer');
          return;
        }

        // Full update order with order details
        const updateData = {
          ...values,
          orderDate: values.orderDate ? values.orderDate.format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
          orderCode: editingOrder.orderCode,
          userId: selectedUser.id,
          orderDetails: selectedProducts.map(p => ({
            productId: p.productId,
            quantity: p.quantity,
            unitPrice: p.unitPrice
          }))
        };
        
        console.log('Current selectedProducts before sending:', selectedProducts);
        console.log('Sending update data:', updateData);
        const response = await axiosInstance.put(`/orders/${editingOrder.orderId}/full-update`, updateData);
        console.log('Update response:', response.data);
        message.success('Order updated successfully!');
      } else {
        // Create new order with order details
        if (selectedProducts.length === 0) {
          message.error('Please select at least one product');
          return;
        }

        if (!selectedUser) {
          message.error('Please select a customer');
          return;
        }

        const orderData = {
          ...values,
          userId: selectedUser.id,
          orderDetails: selectedProducts.map(p => ({
            productId: p.productId,
            quantity: p.quantity,
            unitPrice: p.unitPrice
          }))
        };

        console.log('Creating new order with data:', orderData);
        await axiosInstance.post('/orders/admin-create', orderData);
        message.success('New order added successfully!');
      }
      
      setModalVisible(false);
      setEditingOrder(null);
      form.resetFields();
      setSelectedProducts([]);
      setProducts([]);
      setProductSearchValue('');
      setSelectedUser(null);
      setUsers([]);
      setUserSearchValue('');
      fetchOrders();
    } catch (error) {
      console.error('Error submitting order:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'An error occurred while saving the order';
      message.error(errorMsg);
    }
  };

  // Handle delete order
  const handleDelete = async (orderId) => {
    try {
      await axiosInstance.delete(`/orders/${orderId}`);
      message.success('Order deleted successfully!');
      fetchOrders();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Unable to delete order';
      message.error(errorMsg);
    }
  };

  // Open modal for create/edit
  const openModal = async (order = null) => {
    // Clear all state first
    clearAllState();
    
    setEditingOrder(order);
    setModalVisible(true);
    
    if (order) {
      // Load full order details for editing
      try {
        const response = await axiosInstance.get(`/orders/${order.orderId}`);
        const fullOrder = response.data;
        
        // Set form values
        form.setFieldsValue({
          orderStatus: fullOrder.orderStatus,
          paymentMethod: fullOrder.paymentMethod,
          shippingFee: fullOrder.shippingFee,
          orderDate: moment(fullOrder.orderDate)
        });

        // Set selected user for editing
        if (fullOrder.user) {
          setSelectedUser({
            id: fullOrder.user.id,
            fullName: fullOrder.user.fullName,
            email: fullOrder.user.email,
            phoneNumber: fullOrder.user.phoneNumber,
            address: fullOrder.user.address
          });
          setUserSearchValue(`${fullOrder.user.fullName} (ID: ${fullOrder.user.id})`);
        }

        // Set selected products for editing
        if (fullOrder.orderDetails && fullOrder.orderDetails.length > 0) {
          console.log('Order details:', fullOrder.orderDetails); // Debug log
          const products = fullOrder.orderDetails.map(detail => {
            // Get thumbnail URL - check different possible structures
            let thumbnailUrl = null;
            if (detail.product && detail.product.mediaFiles && detail.product.mediaFiles.length > 0) {
              thumbnailUrl = detail.product.mediaFiles[0].mediaUrl;
            } else if (detail.product && detail.product.MediaFiles && detail.product.MediaFiles.length > 0) {
              thumbnailUrl = detail.product.MediaFiles[0].MediaUrl || detail.product.MediaFiles[0].mediaUrl;
            }
            
            console.log(`Product ${detail.productName} thumbnail:`, thumbnailUrl); // Debug log
            
            return {
              productId: detail.productId,
              productCode: detail.product?.productCode || '',
              productName: detail.productName,  
              unitPrice: detail.unitPrice,
              quantity: detail.quantity,
              thumbnailUrl: thumbnailUrl
            };
          });
          
          // Remove duplicates based on productId
          const uniqueProducts = products.filter((product, index, self) => 
            index === self.findIndex(p => p.productId === product.productId)
          );
          
          console.log('Setting unique products:', uniqueProducts);
          setSelectedProducts(uniqueProducts);
        }
      } catch (error) {
        console.error('Error loading order details:', error);
        message.error('Unable to load order information');
      }
    }
  };

  // Open detail modal
  const openDetailModal = async (order) => {
    await fetchOrderDetails(order.orderId);
    setDetailModalVisible(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'orange',
      'Confirmed': 'blue',
      'Paid': 'green',
      'Successful': 'green'
    };
    return colors[status] || 'default';
  };

  // Table columns
  const columns = [
    {
      title: 'Order Code',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (text) => (
        <Text strong style={{ color: '#1890ff' }}>{text}</Text>
      ),
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Customer',
      dataIndex: 'user',
      key: 'customer',
      render: (user) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <UserOutlined style={{ marginRight: '6px' }} />
            <Text strong>{user?.fullName || 'N/A'}</Text>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {user?.phoneNumber && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <PhoneOutlined /> {user.phoneNumber}
              </div>
            )}
            {user?.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MailOutlined /> {user.email}
              </div>
            )}
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(amount)}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status || 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => (
        <Tag color="blue">{method || 'N/A'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space className="order-actions">
          <Tooltip title="View Details">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => openDetailModal(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Confirm Delete"
            description="Are you sure you want to delete this order?"
            onConfirm={() => handleDelete(record.orderId)}
            okText="Delete"
            cancelText="Cancel"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Tooltip title="Delete">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="order-management-container">
      <Card className="order-card">
        <div className="order-header">
          <Title level={2} className="order-title">
            <ShoppingCartOutlined style={{ marginRight: 8 }} />
            Order Management
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            size="large"
            className="add-order-btn"
          >
            Add New Order
          </Button>
        </div>

        <Table
          className="order-table"
          columns={columns}
          dataSource={orders}
          rowKey="orderId"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} orders`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize
              }));
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        key={editingOrder ? editingOrder.orderId : 'new'}
        title={editingOrder ? 'Edit Order' : 'Add New Order'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingOrder(null);
          clearAllState();
        }}
        footer={null}
        width={800}
        >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 20 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="orderDate"
                label="Order Date"
                rules={[
                  { required: true, message: 'Please select order date!' }
                ]}
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder="Select order date"
                  format="DD/MM/YYYY HH:mm"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="shippingFee"
                label="Shipping Fee"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter shipping fee..."
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="orderStatus"
                label="Order Status"
              >
                <Select placeholder="Select order status">
                  <Option value="Pending">Pending</Option>
                  <Option value="Confirmed">Confirmed</Option>
                  <Option value="Paid">Paid</Option>
                  <Option value="Successful">Successful</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paymentMethod"
                label="Payment Method"
              >
                <Select placeholder="Select payment method">
                  <Option value="COD">Cash on Delivery (COD)</Option>
                  <Option value="Bank Transfer">Bank Transfer</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Product Selection Section */}
          {(
            <>
              <Divider>{editingOrder ? 'Products in Order' : 'Select Products'}</Divider>
              
              <Form.Item label="Search Products">
                <Select
                  showSearch
                  value={productSearchValue}
                  placeholder="Enter product name to search..."
                  onSearch={(value) => {
                    setProductSearchValue(value);
                    searchProducts(value);
                  }}
                  loading={searchingProducts}
                  filterOption={false}
                  onSelect={(value, option) => addProductToOrder(option.data)}
                  onClear={() => {
                    setProductSearchValue('');
                    setProducts([]);
                  }}
                  allowClear
                  style={{ width: '100%' }}
                >
                  {products.map(product => (
                    <Option 
                      key={product.productId} 
                      value={product.productId}
                      data={product}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {product.thumbnailUrl && (
                          <img 
                            src={product.thumbnailUrl} 
                            alt={product.productName}
                            style={{ width: 30, height: 30, marginRight: 8, objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <div>{product.productName}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {product.productCode} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                          </div>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Selected Products */}
              {selectedProducts.length > 0 && (
                <Form.Item label="Selected Products">
                  <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 16, maxHeight: 300, overflowY: 'auto' }}>
                    {selectedProducts.map((product, index) => (
                      <div key={`${product.productId}-${index}`} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          <div style={{ 
                            width: 40, 
                            height: 40, 
                            marginRight: 12, 
                            borderRadius: 4,
                            overflow: 'hidden',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #d9d9d9'
                          }}>
                            {product.thumbnailUrl ? (
                              <img 
                                src={product.thumbnailUrl} 
                                alt={product.productName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  console.log('Image load error for:', product.productName, product.thumbnailUrl);
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div style="font-size: 10px; color: #999; text-align: center;">No Image</div>';
                                }}
                              />
                            ) : (
                              <div style={{ 
                                fontSize: '10px',
                                color: '#999',
                                textAlign: 'center'
                              }}>
                                No Image
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{product.productName}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {product.productCode} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.unitPrice)}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <InputNumber
                            min={1}
                            value={product.quantity}
                            onChange={(value) => updateProductQuantity(product.productId, value)}
                            style={{ width: 80 }}
                          />
                          <Button 
                            type="link" 
                            danger 
                            onClick={() => removeProductFromOrder(product.productId)}
                            style={{ padding: 0 }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: 12, textAlign: 'right', fontWeight: 'bold' }}>
                      Total Products: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotalAmount())}
                    </div>
                  </div>
                </Form.Item>
              )}
            </>
          )}

          {/* Customer Selection Section */}
          {(
            <>
              <Divider>{editingOrder ? 'Customer' : 'Select Customer'}</Divider>
              
              <Form.Item label="Search Customer">
                <Select
                  showSearch
                  value={userSearchValue}
                  placeholder="Enter name, ID, email or phone number..."
                  onSearch={(value) => {
                    setUserSearchValue(value);
                    searchUsers(value);
                  }}
                  loading={searchingUsers}
                  filterOption={false}
                  onSelect={(value, option) => selectUser(option.data)}
                  onClear={clearSelectedUser}
                  allowClear
                  style={{ width: '100%' }}
                >
                  {users.map(user => (
                    <Option 
                      key={user.id} 
                      value={user.id}
                      data={user}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontWeight: 500 }}>{user.fullName}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          ID: {user.id} | Email: {user.email}
                          {user.phoneNumber && ` | Phone: ${user.phoneNumber}`}
                        </div>
                        {user.address && (
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            Address: {user.address}
                          </div>
                        )}
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Selected Customer */}
              {selectedUser && (
                <Form.Item label="Selected Customer">
                  <div style={{ 
                    border: '1px solid #d9d9d9', 
                    borderRadius: 6, 
                    padding: 16,
                    backgroundColor: '#f6ffed',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '16px' }}>{selectedUser.fullName}</div>
                      <div style={{ fontSize: '14px', color: '#666', marginTop: 4 }}>
                        ID: {selectedUser.id} | Email: {selectedUser.email}
                      </div>
                      {selectedUser.phoneNumber && (
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          Phone: {selectedUser.phoneNumber}
                        </div>
                      )}
                      {selectedUser.address && (
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          Address: {selectedUser.address}
                        </div>
                      )}
                    </div>
                    <Button 
                      type="link" 
                      danger 
                      onClick={clearSelectedUser}
                    >
                      Change
                    </Button>
                  </div>
                </Form.Item>
              )}
            </>
          )}



          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingOrder(null);
                form.resetFields();
                setSelectedProducts([]);
                setProducts([]);
                setProductSearchValue('');
                setSelectedUser(null);
                setUsers([]);
                setUserSearchValue('');
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingOrder ? 'Update' : 'Add New'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Order Detail Modal */}
      <Modal
        title={`Order Details: ${selectedOrder?.orderCode}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={900}
      >
        {selectedOrder && (
          <div style={{ marginTop: 16 }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Order Code">
                <Text strong>{selectedOrder.orderCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {moment(selectedOrder.orderDate).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                <div>
                  <div><Text strong>{selectedOrder.user?.fullName || 'N/A'}</Text></div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Email: {selectedOrder.user?.email || 'N/A'}
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                {selectedOrder.user?.phoneNumber || 'Not updated'}
              </Descriptions.Item>
              <Descriptions.Item label="Delivery Address" span={2}>
                {selectedOrder.user?.address || 'Not updated'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedOrder.orderStatus)}>
                  {selectedOrder.orderStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {selectedOrder.paymentMethod || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Transaction ID">
                {selectedOrder.paymentTxnRef || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Shipping Fee">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(selectedOrder.shippingFee)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(selectedOrder.totalAmount)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider>Product Details</Divider>
            
            <Table
              dataSource={orderDetails}
              rowKey="orderDetailId"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Product',
                  dataIndex: 'product',
                  render: (product) => product?.productName || 'N/A',
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                  align: 'center',
                },
                {
                  title: 'Unit Price',
                  dataIndex: 'unitPrice',
                  render: (price) => new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(price),
                },
                {
                  title: 'Subtotal',
                  key: 'subtotal',
                  render: (_, record) => (
                    <Text strong>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(record.quantity * record.unitPrice)}
                    </Text>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminOrderManagement;