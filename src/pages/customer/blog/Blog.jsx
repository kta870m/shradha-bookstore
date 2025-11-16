import React, { useState } from "react";
import { Card, Row, Col, Form, Input, Button, Typography, message } from "antd";

const { Title, Text } = Typography;

const Blog = () => {
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const response = await window.$axios.post('/FeedbackQueries/submit', values);
      
      if (response.data.success) {
        message.success('Feedback submitted successfully — thank you!');
        form.resetFields();
      } else {
        message.error(response.data.message || 'Unable to submit feedback');
      }
    } catch (err) {
      console.error('Feedback submit error:', err);
      const errorMsg = err?.response?.data?.message || 'Unable to send feedback. Please try again later.';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <Title level={2} style={{ marginBottom: 8 }}>Feedback</Title>
        <Text type="secondary">We value your thoughts — send us feedback about the store or website</Text>
      </div>

      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item name="name" label="Your name" rules={[{ required: true, message: 'Please enter your name' }]}>
                <Input placeholder="Enter your name" />
              </Form.Item>

              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
                <Input placeholder="Enter your email" />
              </Form.Item>

              <Form.Item name="subject" label="Subject" rules={[{ required: true, message: 'Please enter a subject' }]}>
                <Input placeholder="Subject" />
              </Form.Item>

              <Form.Item name="message" label="Message" rules={[{ required: true, message: 'Please enter your message' }]}>
                <Input.TextArea rows={6} placeholder="Write your feedback here..." />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={submitting}>
                  Send Feedback
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Blog;
