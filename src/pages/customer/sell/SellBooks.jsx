import React, { useState } from "react";
import { Card, Form, Input, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const SellBooks = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Form values:", values);
    message.success("Your book submission has been received! We'll contact you soon.");
    form.resetFields();
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
      <Card>
        <h1 style={{ fontSize: 32, marginBottom: 20, color: "#111827" }}>
          Sell Your Books
        </h1>
        <p style={{ fontSize: 16, color: "#6b7280", marginBottom: 30 }}>
          Get the best price in town for your pre-owned books! Fill out the form below
          and we'll get back to you with a quote within 24 hours.
        </p>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Your Name"
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="Enter your full name" size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="your.email@example.com" size="large" />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[{ required: true, message: "Please enter your phone number" }]}
          >
            <Input placeholder="0123456789" size="large" />
          </Form.Item>

          <Form.Item
            label="Book Title"
            name="bookTitle"
            rules={[{ required: true, message: "Please enter the book title" }]}
          >
            <Input placeholder="Enter book title" size="large" />
          </Form.Item>

          <Form.Item
            label="Author"
            name="author"
            rules={[{ required: true, message: "Please enter the author name" }]}
          >
            <Input placeholder="Enter author name" size="large" />
          </Form.Item>

          <Form.Item
            label="Book Condition"
            name="condition"
            rules={[{ required: true, message: "Please describe the book condition" }]}
          >
            <Input.TextArea
              placeholder="Describe the condition (e.g., Like New, Good, Fair)"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="Additional Notes"
            name="notes"
          >
            <Input.TextArea
              placeholder="Any additional information you'd like to share"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            label="Upload Book Images (Optional)"
            name="images"
          >
            <Upload
              listType="picture"
              maxCount={5}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                height: 50,
                fontSize: 16,
              }}
            >
              Submit Book for Quote
            </Button>
          </Form.Item>
        </Form>

        <div
          style={{
            marginTop: 40,
            padding: 20,
            background: "#f9fafb",
            borderRadius: 8,
          }}
        >
          <h3 style={{ marginBottom: 10 }}>How It Works:</h3>
          <ol style={{ paddingLeft: 20, color: "#6b7280" }}>
            <li>Fill out the form above with your book details</li>
            <li>We'll review your submission and send you a quote within 24 hours</li>
            <li>If you accept our offer, we'll arrange a pickup or you can drop off the books</li>
            <li>Get paid instantly upon verification!</li>
          </ol>
        </div>
      </Card>
    </div>
  );
};

export default SellBooks;
