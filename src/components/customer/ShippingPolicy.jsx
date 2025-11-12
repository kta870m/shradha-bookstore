import React from "react";
import "./Policy.css"; // dùng chung CSS

const ShippingPolicy = () => {
  return (
    <div className="policy-container">
      <h1 className="policy-title">Shipping Policy</h1>

      <div className="policy-content">
        <p>
          At Shradha Bookstore, we are committed to delivering your orders as
          quickly and safely as possible. Once your payment is confirmed, our
          team will prepare and ship your books within 1–2 business days.
        </p>

        <h2>📦 Domestic Shipping</h2>
        <p>
          - Standard delivery time: <strong>2–5 business days</strong>.<br />
          - Free shipping for orders above <strong>$50</strong>.<br />
          - A flat rate of <strong>$3</strong> applies for smaller orders.
        </p>

        <h2>🌍 International Shipping</h2>
        <p>
          - Estimated delivery: <strong>7–14 business days</strong> depending on destination.<br />
          - Shipping costs vary based on weight and location.<br />
          - Customs duties or import taxes may apply and are the customer’s responsibility.
        </p>

        <h2>🚚 Tracking Orders</h2>
        <p>
          Once your order is shipped, you will receive an email with your tracking number.
          You can use it to check the status of your delivery at any time.
        </p>
      </div>
    </div>
  );
};

export default ShippingPolicy;
