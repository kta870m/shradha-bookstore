import React, { useState, useEffect } from "react";

const Banner = () => {
  const images = [
    "/assets/homepage/banner1.webp",
    "/assets/homepage/banner2.avif",
    "/assets/homepage/banner3.webp",
    "/assets/homepage/sale1.webp",
    "/assets/homepage/sale2.webp",
    "/assets/homepage/sale3.webp",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="banner">
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Banner ${i + 1}`}
          className={`banner-image ${i === index ? "active" : ""}`}
        />
      ))}
    </div>
  );
};

export default Banner;
