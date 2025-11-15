import React from "react";
import { Card, Row, Col, Timeline, Collapse, Alert } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined, CheckCircleOutlined } from "@ant-design/icons";

const ShippingPolicy = () => {
  const { Panel } = Collapse;

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: 42, marginBottom: 15, color: "#111827" }}>
          Shipping Policy
        </h1>
        <p style={{ fontSize: 18, color: "#6b7280" }}>
          Delivery information, rates, and timelines
        </p>
      </div>

      <Alert
        message="Free Shipping on Orders Over ₫500,000"
        description="Enjoy free standard shipping nationwide for all orders above ₫500,000!"
        type="success"
        showIcon
        style={{ marginBottom: 30 }}
      />

      <Card style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 28, marginBottom: 25, color: "#111827" }}>
          Shipping Zones & Rates
        </h2>
        <Row gutter={[30, 30]}>
          <Col xs={24} md={12}>
            <div style={{ padding: 25, border: "2px solid #667eea", borderRadius: 12, background: "#f0f4ff" }}>
              <EnvironmentOutlined style={{ fontSize: 36, color: "#667eea", marginBottom: 15 }} />
              <h3 style={{ fontSize: 20, marginBottom: 15, color: "#111827" }}>
                Zone 1: Hanoi City
              </h3>
              <p style={{ color: "#4b5563", marginBottom: 10, fontSize: 16 }}>
                <strong>Rate:</strong> ₫25,000 (Free over ₫300,000)
              </p>
              <p style={{ color: "#6b7280", fontSize: 15 }}>
                <ClockCircleOutlined /> <strong>Delivery:</strong> 1-2 business days
              </p>
              <p style={{ color: "#6b7280", fontSize: 14, marginTop: 10 }}>
                Same-day delivery available for orders placed before 12pm
              </p>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ padding: 25, border: "2px solid #10b981", borderRadius: 12, background: "#f0fdf4" }}>
              <EnvironmentOutlined style={{ fontSize: 36, color: "#10b981", marginBottom: 15 }} />
              <h3 style={{ fontSize: 20, marginBottom: 15, color: "#111827" }}>
                Zone 2: Major Cities
              </h3>
              <p style={{ color: "#4b5563", marginBottom: 10, fontSize: 16 }}>
                <strong>Rate:</strong> ₫35,000 (Free over ₫300,000)
              </p>
              <p style={{ color: "#6b7280", fontSize: 15 }}>
                <ClockCircleOutlined /> <strong>Delivery:</strong> 2-3 business days
              </p>
              <p style={{ color: "#6b7280", fontSize: 14, marginTop: 10 }}>
                Ho Chi Minh, Da Nang, Hai Phong, Can Tho
              </p>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ padding: 25, border: "2px solid #f59e0b", borderRadius: 12, background: "#fffbeb" }}>
              <EnvironmentOutlined style={{ fontSize: 36, color: "#f59e0b", marginBottom: 15 }} />
              <h3 style={{ fontSize: 20, marginBottom: 15, color: "#111827" }}>
                Zone 3: Provincial Areas
              </h3>
              <p style={{ color: "#4b5563", marginBottom: 10, fontSize: 16 }}>
                <strong>Rate:</strong> ₫45,000 (Free over ₫300,000)
              </p>
              <p style={{ color: "#6b7280", fontSize: 15 }}>
                <ClockCircleOutlined /> <strong>Delivery:</strong> 3-5 business days
              </p>
              <p style={{ color: "#6b7280", fontSize: 14, marginTop: 10 }}>
                Most provincial cities and towns
              </p>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ padding: 25, border: "2px solid #ef4444", borderRadius: 12, background: "#fef2f2" }}>
              <EnvironmentOutlined style={{ fontSize: 36, color: "#ef4444", marginBottom: 15 }} />
              <h3 style={{ fontSize: 20, marginBottom: 15, color: "#111827" }}>
                Zone 4: Remote Areas
              </h3>
              <p style={{ color: "#4b5563", marginBottom: 10, fontSize: 16 }}>
                <strong>Rate:</strong> ₫60,000 (Free over ₫300,000)
              </p>
              <p style={{ color: "#6b7280", fontSize: 15 }}>
                <ClockCircleOutlined /> <strong>Delivery:</strong> 5-7 business days
              </p>
              <p style={{ color: "#6b7280", fontSize: 14, marginTop: 10 }}>
                Mountain areas, islands, and remote districts
              </p>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="Order Processing Timeline" style={{ marginBottom: 30 }}>
        <Timeline
          items={[
            {
              color: "blue",
              children: (
                <>
                  <strong style={{ color: "#111827" }}>Order Received</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Your order is confirmed and payment is verified
                  </p>
                </>
              ),
            },
            {
              color: "green",
              children: (
                <>
                  <strong style={{ color: "#111827" }}>Processing (4-6 hours)</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Books are picked, packed, and prepared for shipment
                  </p>
                </>
              ),
            },
            {
              color: "orange",
              children: (
                <>
                  <strong style={{ color: "#111827" }}>In Transit</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Your package is on its way via our shipping partners
                  </p>
                </>
              ),
            },
            {
              color: "purple",
              children: (
                <>
                  <strong style={{ color: "#111827" }}>Out for Delivery</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Package is with the courier for final delivery
                  </p>
                </>
              ),
            },
            {
              dot: <CheckCircleOutlined style={{ fontSize: 16 }} />,
              color: "green",
              children: (
                <>
                  <strong style={{ color: "#111827" }}>Delivered</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Enjoy your books!
                  </p>
                </>
              ),
            },
          ]}
        />
      </Card>

      <Card title="Shipping Options" style={{ marginBottom: 30 }}>
        <Collapse accordion>
          <Panel header="Standard Shipping" key="1">
            <p style={{ marginBottom: 10 }}>
              <strong>Delivery Time:</strong> 1-7 business days depending on location
            </p>
            <p style={{ marginBottom: 10 }}>
              <strong>Cost:</strong> ₫25,000 - ₫60,000 (FREE over ₫300,000)
            </p>
            <p style={{ marginBottom: 10 }}>
              <strong>Tracking:</strong> Full tracking provided
            </p>
            <p style={{ color: "#6b7280" }}>
              Our most economical option with reliable delivery through Vietnam Post and trusted courier partners.
            </p>
          </Panel>

          <Panel header="Express Shipping" key="2">
            <p style={{ marginBottom: 10 }}>
              <strong>Delivery Time:</strong> 1-3 business days nationwide
            </p>
            <p style={{ marginBottom: 10 }}>
              <strong>Cost:</strong> ₫60,000 - ₫100,000
            </p>
            <p style={{ marginBottom: 10 }}>
              <strong>Tracking:</strong> Real-time tracking with SMS updates
            </p>
            <p style={{ color: "#6b7280" }}>
              Priority delivery through express couriers (Viettel Post, GHN, GHTK) with guaranteed delivery times.
            </p>
          </Panel>

          <Panel header="Same-Day Delivery (Hanoi Only)" key="3">
            <p style={{ marginBottom: 10 }}>
              <strong>Delivery Time:</strong> 4-8 hours
            </p>
            <p style={{ marginBottom: 10 }}>
              <strong>Cost:</strong> ₫50,000
            </p>
            <p style={{ marginBottom: 10 }}>
              <strong>Cutoff Time:</strong> Order before 12pm for same-day delivery
            </p>
            <p style={{ color: "#6b7280" }}>
              Available for Hanoi city center. Perfect for urgent orders or last-minute gifts.
            </p>
          </Panel>

          <Panel header="In-Store Pickup (Free)" key="4">
            <p style={{ marginBottom: 10 }}>
              <strong>Ready Time:</strong> 2-4 hours after order
            </p>
            <p style={{ marginBottom: 10 }}>
              <strong>Cost:</strong> FREE
            </p>
            <p style={{ marginBottom: 10 }}>
              <strong>Location:</strong> 44 Phạm Hồng Thái, Ba Đình, Hanoi
            </p>
            <p style={{ color: "#6b7280" }}>
              Order online and pick up at our store. We'll notify you when your order is ready. Bring your order confirmation and ID.
            </p>
          </Panel>
        </Collapse>
      </Card>

      <Card title="Packaging & Handling" style={{ marginBottom: 30 }}>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827", marginBottom: 10 }}>📦 Secure Packaging</h4>
            <p style={{ color: "#6b7280", fontSize: 15 }}>
              All books are wrapped in bubble wrap or protective sleeves and packed in sturdy boxes to prevent damage during transit.
            </p>
          </Col>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827", marginBottom: 10 }}>🌱 Eco-Friendly Materials</h4>
            <p style={{ color: "#6b7280", fontSize: 15 }}>
              We use recyclable cardboard boxes and biodegradable packing materials whenever possible to minimize environmental impact.
            </p>
          </Col>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827", marginBottom: 10 }}>💝 Gift Wrapping</h4>
            <p style={{ color: "#6b7280", fontSize: 15 }}>
              Free gift wrapping available upon request. Add a note at checkout and we'll beautifully wrap your books with a greeting card.
            </p>
          </Col>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827", marginBottom: 10 }}>🏷️ Discreet Packaging</h4>
            <p style={{ color: "#6b7280", fontSize: 15 }}>
              Plain boxes with no external branding or book titles visible, ensuring your privacy and preventing theft.
            </p>
          </Col>
        </Row>
      </Card>

      <Card title="Important Shipping Information" style={{ background: "#fffbeb", borderColor: "#fbbf24" }}>
        <ul style={{ fontSize: 15, color: "#78350f", lineHeight: 2, marginBottom: 0 }}>
          <li><strong>Address Accuracy:</strong> Please double-check your shipping address. We cannot be responsible for incorrect addresses provided.</li>
          <li><strong>Delivery Attempts:</strong> Couriers will attempt delivery up to 3 times. If unsuccessful, the package will be returned.</li>
          <li><strong>Signature Required:</strong> High-value orders (over ₫1,000,000) require signature upon delivery.</li>
          <li><strong>Weather Delays:</strong> Severe weather conditions may cause delays beyond our control.</li>
          <li><strong>Holiday Shipping:</strong> Expect 1-2 day delays during Tet and major holidays.</li>
          <li><strong>Tracking Updates:</strong> Track your order anytime using the tracking number sent via email/SMS.</li>
        </ul>
      </Card>
    </div>
  );
};

export default ShippingPolicy;
