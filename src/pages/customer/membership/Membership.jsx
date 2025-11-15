import React from "react";
import { Card, Button, Row, Col } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

const Membership = () => {
  const benefits = [
    "5% discount on all purchases",
    "Free shipping on orders over 300,000 VND",
    "Early access to new releases",
    "Exclusive member-only events",
    "Birthday month special offers",
    "Priority customer service",
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: 42, marginBottom: 15, color: "#111827" }}>
          Bookworm Membership
        </h1>
        <p style={{ fontSize: 18, color: "#6b7280" }}>
          Join our exclusive membership program and enjoy amazing benefits!
        </p>
      </div>

      <Row gutter={[30, 30]}>
        <Col xs={24} lg={12}>
          <Card
            style={{
              height: "100%",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              border: "none",
            }}
          >
            <h2 style={{ color: "white", fontSize: 32, marginBottom: 20 }}>
              Annual Membership
            </h2>
            <div style={{ fontSize: 48, fontWeight: "bold", marginBottom: 10 }}>
              299,000đ
            </div>
            <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 30 }}>
              per year
            </div>

            <div style={{ marginBottom: 30 }}>
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 15,
                  }}
                >
                  <CheckCircleOutlined
                    style={{ fontSize: 20, marginRight: 10 }}
                  />
                  <span style={{ fontSize: 16 }}>{benefit}</span>
                </div>
              ))}
            </div>

            <Button
              size="large"
              block
              style={{
                height: 50,
                fontSize: 16,
                fontWeight: "bold",
                background: "white",
                color: "#f5576c",
              }}
            >
              Join Now
            </Button>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card style={{ height: "100%", background: "#f9fafb" }}>
            <h2 style={{ fontSize: 28, marginBottom: 20, color: "#111827" }}>
              Why Join Our Membership?
            </h2>

            <div style={{ marginBottom: 20 }}>
              <h3 style={{ color: "#111827", fontSize: 20 }}>Save More</h3>
              <p style={{ color: "#6b7280" }}>
                With 5% discount on every purchase, you'll save money on your favorite
                books. The membership pays for itself after spending just 5,980,000 VND!
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h3 style={{ color: "#111827", fontSize: 20 }}>Exclusive Perks</h3>
              <p style={{ color: "#6b7280" }}>
                Get access to member-only events, book signings, and author meet & greets.
                Be the first to know about new releases and special promotions.
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h3 style={{ color: "#111827", fontSize: 20 }}>Free Shipping</h3>
              <p style={{ color: "#6b7280" }}>
                Enjoy free shipping on orders over 300,000 VND. No minimum purchase
                required for in-store pickup.
              </p>
            </div>

            <div
              style={{
                marginTop: 30,
                padding: 20,
                background: "#fef3c7",
                borderRadius: 8,
              }}
            >
              <strong style={{ color: "#92400e" }}>Limited Time Offer:</strong>
              <p style={{ color: "#92400e", marginTop: 5, marginBottom: 0 }}>
                Sign up this month and get an additional 10% off your first purchase!
              </p>
            </div>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 30 }}>
        <h2 style={{ fontSize: 24, marginBottom: 20, color: "#111827" }}>
          Frequently Asked Questions
        </h2>

        <div style={{ marginBottom: 20 }}>
          <h4 style={{ color: "#111827" }}>How do I sign up?</h4>
          <p style={{ color: "#6b7280" }}>
            Click the "Join Now" button above and complete the registration form. Your
            membership will be activated immediately after payment.
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h4 style={{ color: "#111827" }}>Can I cancel my membership?</h4>
          <p style={{ color: "#6b7280" }}>
            Yes, you can cancel anytime. However, annual memberships are non-refundable.
          </p>
        </div>

        <div>
          <h4 style={{ color: "#111827" }}>Do I get a physical membership card?</h4>
          <p style={{ color: "#6b7280" }}>
            Yes! You'll receive a digital card immediately, and a physical card will be
            mailed to you within 7-10 business days.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Membership;
