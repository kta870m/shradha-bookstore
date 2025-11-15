import React from "react";
import { Card, Row, Col, Tag } from "antd";

const pressPosts = [
  {
    id: 1,
    title: "Shradha Bookstore Named 'Best Independent Bookstore in Hanoi'",
    date: "December 1, 2023",
    publication: "Vietnam Book Awards",
    excerpt: "The prestigious Vietnam Book Awards has recognized Shradha Bookstore as the Best Independent Bookstore in Hanoi for its exceptional service, curated collection, and community engagement...",
    category: "Award",
  },
  {
    id: 2,
    title: "50,000 Books Donated: Shradha's Charity Program Reaches Milestone",
    date: "October 15, 2023",
    publication: "VnExpress",
    excerpt: "Shradha Bookstore's 'Books for Change' program has successfully donated its 50,000th book to rural schools across Vietnam, impacting over 30,000 children in 125 schools...",
    category: "Community",
  },
  {
    id: 3,
    title: "How One Bookstore is Keeping Reading Culture Alive in the Digital Age",
    date: "September 5, 2023",
    publication: "Thanh Nien News",
    excerpt: "Feature interview with Shradha's founder discussing strategies for thriving as an independent bookstore while embracing digital transformation and maintaining strong community ties...",
    category: "Interview",
  },
  {
    id: 4,
    title: "Shradha Bookstore Launches New Online Platform with 50,000+ Titles",
    date: "July 20, 2023",
    publication: "Tech in Asia",
    excerpt: "The beloved Hanoi bookstore expands its digital presence with a new e-commerce platform featuring advanced search, personalized recommendations, and nationwide delivery...",
    category: "Launch",
  },
  {
    id: 5,
    title: "Local Bookstore Partners with International Publishers for Exclusive Releases",
    date: "May 10, 2023",
    publication: "Publishers Weekly",
    excerpt: "Shradha Bookstore announces partnerships with major international publishers, bringing exclusive Vietnamese editions and author events to Hanoi readers...",
    category: "Partnership",
  },
  {
    id: 6,
    title: "Children's Literacy Program Receives Government Recognition",
    date: "March 15, 2023",
    publication: "Vietnam News",
    excerpt: "Shradha's Early Literacy Program has been recognized by the Ministry of Education for its significant contribution to improving reading skills among preschool children in underserved areas...",
    category: "Award",
  },
];

