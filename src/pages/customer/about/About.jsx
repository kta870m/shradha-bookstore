import React from "react";
import { Card, Row, Col, Timeline } from "antd";
import { BookOutlined, HeartOutlined, TeamOutlined, GlobalOutlined } from "@ant-design/icons";

const About = () => {
  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: 42, marginBottom: 15, color: "#111827" }}>
          About Shradha Bookstore
        </h1>
        <p style={{ fontSize: 18, color: "#6b7280", maxWidth: 700, margin: "0 auto" }}>
          Your trusted destination for books, knowledge, and community since 2010
        </p>
      </div>

      <Card style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 28, marginBottom: 20, color: "#111827" }}>Our Story</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: "#4b5563", marginBottom: 15 }}>
          Founded in 2010, Shradha Bookstore started as a small independent bookshop in the heart
          of Hanoi. What began as a passion project by a group of book lovers has grown into one
          of Vietnam's most beloved bookstores, serving thousands of readers every year.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: "#4b5563", marginBottom: 15 }}>
          We believe that books have the power to change lives, inspire minds, and build
          communities. Our mission is to make quality literature accessible to everyone while
          creating a welcoming space for readers to discover, explore, and connect.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: "#4b5563" }}>
          Today, we offer over 50,000 titles across all genres, host regular author events, book
          clubs, and reading programs for children. We're more than just a bookstore – we're a
          community hub for book lovers.
        </p>
      </Card>

      <Row gutter={[30, 30]} style={{ marginBottom: 40 }}>
        <Col xs={24} md={12} lg={6}>
          <Card style={{ textAlign: "center", height: "100%" }}>
            <BookOutlined style={{ fontSize: 48, color: "#667eea", marginBottom: 15 }} />
            <h3 style={{ fontSize: 20, marginBottom: 10 }}>50,000+ Books</h3>
            <p style={{ color: "#6b7280" }}>
              Extensive collection across all genres and languages
            </p>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card style={{ textAlign: "center", height: "100%" }}>
            <HeartOutlined style={{ fontSize: 48, color: "#f5576c", marginBottom: 15 }} />
            <h3 style={{ fontSize: 20, marginBottom: 10 }}>15+ Years</h3>
            <p style={{ color: "#6b7280" }}>
              Serving the community with passion and dedication
            </p>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card style={{ textAlign: "center", height: "100%" }}>
            <TeamOutlined style={{ fontSize: 48, color: "#10b981", marginBottom: 15 }} />
            <h3 style={{ fontSize: 20, marginBottom: 10 }}>100,000+ Customers</h3>
            <p style={{ color: "#6b7280" }}>
              Happy readers and growing community
            </p>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card style={{ textAlign: "center", height: "100%" }}>
            <GlobalOutlined style={{ fontSize: 48, color: "#4facfe", marginBottom: 15 }} />
            <h3 style={{ fontSize: 20, marginBottom: 10 }}>Nationwide Delivery</h3>
            <p style={{ color: "#6b7280" }}>
              Fast and reliable shipping across Vietnam
            </p>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 28, marginBottom: 20, color: "#111827" }}>Our Journey</h2>
        <Timeline
          mode="left"
          items={[
            {
              label: "2010",
              children: (
                <>
                  <strong>The Beginning</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Shradha Bookstore opened its doors with just 500 books and big dreams
                  </p>
                </>
              ),
            },
            {
              label: "2012",
              children: (
                <>
                  <strong>Community Growth</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Launched our first book club and children's reading program
                  </p>
                </>
              ),
            },
            {
              label: "2015",
              children: (
                <>
                  <strong>Expansion</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Moved to our current location and added café space
                  </p>
                </>
              ),
            },
            {
              label: "2018",
              children: (
                <>
                  <strong>Going Digital</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Launched our online store, reaching readers nationwide
                  </p>
                </>
              ),
            },
            {
              label: "2023",
              children: (
                <>
                  <strong>Award Recognition</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Named "Best Independent Bookstore in Hanoi" by Vietnam Book Awards
                  </p>
                </>
              ),
            },
            {
              label: "2025",
              color: "green",
              children: (
                <>
                  <strong>Present Day</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Continuing to serve our community with passion and innovation
                  </p>
                </>
              ),
            },
          ]}
        />
      </Card>

      <Card>
        <h2 style={{ fontSize: 28, marginBottom: 20, color: "#111827" }}>Our Values</h2>
        <Row gutter={[30, 30]}>
          <Col xs={24} md={12}>
            <h3 style={{ color: "#111827", fontSize: 20 }}>📚 Quality & Diversity</h3>
            <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
              We carefully curate our collection to offer diverse voices, perspectives, and
              genres that reflect the rich tapestry of literature from around the world.
            </p>
          </Col>
          <Col xs={24} md={12}>
            <h3 style={{ color: "#111827", fontSize: 20 }}>🤝 Community First</h3>
            <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
              We believe in building relationships, not just transactions. Our bookstore is a
              gathering place where readers connect, share ideas, and grow together.
            </p>
          </Col>
          <Col xs={24} md={12}>
            <h3 style={{ color: "#111827", fontSize: 20 }}>🌱 Sustainability</h3>
            <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
              We're committed to environmental responsibility through our book recycling
              program, eco-friendly packaging, and support for sustainable publishing.
            </p>
          </Col>
          <Col xs={24} md={12}>
            <h3 style={{ color: "#111827", fontSize: 20 }}>💡 Literacy & Education</h3>
            <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
              We support literacy programs, donate books to schools, and host educational
              events to promote reading culture in Vietnam.
            </p>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default About;
