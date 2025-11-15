import React from "react";
import { Card, Steps, Alert } from "antd";
import { ShoppingCartOutlined, CreditCardOutlined, TruckOutlined, CheckCircleOutlined } from "@ant-design/icons";

const PurchaseGuideline = () => {
  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: 42, marginBottom: 15, color: "#111827" }}>
          Purchase Guidelines
        </h1>
        <p style={{ fontSize: 18, color: "#6b7280" }}>
          Step-by-step guide to ordering books from Shradha Bookstore
        </p>
      </div>

      <Alert
        message="Easy & Secure Shopping"
        description="We've made the purchasing process simple and secure. Follow these steps to complete your order."
        type="info"
        showIcon
        style={{ marginBottom: 30 }}
      />

      <Card style={{ marginBottom: 30 }}>
        <Steps
          direction="vertical"
          current={-1}
          items={[
            {
              title: "Browse & Select Books",
              description: (
                <div style={{ marginTop: 10 }}>
                  <p style={{ color: "#6b7280", marginBottom: 10 }}>
                    • Browse our extensive collection by category, author, or genre
                  </p>
                  <p style={{ color: "#6b7280", marginBottom: 10 }}>
                    • Use the search function to find specific titles
                  </p>
                  <p style={{ color: "#6b7280", marginBottom: 10 }}>
                    • Read book descriptions, reviews, and ratings
                  </p>
                  <p style={{ color: "#6b7280" }}>
                    • Click "Add to Cart" on books you want to purchase
                  </p>
                </div>
              ),
              icon: <ShoppingCartOutlined />,
            },
            {
              title: "Review Your Cart",
              description: (
                <div style={{ marginTop: 10 }}>
                  <p style={{ color: "#6b7280", marginBottom: 10 }}>
                    • Click the cart icon to view selected items
                  </p>
                  <p style={{ color: "#6b7280", marginBottom: 10 }}>
                    • Adjust quantities or remove items as needed
                  </p>
                  <p style={{ color: "#6b7280", marginBottom: 10 }}>
                    • Apply discount codes if available
                  </p>
                  <p style={{ color: "#6b7280" }}>
                    • Review the total amount including shipping
                  </p>
                </div>
              ),
              icon: <CheckCircleOutlined />,
            },
            {
              title: "Checkout & Payment",
              description: (
                <div style={{ marginTop: 10 }}>
                  <p style={{ color: "#6b7280", marginBottom: 10 }}>
                    • Click "Proceed to Checkout"
                  </p>
                  <p style={{ color: "#6b7280", marginBottom: 10 }}>
                    • Enter or confirm your shipping address
                  </p>
                  <p style={{ color: "#6b7280", marginBottom: 10 }}>
                    • Select your preferred payment method
                  </p>
                  <p style={{ color: "#6b7280" }}>
                    • Review order details and confirm purchase
                  </p>
                </div>
              ),
              icon: <CreditCardOutlined />,
            },
            {
              title: "Delivery & Tracking",
              description: (
                <div style={{ marginTop: 10 }}>
                  <p style={{ color: "#6b7280", marginBottom: 10 }}>
                    • Receive order confirmation via email/SMS
                  </p>
                  <p style={{ color: "#6b7280", marginBottom: 10 }}>
                    • Track your order status in your account
                  </p>
                  <p style={{ color: "#6b7280", marginBottom: 10 }}>
                    • Receive shipping notification with tracking number
                  </p>
                  <p style={{ color: "#6b7280" }}>
                    • Sign upon delivery and enjoy your books!
                  </p>
                </div>
              ),
              icon: <TruckOutlined />,
            },
          ]}
        />
      </Card>

      <Card title="Payment Methods" style={{ marginBottom: 30 }}>
        <p style={{ fontSize: 16, color: "#4b5563", marginBottom: 15 }}>
          We accept the following payment methods:
        </p>
        <ul style={{ fontSize: 15, color: "#6b7280", lineHeight: 2 }}>
          <li><strong>Credit/Debit Cards:</strong> Visa, Mastercard, JCB, American Express</li>
          <li><strong>E-Wallets:</strong> VNPay, Momo, ZaloPay</li>
          <li><strong>Bank Transfer:</strong> Direct transfer to our business account</li>
          <li><strong>Cash on Delivery:</strong> Available for local orders only</li>
        </ul>
        <Alert
          message="Secure Payments"
          description="All transactions are encrypted and processed through secure payment gateways. We never store your card information."
          type="success"
          showIcon
          style={{ marginTop: 20 }}
        />
      </Card>

      <Card title="Order Confirmation" style={{ marginBottom: 30 }}>
        <p style={{ fontSize: 16, color: "#4b5563", marginBottom: 15 }}>
          After placing your order, you will receive:
        </p>
        <ul style={{ fontSize: 15, color: "#6b7280", lineHeight: 2 }}>
          <li>Instant order confirmation on screen</li>
          <li>Email confirmation with order details and invoice</li>
          <li>SMS notification with order number</li>
          <li>Shipping updates as your order progresses</li>
        </ul>
      </Card>

      <Card title="Need Help?" style={{ background: "#f9fafb" }}>
        <p style={{ fontSize: 16, color: "#4b5563", marginBottom: 10 }}>
          If you encounter any issues during the purchase process:
        </p>
        <ul style={{ fontSize: 15, color: "#6b7280", lineHeight: 2, marginBottom: 15 }}>
          <li>Call our hotline: 091 256 1800 (9am - 7pm daily)</li>
          <li>Email: support@shradha.com</li>
          <li>Live chat on our website</li>
          <li>Visit our store at 44 Phạm Hồng Thái, Ba Đình, Hanoi</li>
        </ul>
        <p style={{ fontSize: 14, color: "#9ca3af", fontStyle: "italic" }}>
          Our customer service team is always ready to assist you!
        </p>
      </Card>
    </div>
  );
};

export default PurchaseGuideline;
