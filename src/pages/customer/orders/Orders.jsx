import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Typography, Spin, Empty, message, Descriptions, Modal } from 'antd';
import { EyeOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getUserOrders, getOrderById } from '../../../api/orders';

const { Title, Text } = Typography;

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Get userId from JWT token
  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return parseInt(payload.sid);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async () => {
    const userId = getUserId();
    if (!userId) {
      message.error('Please login to view orders');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const data = await getUserOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      setDetailLoading(true);
      setDetailModalVisible(true);
      const orderDetails = await getOrderById(orderId);
      setSelectedOrder(orderDetails);
    } catch (error) {
      console.error('Error loading order details:', error);
      message.error('Failed to load order details');
      setDetailModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Pending': 'orange',
      'Confirmed': 'blue',
      'Paid': 'green',
      'Processing': 'cyan',
      'Completed': 'green',
      'Cancelled': 'red',
      'Failed': 'red',
      'Payment Verification Failed': 'volcano'
    };
    return statusColors[status] || 'default';
  };

  const columns = [
    {
      title: 'Order Code',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <Text strong>${amount.toFixed(2)}</Text>,
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => method || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record.orderId)}
        >
          View Details
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Loading orders..." />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <Title level={2}>My Orders</Title>
        <Card>
          <Empty
            description="You haven't placed any orders yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<ShoppingOutlined />} onClick={() => navigate('/')}>
              Start Shopping
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>My Orders</Title>
          <Button icon={<ShoppingOutlined />} onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="orderId"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} orders`,
            }}
          />
        </Card>
      </Space>

      {/* Order Details Modal */}
      <Modal
        title={`Order Details - ${selectedOrder?.orderCode || ''}`}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedOrder(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : selectedOrder ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Order Code" span={2}>
                <Text strong>{selectedOrder.orderCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {new Date(selectedOrder.orderDate).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedOrder.orderStatus)}>
                  {selectedOrder.orderStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {selectedOrder.paymentMethod || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Shipping Fee">
                ${selectedOrder.shippingFee.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount" span={2}>
                <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                  ${selectedOrder.totalAmount.toFixed(2)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <div>
              <Title level={5}>Order Items</Title>
              <Table
                dataSource={selectedOrder.orderDetails}
                rowKey="orderDetailId"
                pagination={false}
                columns={[
                  {
                    title: 'Product',
                    dataIndex: 'productName',
                    key: 'productName',
                  },
                  {
                    title: 'Unit Price',
                    dataIndex: 'unitPrice',
                    key: 'unitPrice',
                    render: (price) => `$${price.toFixed(2)}`,
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    key: 'quantity',
                  },
                  {
                    title: 'Subtotal',
                    dataIndex: 'subtotal',
                    key: 'subtotal',
                    render: (subtotal) => (
                      <Text strong>${subtotal.toFixed(2)}</Text>
                    ),
                  },
                ]}
              />
            </div>
          </Space>
        ) : null}
      </Modal>
    </div>
  );
};

export default Orders;
