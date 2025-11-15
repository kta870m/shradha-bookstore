import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from '../../api/axios';

const VNPayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        const queryString = window.location.search;
        const response = await axios.get(`/payment/vnpay-return${queryString}`);
        
        const data = response.data;
        
        setResult({
          success: data.success,
          message: data.message,
          orderId: data.orderId,
          orderCode: data.orderCode,
          status: data.status,
          alreadyProcessed: data.alreadyProcessed,
          vnpayQuery: data.vnpayQuery,
          callbackInfo: {
            txnRef: searchParams.get('vnp_TxnRef'),
            transactionNo: searchParams.get('vnp_TransactionNo'),
            amount: searchParams.get('vnp_Amount'),
            responseCode: searchParams.get('vnp_ResponseCode'),
            bankCode: searchParams.get('vnp_BankCode'),
          }
        });
      } catch (err) {
        console.error('Error processing payment return:', err);
        setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xử lý thanh toán');
      } finally {
        setLoading(false);
      }
    };

    handlePaymentReturn();
  }, [searchParams]);

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
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <h3>Processing payment result...</h3>
        <p style={{ color: '#666' }}>Please do not close this page</p>
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Payment Processing Error"
        subTitle={error}
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}>
            Go to Home
          </Button>,
          <Button key="orders" onClick={() => navigate('/orders')}>
            View Orders
          </Button>,
        ]}
      />
    );
  }

  if (result?.success) {
    const vnpay = result.vnpayQuery || {};
    
    return (
      <Result
        status="success"
        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
        title="Payment Successful!"
        subTitle={
          <div>
            <p>Your order has been paid and verified successfully.</p>
            {result.alreadyProcessed && (
              <p style={{ color: '#faad14', fontStyle: 'italic', fontSize: '14px' }}>
                (This order has been processed previously)
              </p>
            )}
            <div style={{ marginTop: '20px', textAlign: 'left', display: 'inline-block', backgroundColor: '#f6ffed', padding: '16px', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
              <p><strong>Order Code:</strong> {result.orderCode}</p>
              <p><strong>VNPay Transaction ID:</strong> {vnpay.transactionNo}</p>
              <p><strong>Amount:</strong> {vnpay.amount ? `${(vnpay.amount / 100).toLocaleString('vi-VN')} VND` : 'N/A'}</p>
              <p><strong>Bank:</strong> {vnpay.bankCode}</p>
              <p><strong>Status:</strong> <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{result.status}</span></p>
            </div>
          </div>
        }
        extra={[
          <Button type="primary" key="orders" onClick={() => navigate('/orders')}>
            View My Orders
          </Button>,
          <Button key="home" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>,
        ]}
      />
    );
  }

  return (
    <Result
      status="error"
      icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
      title="Payment Failed"
      subTitle={
        <div>
          <p>{result?.message || 'Payment transaction was not successful.'}</p>
          {result?.vnpayQuery?.message && (
            <p style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '8px' }}>
              ({result.vnpayQuery.message})
            </p>
          )}
          <div style={{ marginTop: '20px', textAlign: 'left', display: 'inline-block', backgroundColor: '#fff2f0', padding: '16px', borderRadius: '8px', border: '1px solid #ffccc7' }}>
            {result?.orderCode && <p><strong>Order Code:</strong> {result.orderCode}</p>}
            {result?.callbackInfo?.txnRef && <p><strong>Reference Code:</strong> {result.callbackInfo.txnRef}</p>}
            {result?.status && <p><strong>Status:</strong> <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{result.status}</span></p>}
          </div>
        </div>
      }
      extra={[
        <Button type="primary" key="retry" onClick={() => navigate('/cart')}>
          Try Again
        </Button>,
        <Button key="home" onClick={() => navigate('/')}>
          Go to Home
        </Button>,
      ]}
    />
  );
};

export default VNPayReturn;
