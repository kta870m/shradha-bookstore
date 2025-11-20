import React from "react";
import "./Policy.css"; //  Import CSS dùng chung cho các trang Policy

//  Component hiển thị chính sách vận chuyển của cửa hàng
const ShippingPolicy = () => {
  return (
    <div className="policy-container"> {/*  Container tổng bao bọc nội dung */}
      <h1 className="policy-title">Shipping Policy</h1> {/*  Tiêu đề chính */}

      <div className="policy-content"> {/*  Nội dung chi tiết của chính sách */}
        <p>
          {/*  Đoạn mô tả mở đầu về cam kết giao hàng */}
          At Shradha Bookstore, we are committed to delivering your orders as
          quickly and safely as possible. Once your payment is confirmed, our
          team will prepare and ship your books within 1–2 business days.
        </p>

        <h2>📦 Domestic Shipping</h2> {/*  Mục vận chuyển trong nước */}
        <p>
          - Standard delivery time: <strong>2–5 business days</strong>.<br />
          - Free shipping for orders above <strong>$50</strong>.<br />
          - A flat rate of <strong>$3</strong> applies for smaller orders.
        </p>

        <h2>🌍 International Shipping</h2> {/*  Mục vận chuyển quốc tế */}
        <p>
          - Estimated delivery: <strong>7–14 business days</strong> depending on destination.<br />
          - Shipping costs vary based on weight and location.<br />
          - Customs duties or import taxes may apply and are the customer’s responsibility.
        </p>

        <h2>🚚 Tracking Orders</h2> {/*  Mục theo dõi đơn hàng */}
        <p>
          Once your order is shipped, you will receive an email with your tracking number.
          You can use it to check the status of your delivery at any time.
        </p>
      </div>
    </div>
  );
};

export default ShippingPolicy;