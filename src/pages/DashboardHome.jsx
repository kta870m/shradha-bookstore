import './DashboardHome.css';

const DashboardHome = () => {
    const stats = [
        {
            title: 'Total Products',
            value: '1,234',
            icon: 'fa-book',
            color: '#3498db',
            change: '+12%',
        },
        {
            title: 'Total Orders',
            value: '856',
            icon: 'fa-shopping-cart',
            color: '#2ecc71',
            change: '+8%',
        },
        {
            title: 'Total Customers',
            value: '2,345',
            icon: 'fa-users',
            color: '#9b59b6',
            change: '+15%',
        },
        {
            title: 'Revenue',
            value: '$45,678',
            icon: 'fa-dollar-sign',
            color: '#f39c12',
            change: '+23%',
        },
    ];

    const recentOrders = [
        { id: 'OR000001', customer: 'John Doe', amount: '$125.00', status: 'Completed' },
        { id: 'OR000002', customer: 'Jane Smith', amount: '$89.50', status: 'Processing' },
        { id: 'OR000003', customer: 'Bob Johnson', amount: '$234.00', status: 'Pending' },
        { id: 'OR000004', customer: 'Alice Brown', amount: '$56.25', status: 'Completed' },
    ];

    return (
        <div className="dashboard-home">
            <h2>Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-icon" style={{ background: stat.color }}>
                            <i className={`fas ${stat.icon}`}></i>
                        </div>
                        <div className="stat-info">
                            <div className="stat-title">{stat.title}</div>
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-change positive">{stat.change} from last month</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="dashboard-section">
                <h3>Recent Orders</h3>
                <div className="orders-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.customer}</td>
                                    <td>{order.amount}</td>
                                    <td>
                                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
