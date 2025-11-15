import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Result, Button, Spin, Card, Descriptions, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, HomeOutlined, ShoppingOutlined } from '@ant-design/icons';
import { handleVnpayReturn } from '../../../api/payment';
import { useCart } from '../../../contexts/CartContext';

const { Title, Text } = Typography;

const PaymentReturn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { removeFromCart, fetchCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get full query string from URL
        const queryString = location.search;
        
        if (!queryString) {
          setError('Invalid payment callback');
          setLoading(false);
          return;
        }

        // Call backend to verify payment with VNPay
        const result = await handleVnpayReturn(queryString);
        setPaymentResult(result);

        // If payment successful, remove paid items from cart
        if (result.success) {
          const pendingCartItems = localStorage.getItem('pendingDeleteCartItems');
          if (pendingCartItems) {
            const cartItemIds = JSON.parse(pendingCartItems);
            
            // Delete each cart item
            for (const cartItemId of cartItemIds) {
              try {
                await removeFromCart(cartItemId);
              } catch (err) {
                console.error(`Failed to remove cart item ${cartItemId}:`, err);
              }
            }

            // Refresh cart
            await fetchCart();
            
            // Clear localStorage
            localStorage.removeItem('pendingDeleteCartItems');
            localStorage.removeItem('pendingOrderId');
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err.response?.data?.message || 'Failed to verify payment');
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location.search, removeFromCart, fetchCart]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <Spin size="large" />
        <Text>Verifying payment with VNPay...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
        <Result
          status="error"
          icon={<CloseCircleOutlined />}
          title="Payment Verification Failed"
          subTitle={error}
          extra={[
            <Button type="primary" key="home" icon={<HomeOutlined />} onClick={() => navigate('/')}>
              Go Home
            </Button>,
            <Button key="cart" onClick={() => navigate('/cart')}>
              Back to Cart
            </Button>,
          ]}
        />
      </div>
    );
  }

  if (!paymentResult) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
        <Result
          status="warning"
          title="No Payment Information"
          subTitle="Could not find payment details"
          extra={[
            <Button type="primary" key="home" icon={<HomeOutlined />} onClick={() => navigate('/')}>
              Go Home
            </Button>,
          ]}
        />
      </div>
    );
  }

  const isSuccess = paymentResult.success;

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
      <Result
        status={isSuccess ? 'success' : 'error'}
        icon={isSuccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        title={isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        subTitle={
          isSuccess 
            ? 'Your order has been confirmed and items have been removed from your cart.'
            : paymentResult.message || 'There was an issue processing your payment.'
        }
        extra={[
          <Button 
            type="primary" 
            key="orders" 
            onClick={() => navigate('/orders')}
          >
            View My Orders
          </Button>,
          <Button 
            key="shop" 
            icon={<ShoppingOutlined />}
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </Button>,
        ]}
      >
        <Card style={{ marginTop: '24px' }}>
          <Title level={4}>Payment Details</Title>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Transaction Reference">
              {paymentResult.transactionRef || paymentResult.vnpayQuery?.transactionNo || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Amount (VND)">
              {((paymentResult.amount || 0) / 100).toLocaleString('vi-VN')} ₫
            </Descriptions.Item>
            <Descriptions.Item label="Order Code">
              {paymentResult.orderCode || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Order Info">
              {paymentResult.orderInfo || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Transaction Time">
              {paymentResult.payDate 
                ? new Date(paymentResult.payDate).toLocaleString()
                : 'N/A'
              }
            </Descriptions.Item>
            <Descriptions.Item label="Bank Code">
              {paymentResult.bankCode || paymentResult.vnpayQuery?.bankCode || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Text strong type={isSuccess ? 'success' : 'danger'}>
                {isSuccess ? 'SUCCESS' : 'FAILED'}
              </Text>
            </Descriptions.Item>
            {paymentResult.message && (
              <Descriptions.Item label="Message">
                {paymentResult.message}
              </Descriptions.Item>
            )}
            {paymentResult.vnpayQuery && (
              <Descriptions.Item label="VNPay Response">
                Code: {paymentResult.vnpayQuery.responseCode} - {paymentResult.vnpayQuery.message}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      </Result>
    </div>
  );
};

export default PaymentReturn;
