import React from "react";
import { Card, Row, Col, Tag } from "antd";
import { ClockCircleOutlined, UserOutlined } from "@ant-design/icons";

const blogPosts = [
  {
    id: 1,
    title: "10 Must-Read Books This Winter",
    excerpt: "Cozy up with these captivating reads perfect for cold weather. From heartwarming stories to thrilling mysteries...",
    author: "Sarah Johnson",
    date: "November 10, 2025",
    category: "Book Recommendations",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
  },
  {
    id: 2,
    title: "Author Spotlight: Vietnamese Contemporary Writers",
    excerpt: "Discover the rising stars of Vietnamese literature and their groundbreaking works that are capturing global attention...",
    author: "Minh Nguyen",
    date: "November 5, 2025",
    category: "Author Spotlight",
    image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&q=80",
  },
  {
    id: 3,
    title: "How to Build Your Home Library on a Budget",
    excerpt: "Practical tips for book lovers who want to expand their collection without breaking the bank...",
    author: "David Chen",
    date: "October 28, 2025",
    category: "Tips & Guides",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
  },
  {
    id: 4,
    title: "Book Club Picks for December",
    excerpt: "Join our community discussion with these thought-provoking titles selected by our book club members...",
    author: "Emily Tran",
    date: "October 20, 2025",
    category: "Book Club",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
  },
  {
    id: 5,
    title: "The Rise of Audiobooks in Vietnam",
    excerpt: "Exploring how audiobooks are changing the way Vietnamese readers consume literature...",
    author: "Long Pham",
    date: "October 15, 2025",
    category: "Industry Trends",
    image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&q=80",
  },
  {
    id: 6,
    title: "Children's Literature: Fostering Early Reading Habits",
    excerpt: "Expert advice on choosing age-appropriate books and creating a reading-friendly environment at home...",
    author: "Linh Hoang",
    date: "October 8, 2025",
    category: "Children's Books",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
  },
];

const Blog = () => {
  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: 42, marginBottom: 15, color: "#111827" }}>
          Shradha Blog
        </h1>
        <p style={{ fontSize: 18, color: "#6b7280" }}>
          Book reviews, reading tips, and literary insights from our team
        </p>
      </div>

      <Row gutter={[30, 30]}>
        {blogPosts.map((post) => (
          <Col xs={24} md={12} lg={8} key={post.id}>
            <Card
              hoverable
              cover={
                <img
                  alt={post.title}
                  src={post.image}
                  style={{ height: 200, objectFit: "cover" }}
                />
              }
              style={{ height: "100%" }}
            >
              <Tag color="blue" style={{ marginBottom: 10 }}>
                {post.category}
              </Tag>
              <h3 style={{ fontSize: 20, marginBottom: 10, color: "#111827" }}>
                {post.title}
              </h3>
              <p style={{ color: "#6b7280", lineHeight: 1.6, marginBottom: 15 }}>
                {post.excerpt}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: "#9ca3af" }}>
                <span>
                  <UserOutlined /> {post.author}
                </span>
                <span>
                  <ClockCircleOutlined /> {post.date}
                </span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ textAlign: "center", marginTop: 50, padding: 40, background: "#f9fafb", borderRadius: 12 }}>
        <h2 style={{ fontSize: 28, marginBottom: 15, color: "#111827" }}>
          Stay Updated
        </h2>
        <p style={{ fontSize: 16, color: "#6b7280", marginBottom: 20 }}>
          Subscribe to our newsletter to receive the latest book recommendations and literary news
        </p>
        <div style={{ display: "flex", gap: 10, maxWidth: 500, margin: "0 auto" }}>
          <input
            type="email"
            placeholder="Enter your email"
            style={{
              flex: 1,
              padding: "12px 20px",
              border: "2px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 16,
            }}
          />
          <button
            style={{
              padding: "12px 30px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
};

export default Blog;
