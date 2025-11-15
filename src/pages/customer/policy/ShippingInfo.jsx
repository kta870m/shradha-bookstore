import React from "react";
import { Card, Row, Col, Timeline } from "antd";
import {
  RocketOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const ShippingInfo = () => {
  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: 42, marginBottom: 15, color: "#111827" }}>
          Shipping & Delivery
        </h1>
        <p style={{ fontSize: 18, color: "#6b7280" }}>
          Fast, reliable delivery to your doorstep
        </p>
      </div>

      <Row gutter={[30, 30]} style={{ marginBottom: 40 }}>
        <Col xs={24} md={12} lg={6}>
          <Card style={{ textAlign: "center", height: "100%" }}>
            <RocketOutlined style={{ fontSize: 48, color: "#4facfe", marginBottom: 15 }} />
            <h3 style={{ fontSize: 18, marginBottom: 10 }}>Same-Day Delivery</h3>
            <p style={{ color: "#6b7280" }}>
              Order before 2 PM and get your books the same day within Hanoi
            </p>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card style={{ textAlign: "center", height: "100%" }}>
            <ClockCircleOutlined style={{ fontSize: 48, color: "#667eea", marginBottom: 15 }} />
            <h3 style={{ fontSize: 18, marginBottom: 10 }}>Express Delivery</h3>
            <p style={{ color: "#6b7280" }}>
              1-2 days delivery nationwide for urgent orders
            </p>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card style={{ textAlign: "center", height: "100%" }}>
            <EnvironmentOutlined style={{ fontSize: 48, color: "#f5576c", marginBottom: 15 }} />
            <h3 style={{ fontSize: 18, marginBottom: 10 }}>Standard Delivery</h3>
            <p style={{ color: "#6b7280" }}>
              3-5 days delivery to all provinces in Vietnam
            </p>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card style={{ textAlign: "center", height: "100%" }}>
            <DollarOutlined style={{ fontSize: 48, color: "#10b981", marginBottom: 15 }} />
            <h3 style={{ fontSize: 18, marginBottom: 10 }}>Free Shipping</h3>
            <p style={{ color: "#6b7280" }}>
              Free delivery on all orders over 500,000 VND
            </p>
          </Card>
        </Col>
      </Row>

      <Row gutter={[30, 30]}>
        <Col xs={24} lg={12}>
          <Card>
            <h2 style={{ fontSize: 28, marginBottom: 20, color: "#111827" }}>
              Shipping Rates
            </h2>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <strong>Hanoi (Same-Day)</strong>
                <span style={{ color: "#f5576c", fontWeight: "bold" }}>30,000đ</span>
              </div>
              <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
                Order before 2 PM for same-day delivery
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <strong>Express (1-2 days)</strong>
                <span style={{ color: "#f5576c", fontWeight: "bold" }}>50,000đ</span>
              </div>
              <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
                Available for major cities
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <strong>Standard (3-5 days)</strong>
                <span style={{ color: "#f5576c", fontWeight: "bold" }}>25,000đ</span>
              </div>
              <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
                Nationwide delivery
              </p>
            </div>

            <div
              style={{
                marginTop: 20,
                padding: 15,
                background: "#dcfce7",
                borderRadius: 8,
              }}
            >
              <strong style={{ color: "#166534" }}>FREE SHIPPING</strong>
              <p style={{ color: "#166534", marginTop: 5, marginBottom: 0 }}>
                on orders ≥ 500,000 VND
              </p>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card>
            <h2 style={{ fontSize: 28, marginBottom: 20, color: "#111827" }}>
              Delivery Process
            </h2>

            <Timeline
              items={[
                {
                  color: "blue",
                  children: (
                    <>
                      <strong>Order Confirmed</strong>
                      <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                        You'll receive a confirmation email with your order details
                      </p>
                    </>
                  ),
                },
                {
                  color: "blue",
                  children: (
                    <>
                      <strong>Processing</strong>
                      <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                        We carefully pack your books (usually within 2-4 hours)
                      </p>
                    </>
                  ),
                },
                {
                  color: "blue",
                  children: (
                    <>
                      <strong>Shipped</strong>
                      <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                        Your order is on its way! Track your package via SMS/Email
                      </p>
                    </>
                  ),
                },
                {
                  color: "green",
                  children: (
                    <>
                      <strong>Delivered</strong>
                      <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                        Enjoy your new books! 📚
                      </p>
                    </>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 30 }}>
        <h2 style={{ fontSize: 24, marginBottom: 20, color: "#111827" }}>
          Important Information
        </h2>

        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827" }}>📦 Order Tracking</h4>
            <p style={{ color: "#6b7280" }}>
              Track your order in real-time via the tracking number sent to your email
              and SMS. You can also check order status in your account dashboard.
            </p>
          </Col>

          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827" }}>🏠 Delivery Address</h4>
            <p style={{ color: "#6b7280" }}>
              Please ensure your delivery address is complete and accurate. We are not
              responsible for delays due to incorrect addresses.
            </p>
          </Col>

          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827" }}>⏰ Delivery Hours</h4>
            <p style={{ color: "#6b7280" }}>
              Deliveries are made Monday to Saturday, 9 AM - 6 PM. Sunday deliveries
              available for express orders at additional cost.
            </p>
          </Col>

          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827" }}>📞 Contact Us</h4>
            <p style={{ color: "#6b7280" }}>
              Need help with your delivery? Contact our support team at
              hotline 1900-xxxx or email support@shradha.com
            </p>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ShippingInfo;
