import React, { useState } from 'react';
import { Card, Space, Input, Button, Typography, Row, Col, message } from 'antd';
import { CloudinaryImage, getCloudinaryImageUrl, extractPublicIdFromUrl } from '../../config/cloudinary.jsx';
import CloudinaryImageGallery from '../components/CloudinaryImageGallery';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

/**
 * Component demo và test Cloudinary
 */
const CloudinaryDemo = () => {
  const [testUrl, setTestUrl] = useState('');
  const [testPublicId, setTestPublicId] = useState('');
  const [extractedId, setExtractedId] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');

  // Test extract public ID từ URL
  const handleExtractId = () => {
    if (!testUrl) {
      message.error('Vui lòng nhập Cloudinary URL để test');
      return;
    }
    
    const publicId = extractPublicIdFromUrl(testUrl);
    setExtractedId(publicId || 'Không thể extract public ID');
    message.success('Đã extract public ID thành công');
  };

  // Test generate URL từ public ID
  const handleGenerateUrl = () => {
    if (!testPublicId) {
      message.error('Vui lòng nhập public ID để test');
      return;
    }
    
    const url = getCloudinaryImageUrl(testPublicId, { width: 400, height: 400 });
    setGeneratedUrl(url || 'Không thể generate URL');
    message.success('Đã generate URL thành công');
  };

  // Một số ví dụ public IDs để test
  const samplePublicIds = [
    'sample', // Cloudinary default sample image
    'cld-sample-2',
    'cld-sample-3',
    'cld-sample-4',
    'cld-sample-5'
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Cloudinary Demo & Test</Title>
      <Paragraph>
        Component này giúp test và demo các tính năng Cloudinary trong ứng dụng.
      </Paragraph>

      <Row gutter={[24, 24]}>
        {/* Test Extract Public ID */}
        <Col xs={24} lg={12}>
          <Card title="Test Extract Public ID từ URL">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>Nhập Cloudinary URL để extract public ID:</Text>
              <TextArea
                rows={3}
                placeholder="Ví dụ: https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
              />
              <Button type="primary" onClick={handleExtractId}>
                Extract Public ID
              </Button>
              {extractedId && (
                <div>
                  <Text strong>Public ID: </Text>
                  <Text code>{extractedId}</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        {/* Test Generate URL */}
        <Col xs={24} lg={12}>
          <Card title="Test Generate URL từ Public ID">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>Nhập public ID để generate URL:</Text>
              <Input
                placeholder="Ví dụ: sample"
                value={testPublicId}
                onChange={(e) => setTestPublicId(e.target.value)}
              />
              <Button type="primary" onClick={handleGenerateUrl}>
                Generate URL
              </Button>
              {generatedUrl && (
                <div>
                  <Text strong>Generated URL: </Text>
                  <Text code style={{ wordBreak: 'break-all' }}>{generatedUrl}</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        {/* Test CloudinaryImage Component */}
        <Col xs={24}>
          <Card title="Test CloudinaryImage Component">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>Test hiển thị ảnh từ Cloudinary bằng public ID:</Text>
              <Row gutter={16}>
                {samplePublicIds.map((publicId) => (
                  <Col key={publicId} xs={12} sm={8} md={6} lg={4}>
                    <Card 
                      size="small" 
                      title={publicId}
                      style={{ textAlign: 'center' }}
                    >
                      <CloudinaryImage
                        publicId={publicId}
                        alt={`Sample ${publicId}`}
                        width={120}
                        height={120}
                        style={{ 
                          objectFit: 'cover', 
                          borderRadius: 8,
                          border: '1px solid #d9d9d9'
                        }}
                        fallback="/placeholder-book.svg"
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Space>
          </Card>
        </Col>

        {/* Test CloudinaryImageGallery Component */}
        <Col xs={24}>
          <Card title="Test CloudinaryImageGallery Component">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>Test hiển thị gallery ảnh:</Text>
              <Row gutter={16}>
                <Col xs={12} md={6}>
                  <Card size="small" title="Single Image">
                    <CloudinaryImageGallery 
                      images={['sample']}
                      alt="Single sample image"
                      thumbnailSize={100}
                    />
                  </Card>
                </Col>
                <Col xs={12} md={6}>
                  <Card size="small" title="Multiple Images">
                    <CloudinaryImageGallery 
                      images={samplePublicIds.slice(0, 3)}
                      alt="Multiple sample images"
                      thumbnailSize={100}
                    />
                  </Card>
                </Col>
                <Col xs={12} md={6}>
                  <Card size="small" title="Many Images (>3)">
                    <CloudinaryImageGallery 
                      images={samplePublicIds}
                      alt="Many sample images"
                      thumbnailSize={100}
                    />
                  </Card>
                </Col>
                <Col xs={12} md={6}>
                  <Card size="small" title="No Images">
                    <CloudinaryImageGallery 
                      images={[]}
                      alt="No images"
                      thumbnailSize={100}
                    />
                  </Card>
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CloudinaryDemo;