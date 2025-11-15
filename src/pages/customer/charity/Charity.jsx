import React from "react";
import { Card, Row, Col, Timeline } from "antd";
import { HeartOutlined, BookOutlined, TeamOutlined, GlobalOutlined } from "@ant-design/icons";

const Charity = () => {
  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: 42, marginBottom: 15, color: "#111827" }}>
          Books for Change
        </h1>
        <p style={{ fontSize: 18, color: "#6b7280", maxWidth: 700, margin: "0 auto" }}>
          Our commitment to spreading literacy and knowledge to underserved communities
        </p>
      </div>

      <Card style={{ marginBottom: 30, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <HeartOutlined style={{ fontSize: 64, marginBottom: 20 }} />
          <h2 style={{ fontSize: 32, marginBottom: 15, color: "white" }}>
            50,000+ Books Donated
          </h2>
          <p style={{ fontSize: 18, margin: 0, opacity: 0.9 }}>
            Since 2010, we've donated over 50,000 books to schools, libraries, and community centers across Vietnam
          </p>
        </div>
      </Card>

      <Card style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 28, marginBottom: 20, color: "#111827" }}>Our Mission</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: "#4b5563", marginBottom: 15 }}>
          At Shradha Bookstore, we believe that access to books and education is a fundamental right, not a privilege.
          Our charity program, <strong>"Books for Change"</strong>, is dedicated to bringing quality literature to
          children and adults in underserved communities throughout Vietnam.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: "#4b5563" }}>
          Every month, we donate books to schools in rural areas, support community libraries, and partner with
          non-profit organizations working to promote literacy and education. Together with our customers and partners,
          we're making a real difference in people's lives through the power of reading.
        </p>
      </Card>

      <Row gutter={[30, 30]} style={{ marginBottom: 40 }}>
        <Col xs={24} md={12} lg={6}>
          <Card style={{ textAlign: "center", height: "100%", background: "#fef3c7" }}>
            <BookOutlined style={{ fontSize: 48, color: "#f59e0b", marginBottom: 15 }} />
            <h3 style={{ fontSize: 28, marginBottom: 5, color: "#111827" }}>125</h3>
            <p style={{ color: "#6b7280", margin: 0 }}>Schools Supported</p>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card style={{ textAlign: "center", height: "100%", background: "#dbeafe" }}>
            <TeamOutlined style={{ fontSize: 48, color: "#3b82f6", marginBottom: 15 }} />
            <h3 style={{ fontSize: 28, marginBottom: 5, color: "#111827" }}>30,000+</h3>
            <p style={{ color: "#6b7280", margin: 0 }}>Children Reached</p>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card style={{ textAlign: "center", height: "100%", background: "#dcfce7" }}>
            <GlobalOutlined style={{ fontSize: 48, color: "#10b981", marginBottom: 15 }} />
            <h3 style={{ fontSize: 28, marginBottom: 5, color: "#111827" }}>35</h3>
            <p style={{ color: "#6b7280", margin: 0 }}>Provinces</p>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card style={{ textAlign: "center", height: "100%", background: "#fce7f3" }}>
            <HeartOutlined style={{ fontSize: 48, color: "#ec4899", marginBottom: 15 }} />
            <h3 style={{ fontSize: 28, marginBottom: 5, color: "#111827" }}>15</h3>
            <p style={{ color: "#6b7280", margin: 0 }}>Years of Impact</p>
          </Card>
        </Col>
      </Row>

      <Card title="Our Programs" style={{ marginBottom: 30 }}>
        <Row gutter={[30, 30]}>
          <Col xs={24} md={12}>
            <div style={{ padding: 20, border: "2px solid #e5e7eb", borderRadius: 12 }}>
              <h3 style={{ color: "#111827", fontSize: 20, marginBottom: 15 }}>
                📚 Rural School Libraries
              </h3>
              <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
                We establish and stock libraries in rural schools that lack access to books. Each library receives
                500-1,000 age-appropriate books in Vietnamese and English, creating reading opportunities for
                hundreds of students.
              </p>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ padding: 20, border: "2px solid #e5e7eb", borderRadius: 12 }}>
              <h3 style={{ color: "#111827", fontSize: 20, marginBottom: 15 }}>
                👶 Early Literacy Program
              </h3>
              <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
                Working with kindergartens and preschools in disadvantaged communities, we provide picture books
                and reading materials to help children develop early literacy skills and a love for reading from
                an early age.
              </p>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ padding: 20, border: "2px solid #e5e7eb", borderRadius: 12 }}>
              <h3 style={{ color: "#111827", fontSize: 20, marginBottom: 15 }}>
                🎓 Scholarship Books
              </h3>
              <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
                We provide free textbooks and educational materials to students from low-income families,
                ensuring that financial constraints don't prevent them from accessing quality education and
                succeeding in school.
              </p>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ padding: 20, border: "2px solid #e5e7eb", borderRadius: 12 }}>
              <h3 style={{ color: "#111827", fontSize: 20, marginBottom: 15 }}>
                🏘️ Community Reading Corners
              </h3>
              <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
                We create free reading spaces in community centers, markets, and public areas where people of
                all ages can borrow books, read newspapers, and participate in literacy activities at no cost.
              </p>
            </div>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 28, marginBottom: 20, color: "#111827" }}>Our Journey</h2>
        <Timeline
          items={[
            {
              label: "2010",
              children: (
                <>
                  <strong>The First Donation</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Donated 500 books to a rural school in Ha Giang province
                  </p>
                </>
              ),
            },
            {
              label: "2013",
              children: (
                <>
                  <strong>Books for Change Program Launch</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Established our formal charity program with monthly donations
                  </p>
                </>
              ),
            },
            {
              label: "2016",
              children: (
                <>
                  <strong>10,000 Books Milestone</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Reached our first major milestone, supporting 50 schools
                  </p>
                </>
              ),
            },
            {
              label: "2019",
              children: (
                <>
                  <strong>Partnership Expansion</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Partnered with UNICEF Vietnam and Room to Read
                  </p>
                </>
              ),
            },
            {
              label: "2022",
              children: (
                <>
                  <strong>Community Reading Corners</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Launched 25 free reading corners in underserved communities
                  </p>
                </>
              ),
            },
            {
              label: "2025",
              color: "green",
              children: (
                <>
                  <strong>50,000 Books Donated</strong>
                  <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>
                    Celebrated reaching 50,000 books donated to 125 schools
                  </p>
                </>
              ),
            },
          ]}
        />
      </Card>

      <Card title="How You Can Help" style={{ marginBottom: 30 }}>
        <Row gutter={[30, 20]}>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827", marginBottom: 10 }}>💝 Donate Books</h4>
            <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
              Drop off gently used books at our store or participate in our "Buy One, Donate One" program where
              we match your book donation.
            </p>
          </Col>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827", marginBottom: 10 }}>💰 Financial Contribution</h4>
            <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
              Make a tax-deductible monetary donation to help us purchase new books and expand our programs to
              more communities.
            </p>
          </Col>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827", marginBottom: 10 }}>🤝 Volunteer</h4>
            <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
              Join our volunteer team to help sort books, visit schools, organize reading events, and teach
              literacy classes in our community centers.
            </p>
          </Col>
          <Col xs={24} md={12}>
            <h4 style={{ color: "#111827", marginBottom: 10 }}>🏢 Corporate Partnership</h4>
            <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
              Partner with us through CSR programs. We offer customized charity initiatives aligned with your
              company's values and goals.
            </p>
          </Col>
        </Row>
      </Card>

      <Card style={{ background: "#f0f4ff", textAlign: "center", border: "2px solid #667eea" }}>
        <h2 style={{ fontSize: 28, marginBottom: 15, color: "#111827" }}>
          Join Our Mission
        </h2>
        <p style={{ fontSize: 16, color: "#6b7280", marginBottom: 25, maxWidth: 700, margin: "0 auto 25px" }}>
          Together, we can bring the joy of reading and the power of education to every child in Vietnam.
          Contact us to learn more about our programs or to get involved.
        </p>
        <div>
          <p style={{ fontSize: 15, color: "#4b5563", marginBottom: 5 }}>
            <strong>Email:</strong> charity@shradha.com
          </p>
          <p style={{ fontSize: 15, color: "#4b5563", marginBottom: 5 }}>
            <strong>Phone:</strong> 091 256 1800
          </p>
          <p style={{ fontSize: 15, color: "#4b5563" }}>
            <strong>Address:</strong> 44 Phạm Hồng Thái, Ba Đình, Hanoi
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Charity;
