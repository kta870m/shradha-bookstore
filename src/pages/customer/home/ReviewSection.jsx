import React from "react";

const ReviewSection = () => {
  return (
    <section className="review-section">
      <div className="review-container">
        <div className="review-text">
          <h2>SHRADHA - A treasure chest of great reading</h2>
          <p>
            SHRADHA is a treasure chest of great reading for both online
            and actual book lovers. For the latter it is down a pleasant
            little lane at 44 Chau Long Street that leads into a shady
            courtyard where you can enjoy drinks, snacks and lunchtime
            meals.
          </p>
          <p>
            SHRADHA was established in 2001 as Hanoi's exclusively English
            language bookshop and remains so today. We have more than 20,000
            English books representing almost all genres in both new and
            second-hand editions.
          </p>
          <button className="btn-more">More About Us</button>
        </div>

        <div className="review-image">
          <img src="/assets/homepage/home1.webp" alt="SHRADHA HANOI" />
        </div>
      </div>

      <div className="review-icons">
        <div className="icon-item">
          <img src="/assets/homepage/book.jpg" alt="books" />
          <p className="icon-title">15.000 BOOKS</p>
          <p className="icon-sub">fiction & non fiction</p>
        </div>
        <div className="icon-item">
          <img src="/assets/homepage/saveMoney.png" alt="save" />
          <p className="icon-title">SAVE MONEY</p>
          <p className="icon-sub">by selling back to Bookworm</p>
        </div>
        <div className="icon-item">
          <img src="/assets/homepage/booklvoer.avif" alt="bookshop" />
          <p className="icon-title">UNIQUE BOOKSHOP</p>
          <p className="icon-sub">for all book lovers</p>
        </div>
        <div className="icon-item">
          <img src="/assets/homepage/book.jpgpublic\assets\homepage\stock-vector-five-stars-rating-icon-silhouette-style-vector-icon-2418749081.jpg" alt="star" />
          <p className="icon-title">5 STAR RATING</p>
          <p className="icon-sub">service</p>
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
