import React, { useState, useEffect } from "react";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ReviewCarousel = () => {
  const reviews = [
    {
      title: "Made a good afternoon great",
      text: "Wonderful shop. We bought several books. We also had lunch at the cafe and it was good. The staff was friendly and helpful. We will be moving to Hanoi and plan on frequenting The Bookworm regularly.",
    },
    {
      title: "Lovely corner for book lovers",
      text: "A cozy shop with many interesting books. You can find both new and second-hand titles, plus a café area. Definitely a hidden gem in Hanoi!",
    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="review-carousel">
      <button
        className="arrow left"
        onClick={() =>
          setCurrent((current - 1 + reviews.length) % reviews.length)
        }
      >
        <FaChevronLeft />
      </button>
      <div className="review-content">
        <h3>"{reviews[current].title}"</h3>
        <div className="stars">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} />
          ))}
        </div>
        <p>{reviews[current].text}</p>
        <small>
          Review us on <strong>TripAdvisor</strong> | The Bookworm Hanoi
        </small>
      </div>
      <button
        className="arrow right"
        onClick={() => setCurrent((current + 1) % reviews.length)}
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default ReviewCarousel;
