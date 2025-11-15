import React from "react";
import { Card, Alert, Table } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const ConditionGuideline = () => {
  const conditionData = [
    {
      key: "1",
      condition: "New",
      description: "Brand new, unread book in perfect condition with no marks or damage",
      icon: "✨",
    },
    {
      key: "2",
      condition: "Like New",
      description: "Virtually new with minimal signs of handling. May have slight shelf wear",
      icon: "⭐",
    },
    {
      key: "3",
      condition: "Very Good",
      description: "Light wear on cover or spine. Pages are clean and intact",
      icon: "📚",
    },
    {
      key: "4",
      condition: "Good",
      description: "Moderate wear on cover. May have minor writing or highlighting inside",
      icon: "📖",
    },
    {
      key: "5",
      condition: "Acceptable",
      description: "Heavy wear but still readable. May have significant markings or damage",
      icon: "📕",
    },
  ];

  const acceptableColumns = [
    {
      title: "Feature",
      dataIndex: "feature",
      key: "feature",
      width: "40%",
    },
    {
      title: "Acceptable",
      dataIndex: "acceptable",
      key: "acceptable",
      align: "center",
      render: (text) => (
        <span style={{ color: "#10b981", fontSize: 18 }}>
          {text ? <CheckCircleOutlined /> : <CloseCircleOutlined style={{ color: "#ef4444" }} />}
        </span>
      ),
    },
  ];

  const acceptableData = [
    { key: "1", feature: "Minor cover wear or scratches", acceptable: true },
    { key: "2", feature: "Bent or creased pages", acceptable: true },
    { key: "3", feature: "Highlighted text or notes", acceptable: true },
    { key: "4", feature: "Library stamps or markings", acceptable: true },
    { key: "5", feature: "Ex-library books with labels", acceptable: true },
    { key: "6", feature: "Remainder marks", acceptable: true },
    { key: "7", feature: "Missing pages", acceptable: false },
    { key: "8", feature: "Torn or detached pages", acceptable: false },
    { key: "9", feature: "Water damage or mold", acceptable: false },
    { key: "10", feature: "Missing dust jacket (if described)", acceptable: false },
    { key: "11", feature: "Offensive writing or defacement", acceptable: false },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: 42, marginBottom: 15, color: "#111827" }}>
          Book Condition Guidelines
        </h1>
        <p style={{ fontSize: 18, color: "#6b7280" }}>
          Understanding our book condition standards for both buying and selling
        </p>
      </div>

      <Alert
        message="Quality Guarantee"
        description="Every book is carefully inspected and accurately graded to ensure you know exactly what you're purchasing."
        type="info"
        showIcon
        style={{ marginBottom: 30 }}
      />

      <Card style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 28, marginBottom: 20, color: "#111827" }}>
          Condition Grades Explained
        </h2>
        {conditionData.map((item) => (
          <div
            key={item.key}
            style={{
              padding: 20,
              marginBottom: 15,
              border: "2px solid #e5e7eb",
              borderRadius: 12,
              background: "#f9fafb",
            }}
          >
            <h3 style={{ fontSize: 20, marginBottom: 10, color: "#111827" }}>
              <span style={{ marginRight: 10, fontSize: 24 }}>{item.icon}</span>
              {item.condition}
            </h3>
            <p style={{ fontSize: 16, color: "#6b7280", margin: 0 }}>
              {item.description}
            </p>
          </div>
        ))}
      </Card>

      <Card title="What's Acceptable vs. Not Acceptable" style={{ marginBottom: 30 }}>
        <Table
          dataSource={acceptableData}
          columns={acceptableColumns}
          pagination={false}
          bordered
        />
      </Card>

      <Card title="Specific Condition Details" style={{ marginBottom: 30 }}>
        <h3 style={{ fontSize: 18, marginBottom: 15, color: "#111827" }}>
          📘 Cover Condition
        </h3>
        <ul style={{ fontSize: 15, color: "#6b7280", lineHeight: 2, marginBottom: 25 }}>
          <li><strong>Dust Jacket:</strong> We note if a hardcover book comes with or without its dust jacket</li>
          <li><strong>Surface Wear:</strong> Minor scuffs, scratches, or shelf wear are clearly described</li>
          <li><strong>Structural Integrity:</strong> Covers should be firmly attached to the binding</li>
        </ul>

        <h3 style={{ fontSize: 18, marginBottom: 15, color: "#111827" }}>
          📄 Page Condition
        </h3>
        <ul style={{ fontSize: 15, color: "#6b7280", lineHeight: 2, marginBottom: 25 }}>
          <li><strong>Yellowing:</strong> Natural aging is acceptable and will be noted</li>
          <li><strong>Foxing:</strong> Age spots on older books are described when present</li>
          <li><strong>Markings:</strong> Highlighting, underlining, or notes are always disclosed</li>
          <li><strong>Page Quality:</strong> All pages must be present and securely bound</li>
        </ul>

        <h3 style={{ fontSize: 18, marginBottom: 15, color: "#111827" }}>
          🔖 Special Features
        </h3>
        <ul style={{ fontSize: 15, color: "#6b7280", lineHeight: 2 }}>
          <li><strong>First Editions:</strong> Verified and authenticated when claimed</li>
          <li><strong>Signed Copies:</strong> Authenticity guaranteed with certificate when available</li>
          <li><strong>Limited Editions:</strong> Numbered and verified</li>
          <li><strong>Included Materials:</strong> CDs, posters, or inserts are listed if present</li>
        </ul>
      </Card>

      <Card title="For Sellers: Grading Your Books" style={{ marginBottom: 30 }}>
        <p style={{ fontSize: 16, color: "#4b5563", marginBottom: 15 }}>
          When selling books to us, please follow these guidelines:
        </p>
        <Alert
          message="Be Honest & Thorough"
          description="Accurate condition descriptions help us process your books faster and ensure fair pricing."
          type="success"
          showIcon
          style={{ marginBottom: 20 }}
        />
        <ul style={{ fontSize: 15, color: "#6b7280", lineHeight: 2 }}>
          <li>Inspect your book carefully under good lighting</li>
          <li>Note any damage, markings, or missing components</li>
          <li>When in doubt, grade conservatively (lower condition)</li>
          <li>Take clear photos if selling online</li>
          <li>Clean the book gently before listing (dust, smudges)</li>
        </ul>
      </Card>

      <Card title="Books We Cannot Accept" style={{ background: "#fef2f2", borderColor: "#fca5a5" }}>
        <p style={{ fontSize: 16, color: "#991b1b", marginBottom: 15, fontWeight: "500" }}>
          We cannot purchase or accept the following:
        </p>
        <ul style={{ fontSize: 15, color: "#7f1d1d", lineHeight: 2 }}>
          <li>Books with missing or torn pages</li>
          <li>Water-damaged or moldy books</li>
          <li>Books with strong odors (smoke, mildew)</li>
          <li>Heavily defaced or vandalized books</li>
          <li>Photocopied or pirated editions</li>
          <li>Books infested with pests</li>
        </ul>
      </Card>
    </div>
  );
};

export default ConditionGuideline;
