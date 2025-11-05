import { useState, useEffect } from 'react';
import '../../styles/DashboardHome.css';

function DashboardHome() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="dashboard-home">
      <h1>Dashboard Overview</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">📦</div>
          <div className="stat-info">
            <h3>Sản phẩm</h3>
            <p className="stat-number">{stats.totalProducts}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">🛒</div>
          <div className="stat-info">
            <h3>Đơn hàng</h3>
            <p className="stat-number">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon customers">👥</div>
          <div className="stat-info">
            <h3>Khách hàng</h3>
            <p className="stat-number">{stats.totalCustomers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-info">
            <h3>Doanh thu</h3>
            <p className="stat-number">{stats.totalRevenue.toLocaleString('vi-VN')} ₫</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Thao tác nhanh</h2>
        <div className="action-buttons">
          <button className="action-btn">➕ Thêm sản phẩm mới</button>
          <button className="action-btn">📋 Xem đơn hàng</button>
          <button className="action-btn">👤 Quản lý khách hàng</button>
          <button className="action-btn">📊 Xem báo cáo</button>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