const Press = () => {
  const getCategoryColor = (category) => {
    const colors = {
      Award: "gold",
      Community: "green",
      Interview: "blue",
      Launch: "purple",
      Partnership: "orange",
    };
    return colors[category] || "default";
  };

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: 42, marginBottom: 15, color: "#111827" }}>
          Press & Media
        </h1>
        <p style={{ fontSize: 18, color: "#6b7280" }}>
          News, announcements, and media coverage about Shradha Bookstore
        </p>
      </div>

      <Card style={{ marginBottom: 40, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <h2 style={{ fontSize: 28, marginBottom: 15, color: "white" }}>
            Media Inquiries
          </h2>
          <p style={{ fontSize: 16, marginBottom: 20, opacity: 0.9 }}>
            For press releases, interview requests, or media partnerships
          </p>
          <div style={{ fontSize: 15 }}>
            <p style={{ marginBottom: 5 }}>
              <strong>Email:</strong> press@shradha.com
            </p>
            <p style={{ marginBottom: 5 }}>
              <strong>Phone:</strong> 091 256 1800
            </p>
            <p style={{ margin: 0 }}>
              <strong>Response Time:</strong> Within 24 hours
            </p>
          </div>
        </div>
      </Card>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 28, marginBottom: 25, color: "#111827", textAlign: "center" }}>
          Recent Press Coverage
        </h2>
        {pressPosts.map((post) => (
          <Card key={post.id} style={{ marginBottom: 20 }} hoverable>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <Tag color={getCategoryColor(post.category)}>{post.category}</Tag>
              <span style={{ color: "#9ca3af", fontSize: 14 }}>{post.date}</span>
            </div>
            <h3 style={{ fontSize: 22, marginBottom: 10, color: "#111827" }}>
              {post.title}
            </h3>
            <p style={{ fontSize: 14, color: "#7c3aed", fontWeight: "500", marginBottom: 10 }}>
              {post.publication}
            </p>
            <p style={{ color: "#6b7280", lineHeight: 1.7, margin: 0 }}>
              {post.excerpt}
            </p>
          </Card>
        ))}
      </div>

      <Card title="Press Kit" style={{ marginBottom: 30 }}>
        <p style={{ fontSize: 16, color: "#4b5563", marginBottom: 20 }}>
          Download our official press kit containing logos, brand guidelines, and high-resolution images:
        </p>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <div style={{ padding: 20, border: "2px solid #e5e7eb", borderRadius: 8, textAlign: "center" }}>
              <h4 style={{ marginBottom: 10, color: "#111827" }}>📄 Company Profile</h4>
              <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 15 }}>
                History, mission, and key facts about Shradha Bookstore
              </p>
              <button style={{
                padding: "10px 25px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "500"
              }}>
                Download PDF
              </button>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ padding: 20, border: "2px solid #e5e7eb", borderRadius: 8, textAlign: "center" }}>
              <h4 style={{ marginBottom: 10, color: "#111827" }}>🎨 Brand Assets</h4>
              <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 15 }}>
                Logos, color palette, typography, and usage guidelines
              </p>
              <button style={{
                padding: "10px 25px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "500"
              }}>
                Download ZIP
              </button>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ padding: 20, border: "2px solid #e5e7eb", borderRadius: 8, textAlign: "center" }}>
              <h4 style={{ marginBottom: 10, color: "#111827" }}>📸 Photo Library</h4>
              <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 15 }}>
                High-resolution images of our store, events, and products
              </p>
              <button style={{
                padding: "10px 25px",
                background: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "500"
              }}>
                View Gallery
              </button>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ padding: 20, border: "2px solid #e5e7eb", borderRadius: 8, textAlign: "center" }}>
              <h4 style={{ marginBottom: 10, color: "#111827" }}>📊 Impact Report 2023</h4>
              <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 15 }}>
                Annual report on our charity programs and community impact
              </p>
              <button style={{
                padding: "10px 25px",
                background: "#ec4899",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "500"
              }}>
                Download PDF
              </button>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="Key Facts & Figures" style={{ marginBottom: 30 }}>
        <Row gutter={[30, 20]}>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827" }}>📚 Inventory</h4>
            <ul style={{ color: "#6b7280", lineHeight: 2 }}>
              <li>Over 50,000 titles in stock</li>
              <li>35+ genres and categories</li>
              <li>Vietnamese, English, and bilingual books</li>
              <li>New releases added weekly</li>
            </ul>
          </Col>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827" }}>🏪 Store Information</h4>
            <ul style={{ color: "#6b7280", lineHeight: 2 }}>
              <li>Founded: 2010</li>
              <li>Location: 44 Phạm Hồng Thái, Ba Đình, Hanoi</li>
              <li>Store size: 500 square meters</li>
              <li>Employees: 25+ team members</li>
            </ul>
          </Col>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827" }}>👥 Community Impact</h4>
            <ul style={{ color: "#6b7280", lineHeight: 2 }}>
              <li>100,000+ registered customers</li>
              <li>50,000+ books donated since 2010</li>
              <li>125 schools supported nationwide</li>
              <li>25 community reading corners established</li>
            </ul>
          </Col>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827" }}>🏆 Recognition</h4>
            <ul style={{ color: "#6b7280", lineHeight: 2 }}>
              <li>Best Independent Bookstore (2023)</li>
              <li>Community Service Award (2021)</li>
              <li>Green Business Certificate (2020)</li>
              <li>TripAdvisor Certificate of Excellence</li>
            </ul>
          </Col>
        </Row>
      </Card>

      <Card style={{ background: "#f9fafb" }}>
        <h3 style={{ fontSize: 20, marginBottom: 15, color: "#111827" }}>
          Spokesperson & Interview Requests
        </h3>
        <p style={{ color: "#6b7280", lineHeight: 1.8, marginBottom: 15 }}>
          Our founder and CEO is available for interviews, podcasts, panel discussions, and speaking engagements
          related to:
        </p>
        <ul style={{ color: "#6b7280", lineHeight: 2, marginBottom: 20 }}>
          <li>Independent bookstore industry trends</li>
          <li>Literary culture and reading habits in Vietnam</li>
          <li>Community building through books</li>
          <li>Digital transformation in retail</li>
          <li>Social impact and charity programs</li>
        </ul>
        <p style={{ color: "#4b5563", fontWeight: "500" }}>
          Please email press@shradha.com with your request at least 5 business days in advance.
        </p>
      </Card>
    </div>
  );
};

export default Press;
