import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Column 1: Store Info */}
          <div className="footer-column">
            <h3 className="footer-logo">SHRADHA BOOKSTORE</h3>
            <div className="footer-info">
              <p>44 Phạm Hồng Thái, Ba Đình</p>
              <p>091 256 1800</p>
              <p>shradha@gmail.com</p>
              <p>Open: 9am - 7pm</p>
            </div>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <img src="/assets/footer/facebook.png" alt="Facebook" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <img src="/assets/footer/instagram.png" alt="Instagram" />
              </a>
            </div>
          </div>

          {/* Column 2: About & Services */}
          <div className="footer-column">
            <ul className="footer-links">
              <li><Link to="/about">About Shradha</Link></li>
              <li><Link to="/feedback">Feedback</Link></li>
              <li><Link to="/charity">Charity</Link></li>
              <li><Link to="/press">In the press</Link></li>
              <li><Link to="/ordering" className="ordering-link">Ordering books</Link></li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div className="footer-column">
            <ul className="footer-links">
              <li><Link to="/purchase-guideline">Purchase Guideline</Link></li>
              <li><Link to="/condition-guideline">Condition Guideline</Link></li>
              <li><Link to="/billing-payment">Billing & Payment</Link></li>
              <li><Link to="/shipping-policy">Shipping Policy</Link></li>
              <li><Link to="/return-policy">Return Policy</Link></li>
              <li><Link to="/faqs">FAQs</Link></li>
            </ul>
          </div>

          {/* Column 4: Map */}
          <div className="footer-column map-column">
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0965478859873!2d105.83421831533211!3d21.02881939313595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab86c134f54b%3A0x6a3b5f3c4e9e3f8a!2s44%20P.%20Ph%E1%BA%A1m%20H%E1%BB%93ng%20Th%C3%A1i%2C%20Ba%20%C4%90%C3%ACnh%2C%20H%C3%A0%20N%E1%BB%99i!5e0!3m2!1sen!2s!4v1234567890"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Store Location"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods">
          <img src="/assets/footer/visa.png" alt="Visa" />
          <img src="/assets/footer/american.png" alt="American Express" />
          <img src="/assets/footer/mastercard.png" alt="Mastercard" />
          <img src="/assets/footer/jcb.png" alt="JCB" />
          <img src="/assets/footer/vnpay.png" alt="VNPay" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
