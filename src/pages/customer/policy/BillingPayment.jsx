import React from "react";
import { Card, Row, Col, Alert, Divider } from "antd";
import { CreditCardOutlined, BankOutlined, WalletOutlined, DollarOutlined } from "@ant-design/icons";

const BillingPayment = () => {
  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: 42, marginBottom: 15, color: "#111827" }}>
          Billing & Payment
        </h1>
        <p style={{ fontSize: 18, color: "#6b7280" }}>
          Secure payment options and billing information
        </p>
      </div>

      <Alert
        message="100% Secure Payments"
        description="All transactions are encrypted and processed through certified payment gateways. Your financial information is never stored on our servers."
        type="success"
        showIcon
        style={{ marginBottom: 30 }}
      />

      <Card style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 28, marginBottom: 25, color: "#111827" }}>
          Accepted Payment Methods
        </h2>

        <Row gutter={[30, 30]}>
          <Col xs={24} md={12}>
            <div style={{ padding: 25, border: "2px solid #e5e7eb", borderRadius: 12, height: "100%" }}>
              <CreditCardOutlined style={{ fontSize: 42, color: "#667eea", marginBottom: 15 }} />
              <h3 style={{ fontSize: 20, marginBottom: 15, color: "#111827" }}>
                Credit & Debit Cards
              </h3>
              <p style={{ color: "#6b7280", lineHeight: 1.8, marginBottom: 10 }}>
                We accept all major credit and debit cards:
              </p>
              <ul style={{ color: "#6b7280", lineHeight: 2 }}>
                <li>Visa</li>
                <li>Mastercard</li>
                <li>JCB</li>
                <li>American Express</li>
              </ul>
              <Alert
                message="Instant Processing"
                description="Card payments are processed immediately upon order confirmation."
                type="info"
                showIcon
                style={{ marginTop: 15, fontSize: 13 }}
              />
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ padding: 25, border: "2px solid #e5e7eb", borderRadius: 12, height: "100%" }}>
              <WalletOutlined style={{ fontSize: 42, color: "#10b981", marginBottom: 15 }} />
              <h3 style={{ fontSize: 20, marginBottom: 15, color: "#111827" }}>
                E-Wallets
              </h3>
              <p style={{ color: "#6b7280", lineHeight: 1.8, marginBottom: 10 }}>
                Pay conveniently with your mobile wallet:
              </p>
              <ul style={{ color: "#6b7280", lineHeight: 2 }}>
                <li>VNPay</li>
                <li>Momo</li>
                <li>ZaloPay</li>
                <li>ShopeePay</li>
              </ul>
              <Alert
                message="Quick & Easy"
                description="Scan QR code or link your wallet for seamless checkout."
                type="info"
                showIcon
                style={{ marginTop: 15, fontSize: 13 }}
              />
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ padding: 25, border: "2px solid #e5e7eb", borderRadius: 12, height: "100%" }}>
              <BankOutlined style={{ fontSize: 42, color: "#f59e0b", marginBottom: 15 }} />
              <h3 style={{ fontSize: 20, marginBottom: 15, color: "#111827" }}>
                Bank Transfer
              </h3>
              <p style={{ color: "#6b7280", lineHeight: 1.8, marginBottom: 10 }}>
                Direct bank transfer to our account:
              </p>
              <div style={{ background: "#f9fafb", padding: 15, borderRadius: 8, marginBottom: 10 }}>
                <p style={{ margin: 0, fontSize: 14, color: "#4b5563" }}>
                  <strong>Bank:</strong> Vietcombank<br />
                  <strong>Account Name:</strong> Shradha Bookstore<br />
                  <strong>Account Number:</strong> 0123456789<br />
                  <strong>Branch:</strong> Ba Dinh, Hanoi
                </p>
              </div>
              <Alert
                message="Include Order Number"
                description="Please include your order number in the transfer note for faster processing."
                type="warning"
                showIcon
                style={{ fontSize: 13 }}
              />
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ padding: 25, border: "2px solid #e5e7eb", borderRadius: 12, height: "100%" }}>
              <DollarOutlined style={{ fontSize: 42, color: "#ef4444", marginBottom: 15 }} />
              <h3 style={{ fontSize: 20, marginBottom: 15, color: "#111827" }}>
                Cash on Delivery
              </h3>
              <p style={{ color: "#6b7280", lineHeight: 1.8, marginBottom: 10 }}>
                Pay with cash when you receive your order:
              </p>
              <ul style={{ color: "#6b7280", lineHeight: 2, marginBottom: 10 }}>
                <li>Available in Hanoi only</li>
                <li>₫20,000 COD fee applies</li>
                <li>Orders above ₫500,000 only</li>
                <li>Exact amount appreciated</li>
              </ul>
              <Alert
                message="Hanoi Area Only"
                description="COD is limited to Hanoi city and surrounding districts."
                type="info"
                showIcon
                style={{ fontSize: 13 }}
              />
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="Billing Information" style={{ marginBottom: 30 }}>
        <h3 style={{ fontSize: 18, marginBottom: 15, color: "#111827" }}>
          What You'll Need
        </h3>
        <p style={{ color: "#6b7280", lineHeight: 1.8, marginBottom: 15 }}>
          To complete your purchase, please have the following information ready:
        </p>
        <ul style={{ fontSize: 15, color: "#6b7280", lineHeight: 2 }}>
          <li><strong>Full Name:</strong> As it appears on your payment method</li>
          <li><strong>Billing Address:</strong> Where your payment card is registered</li>
          <li><strong>Shipping Address:</strong> Where you want your books delivered</li>
          <li><strong>Phone Number:</strong> For delivery coordination</li>
          <li><strong>Email Address:</strong> For order confirmations and updates</li>
        </ul>

        <Divider />

        <h3 style={{ fontSize: 18, marginBottom: 15, color: "#111827" }}>
          VAT Invoice
        </h3>
        <p style={{ color: "#6b7280", lineHeight: 1.8, marginBottom: 10 }}>
          If you need a VAT invoice (Hóa đơn GTGT), please provide:
        </p>
        <ul style={{ fontSize: 15, color: "#6b7280", lineHeight: 2 }}>
          <li>Company name</li>
          <li>Tax code (Mã số thuế)</li>
          <li>Company address</li>
          <li>Email for invoice delivery</li>
        </ul>
        <Alert
          message="VAT Invoice Request"
          description="Please specify your need for a VAT invoice in the order notes or contact us within 24 hours of purchase."
          type="info"
          showIcon
          style={{ marginTop: 15 }}
        />
      </Card>

      <Card title="Payment Security" style={{ marginBottom: 30 }}>
        <Row gutter={[30, 20]}>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827", marginBottom: 10 }}>🔒 SSL Encryption</h4>
            <p style={{ color: "#6b7280", fontSize: 15 }}>
              All payment data is encrypted using 256-bit SSL technology, the same standard used by banks.
            </p>
          </Col>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827", marginBottom: 10 }}>🛡️ PCI Compliance</h4>
            <p style={{ color: "#6b7280", fontSize: 15 }}>
              Our payment processors are PCI DSS Level 1 certified, meeting the highest security standards.
            </p>
          </Col>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827", marginBottom: 10 }}>🔐 No Card Storage</h4>
            <p style={{ color: "#6b7280", fontSize: 15 }}>
              We never store your credit card information on our servers. All transactions are tokenized.
            </p>
          </Col>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827", marginBottom: 10 }}>✅ Fraud Protection</h4>
            <p style={{ color: "#6b7280", fontSize: 15 }}>
              Advanced fraud detection systems monitor all transactions for suspicious activity.
            </p>
          </Col>
        </Row>
      </Card>

      <Card title="Payment Issues & Support" style={{ background: "#f9fafb" }}>
        <h3 style={{ fontSize: 18, marginBottom: 15, color: "#111827" }}>
          Payment Declined?
        </h3>
        <p style={{ color: "#6b7280", marginBottom: 10 }}>
          If your payment is declined, please check:
        </p>
        <ul style={{ fontSize: 15, color: "#6b7280", lineHeight: 2, marginBottom: 20 }}>
          <li>Card details are entered correctly</li>
          <li>Sufficient funds are available</li>
          <li>Card hasn't expired</li>
          <li>International transactions are enabled (if applicable)</li>
          <li>3D Secure / OTP verification was completed</li>
        </ul>

        <h3 style={{ fontSize: 18, marginBottom: 15, color: "#111827" }}>
          Need Help?
        </h3>
        <p style={{ color: "#6b7280", marginBottom: 10 }}>
          Contact our payment support team:
        </p>
        <ul style={{ fontSize: 15, color: "#6b7280", lineHeight: 2 }}>
          <li><strong>Phone:</strong> 091 256 1800 (9am - 7pm daily)</li>
          <li><strong>Email:</strong> billing@shradha.com</li>
          <li><strong>Live Chat:</strong> Available on our website</li>
        </ul>
      </Card>
    </div>
  );
};

export default BillingPayment;
