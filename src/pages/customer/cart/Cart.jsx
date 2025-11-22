import React, { useState } from 'react';
import { useCart } from '../../../contexts/CartContext';
import { Button, Empty, InputNumber, Spin, Typography, Card, Row, Col, Space, Divider, Image, List, Statistic, Checkbox, message, Modal, Radio } from 'antd';
import { DeleteOutlined, ShoppingOutlined, ShoppingCartOutlined, DollarOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../../../api/orders';
import { createPayment } from '../../../api/payment';
import { convertUsdToVnd, formatVnd, CURRENCY_CONFIG } from '../../../config/currency';

const { Title, Text } = Typography;

const Cart = () => {
  const { cartItems, loading, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cod'

  // Get userId from JWT token (same method as CartContext)
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

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1 || !newQuantity) return;
    await updateQuantity(cartItemId, newQuantity);
  };

  const handleRemoveItem = async (cartItemId) => {
    await removeFromCart(cartItemId);
  };

  const handleSelectItem = (cartItemId, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, cartItemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== cartItemId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(cartItems.map(item => item.cartItemId));
    } else {
      setSelectedItems([]);
    }
  };

  const getSelectedItemsTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.cartItemId))
      .reduce((total, item) => total + (item.priceAtAddTime || 0) * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      message.warning('Please select at least one item to checkout');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      message.error('Please login to checkout');
      return;
    }

    // Show payment method selection modal
    setShowPaymentModal(true);
  };

  const handlePaymentMethodConfirm = async () => {
    setShowPaymentModal(false);
    setCheckoutLoading(true);

    const userId = getUserId();
    
    try {
      // Prepare order details from selected items
      const selectedCartItems = cartItems.filter(item => 
        selectedItems.includes(item.cartItemId)
      );
      
      const orderDetails = selectedCartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      // Create order
      const orderResponse = await createOrder({
        userId: userId,
        shippingFee: 0,
        paymentMethod: paymentMethod === 'cod' ? 'COD' : 'VNPAY',
        orderDetails: orderDetails
      });

      if (paymentMethod === 'cod') {
        // COD payment - Order is confirmed, remove items from cart immediately
        message.success('Order placed successfully with Cash on Delivery!');
        
        // Remove selected items from cart
        for (const cartItemId of selectedItems) {
          try {
            await removeFromCart(cartItemId);
          } catch (err) {
            console.error(`Failed to remove cart item ${cartItemId}:`, err);
          }
        }
        
        // Navigate to orders page
        navigate('/orders');
      } else {
        // Online payment - Store info and redirect to VNPay
        localStorage.setItem('pendingDeleteCartItems', JSON.stringify(selectedItems));
        localStorage.setItem('pendingOrderId', orderResponse.orderId.toString());

        // Create payment and get VNPay URL
        const paymentResponse = await createPayment({
          orderId: orderResponse.orderId,
          returnUrl: `${window.location.origin}/payment-return`
        });

        // Redirect to VNPay
        window.location.href = paymentResponse.paymentUrl;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      message.error(error.response?.data?.message || 'Failed to process checkout');
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Loading cart..." />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', padding: '40px 20px' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<Text type="secondary">Your cart is empty</Text>}
        >
          <Button type="primary" icon={<ShoppingOutlined />} onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </Empty>
      </div>
    );
  }

  const totalPrice = cartItems.reduce((total, item) => 
    total + (item.priceAtAddTime || 0) * item.quantity, 0
  );
  
  const selectedTotal = getSelectedItemsTotal();
  const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>
          <ShoppingCartOutlined /> Shopping Cart
        </Title>
        
        <Row gutter={[24, 24]}>
          {/* Cart Items List */}
          <Col xs={24} lg={16}>
            <Card>
              <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: '16px' }}>
                <Checkbox 
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                >
                  <Text strong>Select All ({cartItems.length} items)</Text>
                </Checkbox>
                <Divider style={{ margin: '8px 0' }} />
              </Space>

              <List
                itemLayout="vertical"
                dataSource={cartItems}
                renderItem={(item) => (
                  <List.Item
                    key={item.cartItemId}
                    extra={
                      <Image
                        width={150}
                        src={item.product?.mediaFiles?.[0]?.mediaUrl || 'https://via.placeholder.com/150'}
                        alt={item.product?.productName}
                        fallback="https://via.placeholder.com/150"
                        style={{ borderRadius: '8px' }}
                      />
                    }
                    actions={[
                      <Space key="quantity">
                        <Text>Quantity:</Text>
                        <InputNumber
                          min={1}
                          max={item.product?.stockQuantity || 99}
                          value={item.quantity}
                          onChange={(value) => handleQuantityChange(item.cartItemId, value)}
                          style={{ width: '80px' }}
                        />
                      </Space>,
                      <Button
                        key="remove"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveItem(item.cartItemId)}
                      >
                        Remove
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Checkbox
                          checked={selectedItems.includes(item.cartItemId)}
                          onChange={(e) => handleSelectItem(item.cartItemId, e.target.checked)}
                        />
                      }
                      title={
                        <Space direction="vertical" size="small">
                          <Title level={4} style={{ margin: 0 }}>
                            {item.product?.productName}
                          </Title>
                          <Text type="secondary">Code: {item.product?.productCode}</Text>
                          {item.product?.manufacturer && (
                            <Text type="secondary">By {item.product.manufacturer}</Text>
                          )}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="middle" style={{ marginTop: '12px' }}>
                          <Statistic
                            title="Price"
                            value={item.priceAtAddTime || 0}
                            precision={2}
                            prefix="$"
                            valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                          />
                          <Statistic
                            title="Subtotal"
                            value={(item.priceAtAddTime || 0) * item.quantity}
                            precision={2}
                            prefix="$"
                            valueStyle={{ fontSize: '18px', fontWeight: 'bold' }}
                          />
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Order Summary */}
          <Col xs={24} lg={8}>
            <Card 
              title={<Title level={4} style={{ margin: 0 }}>Order Summary</Title>}
              style={{ position: 'sticky', top: '20px' }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Cart Total ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}):</Text>
                      <Text strong>${totalPrice.toFixed(2)}</Text>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Selected ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'}):</Text>
                      <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>${selectedTotal.toFixed(2)}</Text>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Shipping:</Text>
                      <Text type="secondary">Free</Text>
                    </div>
                  </Space>

                  <Divider />

                  <Statistic
                    title={<Text strong style={{ fontSize: '16px' }}>Total to Pay:</Text>}
                    value={selectedTotal}
                    precision={2}
                    prefix="$"
                    valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
                  />
                </div>

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleCheckout}
                    loading={checkoutLoading}
                    disabled={selectedItems.length === 0}
                  >
                    Checkout ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'})
                  </Button>

                  <Button
                    size="large"
                    block
                    icon={<ShoppingOutlined />}
                    onClick={() => navigate('/')}
                  >
                    Continue Shopping
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>

      {/* Payment Method Selection Modal */}
      <Modal
        title="Select Payment Method"
        open={showPaymentModal}
        onOk={handlePaymentMethodConfirm}
        onCancel={() => setShowPaymentModal(false)}
        okText="Confirm Order"
        cancelText="Cancel"
        okButtonProps={{ loading: checkoutLoading }}
        width={500}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', padding: '20px 0' }}>
          <Text>Please select your preferred payment method:</Text>
          
          <Radio.Group 
            onChange={(e) => setPaymentMethod(e.target.value)} 
            value={paymentMethod}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Card 
                hoverable
                style={{ 
                  border: paymentMethod === 'online' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  cursor: 'pointer'
                }}
                onClick={() => setPaymentMethod('online')}
              >
                <Radio value="online">
                  <Space>
                    <CreditCardOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                    <div>
                      <Text strong>Online Payment (VNPay)</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Pay securely with VNPay gateway
                      </Text>
                    </div>
                  </Space>
                </Radio>
              </Card>

              <Card 
                hoverable
                style={{ 
                  border: paymentMethod === 'cod' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  cursor: 'pointer'
                }}
                onClick={() => setPaymentMethod('cod')}
              >
                <Radio value="cod">
                  <Space>
                    <DollarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                    <div>
                      <Text strong>Cash on Delivery (COD)</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Pay when you receive your order
                      </Text>
                    </div>
                  </Space>
                </Radio>
              </Card>
            </Space>
          </Radio.Group>

          <Divider style={{ margin: '8px 0' }} />
          
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Total Amount (USD):</Text>
              <Text strong style={{ fontSize: '18px' }}>
                ${selectedTotal.toFixed(2)}
              </Text>
            </div>
            
            {paymentMethod === 'online' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary">Amount in VND:</Text>
                <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                  {formatVnd(convertUsdToVnd(selectedTotal))}
                </Text>
              </div>
            )}
            
            <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>
              {paymentMethod === 'online' && `Exchange rate: 1 USD ≈ ${CURRENCY_CONFIG.USD_TO_VND_RATE.toLocaleString('vi-VN')} VND`}
            </Text>
          </Space>
        </Space>
      </Modal>
    </div>
  );
};

export default Cart;
