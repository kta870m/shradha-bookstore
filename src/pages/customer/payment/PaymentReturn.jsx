import React, { useEffect, useState, useRef } from 'react';
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
  const [urlParams, setUrlParams] = useState({});
  const hasProcessed = useRef(false); // Prevent multiple executions

  useEffect(() => {
    const verifyPayment = async () => {
      // Prevent running multiple times
      if (hasProcessed.current) {
        return;
      }
      hasProcessed.current = true;

      try {
        // Get full query string from URL
        const queryString = location.search;
        
        if (!queryString) {
          setError('Invalid payment callback');
          setLoading(false);
          return;
        }

        // Parse URL parameters
        const params = new URLSearchParams(queryString);
        const urlData = {
          vnp_TxnRef: params.get('vnp_TxnRef'),
          vnp_Amount: params.get('vnp_Amount'),
          vnp_OrderInfo: params.get('vnp_OrderInfo'),
          vnp_ResponseCode: params.get('vnp_ResponseCode'),
          vnp_TransactionNo: params.get('vnp_TransactionNo'),
          vnp_BankCode: params.get('vnp_BankCode'),
          vnp_PayDate: params.get('vnp_PayDate'),
          vnp_TransactionStatus: params.get('vnp_TransactionStatus'),
        };
        setUrlParams(urlData);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once

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

  // Format VNPay date (yyyyMMddHHmmss) to readable format
  const formatVnpayDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 14) return 'N/A';
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

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
            {/* <Descriptions.Item label="Transaction Reference">
              {urlParams.vnp_TxnRef || 'N/A'}
            </Descriptions.Item> */}
            {/* <Descriptions.Item label="Transaction No">
              {urlParams.vnp_TransactionNo || 'N/A'}
            </Descriptions.Item> */}
            <Descriptions.Item label="Amount (VND)">
              {urlParams.vnp_Amount 
                ? (parseInt(urlParams.vnp_Amount) / 100).toLocaleString('vi-VN') + ' ₫'
                : 'N/A'
              }
            </Descriptions.Item>
            <Descriptions.Item label="Order Code">
              {paymentResult.orderCode || 'N/A'}
            </Descriptions.Item>
            {/* <Descriptions.Item label="Order Info">
              {urlParams.vnp_OrderInfo || 'N/A'}
            </Descriptions.Item> */}
            <Descriptions.Item label="Transaction Time">
              {formatVnpayDate(urlParams.vnp_PayDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Bank Code">
              {urlParams.vnp_BankCode || 'N/A'}
            </Descriptions.Item>
            {/* <Descriptions.Item label="Response Code">
              <Text code>{urlParams.vnp_ResponseCode || 'N/A'}</Text>
            </Descriptions.Item> */}
            <Descriptions.Item label="Payment Status">
              <Text strong type={isSuccess ? 'success' : 'danger'}>
                {isSuccess ? 'SUCCESS' : 'FAILED'}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Result>
    </div>
  );
};

export default PaymentReturn;
