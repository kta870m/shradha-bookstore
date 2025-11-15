import React from "react";
import { Card, Row, Col, Tag, Steps } from "antd";
import { ShoppingCartOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from "@ant-design/icons";

const Ordering = () => {
  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: 42, marginBottom: 15, color: "#111827" }}>
          How to Order
        </h1>
        <p style={{ fontSize: 18, color: "#6b7280" }}>
          Multiple ways to place your book order with Shradha Bookstore
        </p>
      </div>

      <Card style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 28, marginBottom: 25, color: "#111827" }}>
          Order Methods
        </h2>
        <Row gutter={[30, 30]}>
          <Col xs={24} md={12}>
            <div style={{ padding: 25, border: "2px solid #667eea", borderRadius: 12, height: "100%", background: "#f0f4ff" }}>
              <ShoppingCartOutlined style={{ fontSize: 42, color: "#667eea", marginBottom: 15 }} />
              <h3 style={{ fontSize: 20, marginBottom: 15, color: "#111827" }}>
                Online Store
              </h3>
              <p style={{ color: "#6b7280", lineHeight: 1.8, marginBottom: 15 }}>
                Browse and order 24/7 from our website:
              </p>
              <Steps
                direction="vertical"
                size="small"
                current={-1}
                items={[
                  { title: "Browse books and add to cart" },
                  { title: "Proceed to checkout" },
                  { title: "Enter shipping details" },
                  { title: "Choose payment method" },
                  { title: "Confirm order" },
                ]}
              />
              <Tag color="green" style={{ marginTop: 15 }}>Most Popular</Tag>
              <Tag color="blue">24/7 Available</Tag>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ padding: 25, border: "2px solid #10b981", borderRadius: 12, height: "100%", background: "#f0fdf4" }}>
              <PhoneOutlined style={{ fontSize: 42, color: "#10b981", marginBottom: 15 }} />
              <h3 style={{ fontSize: 20, marginBottom: 15, color: "#111827" }}>
                Phone Order
              </h3>
              <p style={{ color: "#6b7280", lineHeight: 1.8, marginBottom: 15 }}>
                Call us to place your order:
              </p>
              <div style={{ background: "white", padding: 20, borderRadius: 8, marginBottom: 15 }}>
                <p style={{ fontSize: 20, fontWeight: "bold", color: "#10b981", marginBottom: 10 }}>
                  091 256 1800
                </p>
                <p style={{ color: "#6b7280", margin: 0 }}>
                  <strong>Hours:</strong> 9:00 AM - 7:00 PM<br />
                  <strong>Days:</strong> 7 days a week
                </p>
              </div>
              <p style={{ color: "#6b7280", fontSize: 14 }}>
                Our staff will help you find books, check availability, and process your order over the phone.
              </p>
              <Tag color="orange">Personal Service</Tag>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ padding: 25, border: "2px solid #f59e0b", borderRadius: 12, height: "100%", background: "#fffbeb" }}>
              <MailOutlined style={{ fontSize: 42, color: "#f59e0b", marginBottom: 15 }} />
              <h3 style={{ fontSize: 20, marginBottom: 15, color: "#111827" }}>
                Email Order
              </h3>
              <p style={{ color: "#6b7280", lineHeight: 1.8, marginBottom: 15 }}>
                Send your order via email:
              </p>
              <div style={{ background: "white", padding: 20, borderRadius: 8, marginBottom: 15 }}>
                <p style={{ fontSize: 18, fontWeight: "bold", color: "#f59e0b", marginBottom: 10 }}>
                  orders@shradha.com
                </p>
                <p style={{ color: "#6b7280", fontSize: 14 }}>
                  Include: Book titles, quantities, your name, phone number, and delivery address
                </p>
              </div>
              <p style={{ color: "#6b7280", fontSize: 14 }}>
                We'll respond within 4 hours during business hours with availability and total cost.
              </p>
              <Tag color="purple">Bulk Orders Welcome</Tag>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ padding: 25, border: "2px solid #ec4899", borderRadius: 12, height: "100%", background: "#fdf2f8" }}>
              <EnvironmentOutlined style={{ fontSize: 42, color: "#ec4899", marginBottom: 15 }} />
              <h3 style={{ fontSize: 20, marginBottom: 15, color: "#111827" }}>
                In-Store Visit
              </h3>
              <p style={{ color: "#6b7280", lineHeight: 1.8, marginBottom: 15 }}>
                Visit our physical store:
              </p>
              <div style={{ background: "white", padding: 20, borderRadius: 8, marginBottom: 15 }}>
                <p style={{ fontSize: 16, fontWeight: "bold", color: "#ec4899", marginBottom: 10 }}>
                  44 Phạm Hồng Thái, Ba Đình, Hanoi
                </p>
                <p style={{ color: "#6b7280", fontSize: 14 }}>
                  <strong>Hours:</strong> 9:00 AM - 9:00 PM<br />
                  <strong>Days:</strong> Monday - Sunday
                </p>
              </div>
              <p style={{ color: "#6b7280", fontSize: 14 }}>
                Browse in person, get recommendations from our staff, and take your books home immediately!
              </p>
              <Tag color="red">Instant Pickup</Tag>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="Bulk & Wholesale Orders" style={{ marginBottom: 30 }}>
        <p style={{ fontSize: 16, color: "#4b5563", lineHeight: 1.8, marginBottom: 15 }}>
          We offer special rates for:
        </p>
        <Row gutter={[30, 20]}>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827" }}>🏫 Educational Institutions</h4>
            <ul style={{ color: "#6b7280", lineHeight: 2 }}>
              <li>Schools and universities</li>
              <li>Libraries and learning centers</li>
              <li>Minimum order: 50 books</li>
              <li>Discount: 15-25% depending on quantity</li>
            </ul>
          </Col>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827" }}>🏢 Corporate Orders</h4>
            <ul style={{ color: "#6b7280", lineHeight: 2 }}>
              <li>Companies and organizations</li>
              <li>Book clubs and reading groups</li>
              <li>Minimum order: 20 books</li>
              <li>Customized invoicing available</li>
            </ul>
          </Col>
        </Row>
        <div style={{ marginTop: 20, padding: 20, background: "#f9fafb", borderRadius: 8 }}>
          <p style={{ color: "#4b5563", marginBottom: 10 }}>
            <strong>For bulk orders, please contact:</strong>
          </p>
          <p style={{ color: "#6b7280", fontSize: 15 }}>
            📧 wholesale@shradha.com<br />
            📞 091 256 1800 (ext. 2)<br />
            ⏰ Response time: Within 24 hours
          </p>
        </div>
      </Card>

      <Card title="Special Requests" style={{ marginBottom: 30 }}>
        <h3 style={{ fontSize: 18, marginBottom: 15, color: "#111827" }}>
          Can't Find a Book?
        </h3>
        <p style={{ color: "#6b7280", lineHeight: 1.8, marginBottom: 20 }}>
          If the book you're looking for isn't in our catalog, we can help! We offer:
        </p>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <div style={{ padding: 20, border: "1px solid #e5e7eb", borderRadius: 8 }}>
              <h4 style={{ color: "#111827", marginBottom: 10 }}>📦 Special Orders</h4>
              <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>
                We can order any book in print from publishers worldwide. Delivery time: 2-4 weeks.
                A 30% deposit is required for special orders.
              </p>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ padding: 20, border: "1px solid #e5e7eb", borderRadius: 8 }}>
              <h4 style={{ color: "#111827", marginBottom: 10 }}>🔍 Book Search Service</h4>
              <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>
                Looking for rare or out-of-print books? Our team will search our network of suppliers
                and used book sources. Fee: ₫50,000 (waived if we find the book).
              </p>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="Order Tracking & Support" style={{ background: "#f9fafb" }}>
        <h3 style={{ fontSize: 18, marginBottom: 15, color: "#111827" }}>
          After You Order
        </h3>
        <ul style={{ fontSize: 15, color: "#6b7280", lineHeight: 2, marginBottom: 20 }}>
          <li>You'll receive an order confirmation via email and SMS within 5 minutes</li>
          <li>Track your order status in real-time on our website or mobile app</li>
          <li>Receive shipping notification with tracking number when dispatched</li>
          <li>Get delivery updates via SMS as your package moves</li>
        </ul>
        <h3 style={{ fontSize: 18, marginBottom: 15, color: "#111827" }}>
          Need Help with Your Order?
        </h3>
        <p style={{ color: "#6b7280", marginBottom: 10 }}>
          Our customer service team is here to assist:
        </p>
        <ul style={{ fontSize: 15, color: "#6b7280", lineHeight: 2 }}>
          <li><strong>Phone:</strong> 091 256 1800 (9am - 7pm, 7 days)</li>
          <li><strong>Email:</strong> support@shradha.com</li>
          <li><strong>Live Chat:</strong> Available on our website</li>
          <li><strong>Response Time:</strong> Within 2 hours during business hours</li>
        </ul>
      </Card>
    </div>
  );
};

export default Ordering;
