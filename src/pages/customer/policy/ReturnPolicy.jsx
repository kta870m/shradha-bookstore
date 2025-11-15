import React from "react";
import "./Policy.css"; // dùng chung CSS

const ReturnPolicy = () => {
return (
    <div className="policy-container">
    <h1 className="policy-title">Return Policy</h1>

    <div className="policy-content">
        <p>
        We want you to be completely satisfied with your purchase. If you are not,
        we gladly accept returns under the following conditions:
        </p>

        <h2>📘 Eligibility for Returns</h2>
        <p>
        - Items must be returned within <strong>7 days</strong> of receiving your order.<br />
        - Books must be unused, in their original packaging, and in resaleable condition.<br />
        - Proof of purchase (receipt or order confirmation) is required.
        </p>

        <h2>💰 Refunds</h2>
        <p>
        - Refunds will be processed within <strong>3–5 business days</strong> after receiving your returned item.<br />
        - Refunds will be made via the same payment method used for the purchase.
        </p>

        <h2>🔄 Exchanges</h2>
        <p>
        - Exchanges are allowed for damaged or incorrect items.<br />
        - Please contact our support team before sending any returns to confirm eligibility.
        </p>

        <h2>📞 Contact Us</h2>
        <p>
        For any return or exchange inquiries, please email us at{" "}
        <a href="mailto:support@shradha.com">support@shradha.com</a>.
        </p>
    </div>
    </div>
);
};

export default ReturnPolicy;