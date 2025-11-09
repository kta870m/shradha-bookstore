import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Spin, Typography } from 'antd';
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
  PieChartOutlined
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
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import '../../styles/DashboardHome.css';

const { Title } = Typography;

// Custom tooltip formatter
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '12px',
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#1f2937' }}>{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ 
            margin: '4px 0', 
            color: entry.color,
            fontSize: '14px' 
          }}>
            {`${entry.name}: ${entry.value.toLocaleString('vi-VN')}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Sử dụng window.$axios để fetch data
      const [productsRes, ordersRes] = await Promise.all([
        window.$axios.get('/products'),
        window.$axios.get('/orders')
      ]);

      setStats({
        totalProducts: productsRes.data.length,
        totalOrders: ordersRes.data.length,
        totalCustomers: 0, // Tạm thời
        totalRevenue: ordersRes.data.reduce((sum, order) => sum + order.totalAmount, 0)
      });

      // Generate mock chart data
      generateChartData(productsRes.data, ordersRes.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to mock data if API fails
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (products, orders) => {
    // Sales data for last 7 days
    const salesData = [
      { name: 'T2', sales: Math.floor(Math.random() * 50) + 20, orders: Math.floor(Math.random() * 20) + 5 },
      { name: 'T3', sales: Math.floor(Math.random() * 50) + 20, orders: Math.floor(Math.random() * 20) + 5 },
      { name: 'T4', sales: Math.floor(Math.random() * 50) + 20, orders: Math.floor(Math.random() * 20) + 5 },
      { name: 'T5', sales: Math.floor(Math.random() * 50) + 20, orders: Math.floor(Math.random() * 20) + 5 },
      { name: 'T6', sales: Math.floor(Math.random() * 50) + 20, orders: Math.floor(Math.random() * 20) + 5 },
      { name: 'T7', sales: Math.floor(Math.random() * 50) + 20, orders: Math.floor(Math.random() * 20) + 5 },
      { name: 'CN', sales: Math.floor(Math.random() * 50) + 20, orders: Math.floor(Math.random() * 20) + 5 },
    ];

    // Category distribution
    const categoryData = [
      { name: 'Fiction', value: 35, fill: '#0EADD5' },
      { name: 'Non-Fiction', value: 25, fill: '#52c41a' },
      { name: 'Educational', value: 20, fill: '#fa8c16' },
      { name: 'Children', value: 15, fill: '#722ed1' },
      { name: 'Other', value: 5, fill: '#f5222d' },
    ];

    // Revenue data for last 6 months
    const revenueData = [
      { month: 'T6', revenue: 45000000, profit: 15000000 },
      { month: 'T7', revenue: 52000000, profit: 18000000 },
      { month: 'T8', revenue: 48000000, profit: 16000000 },
      { month: 'T9', revenue: 61000000, profit: 22000000 },
      { month: 'T10', revenue: 55000000, profit: 19000000 },
      { month: 'T11', revenue: 67000000, profit: 25000000 },
    ];

    setChartData({
      salesData,
      categoryData,
      revenueData
    });
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

    setChartData({
      salesData,
      categoryData,
      revenueData
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <Title level={2} style={{ marginBottom: 24, color: '#1f2937' }}>
        Dashboard Overview
      </Title>
      
      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="stats-card"
            hoverable
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}
          >
            <Statistic
              title="Sản phẩm"
              value={stats.totalProducts}
              prefix={<ShoppingOutlined style={{ color: '#1890ff', fontSize: 20 }} />}
              valueStyle={{ 
                color: '#1f2937',
                fontSize: 28,
                fontWeight: 600
              }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="stats-card"
            hoverable
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}
          >
            <Statistic
              title="Đơn hàng"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined style={{ color: '#52c41a', fontSize: 20 }} />}
              valueStyle={{ 
                color: '#1f2937',
                fontSize: 28,
                fontWeight: 600
              }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="stats-card"
            hoverable
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}
          >
            <Statistic
              title="Khách hàng"
              value={stats.totalCustomers}
              prefix={<UserOutlined style={{ color: '#722ed1', fontSize: 20 }} />}
              valueStyle={{ 
                color: '#1f2937',
                fontSize: 28,
                fontWeight: 600
              }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="stats-card"
            hoverable
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}
          >
            <Statistic
              title="Doanh thu"
              value={stats.totalRevenue}
              prefix={<DollarOutlined style={{ color: '#fa8c16', fontSize: 20 }} />}
              suffix="₫"
              formatter={(value) => value.toLocaleString('vi-VN')}
              valueStyle={{ 
                color: '#1f2937',
                fontSize: 28,
                fontWeight: 600
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card 
        title={
          <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
            Thao tác nhanh
          </Title>
        }
        style={{ 
          borderRadius: 12, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #f0f0f0'
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Button 
              type="primary" 
              size="large" 
              icon={<PlusOutlined />}
              block
              style={{ 
                height: 60,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #0EADD5 0%, #0c94bb 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(14, 173, 213, 0.3)'
              }}
            >
              Thêm sản phẩm mới
            </Button>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Button 
              type="default" 
              size="large" 
              icon={<OrderedListOutlined />}
              block
              style={{ 
                height: 60,
                borderRadius: 8,
                borderColor: '#d9d9d9'
              }}
            >
              Xem đơn hàng
            </Button>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Button 
              type="default" 
              size="large" 
              icon={<TeamOutlined />}
              block
              style={{ 
                height: 60,
                borderRadius: 8,
                borderColor: '#d9d9d9'
              }}
            >
              Quản lý khách hàng
            </Button>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Button 
              type="default" 
              size="large" 
              icon={<BarChartOutlined />}
              block
              style={{ 
                height: 60,
                borderRadius: 8,
                borderColor: '#d9d9d9'
              }}
            >
              Xem báo cáo
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Charts Section */}
      <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
        {/* Sales Chart */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChartOutlined style={{ color: '#0EADD5', fontSize: 20 }} />
                <Title level={4} style={{ margin: 0, color: '#1f2937' }}>
                  Doanh số bán hàng (7 ngày qua)
                </Title>
              </div>
            }
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={{ stroke: '#d9d9d9' }}
                  axisLine={{ stroke: '#d9d9d9' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={{ stroke: '#d9d9d9' }}
                  axisLine={{ stroke: '#d9d9d9' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #d9d9d9',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="sales" 
                  name="Doanh số (triệu đồng)"
                  fill="#0EADD5" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="orders" 
                  name="Đơn hàng"
                  fill="#52c41a" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Category Distribution Pie Chart */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PieChartOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                <Title level={4} style={{ margin: 0, color: '#1f2937' }}>
                  Phân loại sách
                </Title>
              </div>
            }
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0',
              height: '100%'
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text 
                        x={x} 
                        y={y} 
                        fill="white" 
                        textAnchor={x > cx ? 'start' : 'end'} 
                        dominantBaseline="central"
                        fontSize="10"
                        fontWeight="600"
                      >
                        {percent > 8 ? `${name}` : ''}
                      </text>
                    );
                  }}
                  outerRadius={85}
                  innerRadius={30}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {chartData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #d9d9d9',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => [
                    `${value}%`,
                    name
                  ]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontSize: '12px' }}>
                      {value}: {entry.payload.value}%
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Revenue Trend Chart */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LineChartOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
                <Title level={4} style={{ margin: 0, color: '#1f2937' }}>
                  Xu hướng doanh thu (6 tháng qua)
                </Title>
              </div>
            }
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}
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
                <XAxis 
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={{ stroke: '#d9d9d9' }}
                  axisLine={{ stroke: '#d9d9d9' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={{ stroke: '#d9d9d9' }}
                  axisLine={{ stroke: '#d9d9d9' }}
                  tickFormatter={formatRevenue}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #d9d9d9',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => [
                    `${value.toLocaleString('vi-VN')} ₫`,
                    name === 'revenue' ? 'Doanh thu' : 'Lợi nhuận'
                  ]}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0EADD5" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)"
                  name="Doanh thu"
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#52c41a" 
                  fillOpacity={1} 
                  fill="url(#colorProfit)"
                  name="Lợi nhuận"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardHome;
