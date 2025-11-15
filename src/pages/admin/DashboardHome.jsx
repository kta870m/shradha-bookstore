import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Spin, Typography, Modal } from 'antd';
import { 
  ShoppingOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  DollarOutlined,
  PlusOutlined,
  OrderedListOutlined,
  TeamOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import AdminRegister from './AdminRegister';

const { Title } = Typography;

// Revenue formatter for charts
const formatRevenue = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M ₫`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K ₫`;
  }
  return `${value} ₫`;
};

function DashboardHome() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    salesData: [],
    categoryData: [],
    revenueData: []
  });
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        window.$axios.get('/products'),
        window.$axios.get('/orders')
      ]);

      setStats({
        totalProducts: productsRes.data.length,
        totalOrders: ordersRes.data.length,
        totalCustomers: 0,
        totalRevenue: ordersRes.data.reduce((sum, order) => sum + order.totalAmount, 0)
      });

      generateChartData(productsRes.data, ordersRes.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (products, orders) => {
    const salesData = [
      { name: 'T2', sales: Math.floor(Math.random() * 50) + 20, orders: Math.floor(Math.random() * 20) + 5 },
      { name: 'T3', sales: Math.floor(Math.random() * 50) + 20, orders: Math.floor(Math.random() * 20) + 5 },
      { name: 'T4', sales: Math.floor(Math.random() * 50) + 20, orders: Math.floor(Math.random() * 20) + 5 },
      { name: 'T5', sales: Math.floor(Math.random() * 50) + 20, orders: Math.floor(Math.random() * 20) + 5 },
      { name: 'T6', sales: Math.floor(Math.random() * 50) + 20, orders: Math.floor(Math.random() * 20) + 5 },
      { name: 'T7', sales: Math.floor(Math.random() * 50) + 20, orders: Math.floor(Math.random() * 20) + 5 },
      { name: 'CN', sales: Math.floor(Math.random() * 50) + 20, orders: Math.floor(Math.random() * 20) + 5 },
    ];

    const categoryData = [
      { name: 'Fiction', value: 35, fill: '#0EADD5' },
      { name: 'Non-Fiction', value: 25, fill: '#52c41a' },
      { name: 'Educational', value: 20, fill: '#fa8c16' },
      { name: 'Children', value: 15, fill: '#722ed1' },
      { name: 'Other', value: 5, fill: '#f5222d' },
    ];

    const revenueData = [
      { month: 'T6', revenue: 45000000, profit: 15000000 },
      { month: 'T7', revenue: 52000000, profit: 18000000 },
      { month: 'T8', revenue: 48000000, profit: 16000000 },
      { month: 'T9', revenue: 61000000, profit: 22000000 },
      { month: 'T10', revenue: 55000000, profit: 19000000 },
      { month: 'T11', revenue: 67000000, profit: 25000000 },
    ];

    setChartData({ salesData, categoryData, revenueData });
  };

  const generateMockData = () => {
    const salesData = [
      { name: 'T2', sales: 35, orders: 12 },
      { name: 'T3', sales: 42, orders: 15 },
      { name: 'T4', sales: 38, orders: 10 },
      { name: 'T5', sales: 55, orders: 18 },
      { name: 'T6', sales: 48, orders: 16 },
      { name: 'T7', sales: 62, orders: 22 },
      { name: 'CN', sales: 45, orders: 14 },
    ];

    const categoryData = [
      { name: 'Fiction', value: 35, fill: '#0EADD5' },
      { name: 'Non-Fiction', value: 25, fill: '#52c41a' },
      { name: 'Educational', value: 20, fill: '#fa8c16' },
      { name: 'Children', value: 15, fill: '#722ed1' },
      { name: 'Other', value: 5, fill: '#f5222d' },
    ];

    const revenueData = [
      { month: 'T6', revenue: 45000000, profit: 15000000 },
      { month: 'T7', revenue: 52000000, profit: 18000000 },
      { month: 'T8', revenue: 48000000, profit: 16000000 },
      { month: 'T9', revenue: 61000000, profit: 22000000 },
      { month: 'T10', revenue: 55000000, profit: 19000000 },
      { month: 'T11', revenue: 67000000, profit: 25000000 },
    ];

    setChartData({ salesData, categoryData, revenueData });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24, color: '#1f2937' }}>
        Dashboard Overview
      </Title>
      
      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #f0f0f0' }}>
            <Statistic
              title="Sản phẩm"
              value={stats.totalProducts}
              prefix={<ShoppingOutlined style={{ color: '#1890ff', fontSize: 20 }} />}
              valueStyle={{ color: '#1f2937', fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #f0f0f0' }}>
            <Statistic
              title="Đơn hàng"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined style={{ color: '#52c41a', fontSize: 20 }} />}
              valueStyle={{ color: '#1f2937', fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #f0f0f0' }}>
            <Statistic
              title="Khách hàng"
              value={stats.totalCustomers}
              prefix={<UserOutlined style={{ color: '#722ed1', fontSize: 20 }} />}
              valueStyle={{ color: '#1f2937', fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #f0f0f0' }}>
            <Statistic
              title="Doanh thu"
              value={stats.totalRevenue}
              prefix={<DollarOutlined style={{ color: '#fa8c16', fontSize: 20 }} />}
              suffix="₫"
              formatter={(value) => value.toLocaleString('vi-VN')}
              valueStyle={{ color: '#1f2937', fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card 
        title={<Title level={3} style={{ margin: 0, color: '#1f2937' }}>Thao tác nhanh</Title>}
        style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #f0f0f0', marginBottom: 32 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Button 
              type="primary" 
              size="large" 
              icon={<PlusOutlined />}
              block
              style={{ height: 60, borderRadius: 8, background: 'linear-gradient(135deg, #0EADD5 0%, #0c94bb 100%)', border: 'none', boxShadow: '0 4px 12px rgba(14, 173, 213, 0.3)' }}
            >
              Thêm sản phẩm
            </Button>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={4}>
            <Button 
              type="default" 
              size="large" 
              icon={<OrderedListOutlined />}
              block
              style={{ height: 60, borderRadius: 8, borderColor: '#d9d9d9' }}
            >
              Xem đơn hàng
            </Button>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={4}>
            <Button 
              type="default" 
              size="large" 
              icon={<TeamOutlined />}
              block
              style={{ height: 60, borderRadius: 8, borderColor: '#d9d9d9' }}
            >
              Khách hàng
            </Button>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={4}>
            <Button 
              type="default" 
              size="large" 
              icon={<BarChartOutlined />}
              block
              style={{ height: 60, borderRadius: 8, borderColor: '#d9d9d9' }}
            >
              Báo cáo
            </Button>
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <Button 
              type="dashed" 
              size="large" 
              icon={<UserAddOutlined />}
              block
              onClick={() => setShowRegisterModal(true)}
              style={{ height: 60, borderRadius: 8, borderColor: '#722ed1', color: '#722ed1' }}
            >
              Tạo Admin
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Charts Section */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChartOutlined style={{ color: '#0EADD5', fontSize: 20 }} />
                <Title level={4} style={{ margin: 0, color: '#1f2937' }}>Doanh số bán hàng (7 ngày qua)</Title>
              </div>
            }
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #f0f0f0' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" name="Doanh số (triệu đồng)" fill="#0EADD5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="orders" name="Đơn hàng" fill="#52c41a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PieChartOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                <Title level={4} style={{ margin: 0, color: '#1f2937' }}>Phân loại sách</Title>
              </div>
            }
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #f0f0f0', height: '100%' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData.categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => percent > 8 ? `${name}` : ''} outerRadius={85} innerRadius={30} fill="#8884d8" dataKey="value" stroke="#fff" strokeWidth={2}>
                  {chartData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LineChartOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
                <Title level={4} style={{ margin: 0, color: '#1f2937' }}>Xu hướng doanh thu (6 tháng qua)</Title>
              </div>
            }
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #f0f0f0' }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData.revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EADD5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0EADD5" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#52c41a" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={formatRevenue} />
                <Tooltip formatter={(value, name) => [`${value.toLocaleString('vi-VN')} ₫`, name === 'revenue' ? 'Doanh thu' : 'Lợi nhuận']} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#0EADD5" fillOpacity={1} fill="url(#colorRevenue)" name="Doanh thu" />
                <Area type="monotone" dataKey="profit" stroke="#52c41a" fillOpacity={1} fill="url(#colorProfit)" name="Lợi nhuận" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Tạo tài khoản Admin mới"
        open={showRegisterModal}
        onCancel={() => setShowRegisterModal(false)}
        footer={null}
        width={600}
      >
        <AdminRegister onSuccess={() => setShowRegisterModal(false)} />
      </Modal>
    </div>
  );
}

export default DashboardHome;