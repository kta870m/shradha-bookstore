import React from "react";
import { useNavigate } from "react-router-dom";

const PromoBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="promo-banner">
      <div className="promo-item promo-sell" onClick={() => navigate('/sell-books')}>
        <div className="promo-title">SELL YOUR BOOKS</div>
        <div className="promo-sub">for the best price in town</div>
      </div>
      <div className="promo-item promo-discount" onClick={() => navigate('/membership')}>
        <div className="promo-title">5% DISCOUNT</div>
        <div className="promo-sub">for Bookworm Online Membership</div>
      </div>
      <div className="promo-item promo-delivery" onClick={() => navigate('/shipping-info')}>
        <div className="promo-title">SAME-DAY DELIVERY</div>
        <div className="promo-sub">Free shipping ≥ 500,000 VND</div>
      </div>
    </div>
  );
};

export default PromoBanner;
