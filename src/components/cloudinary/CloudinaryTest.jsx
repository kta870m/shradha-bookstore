import React from 'react';
import { Card, Typography, Space, Button } from 'antd';
import { CloudinaryImage, getCloudinaryImageUrl, extractPublicIdFromUrl } from '../../config/cloudinary.jsx';

const { Title, Text, Paragraph } = Typography;

const CloudinaryTest = () => {
  // Test với một số URLs mẫu
  const testUrls = [
    'https://res.cloudinary.com/ddbvpnf0s/image/upload/v1234567890/sample.jpg',
    'https://res.cloudinary.com/ddbvpnf0s/image/upload/sample.jpg',
    'https://res.cloudinary.com/ddbvpnf0s/image/upload/v1234567890/products/book1.jpg',
    'sample', // Public ID trực tiếp
    'cld-sample-2' // Public ID mẫu của Cloudinary
  ];

  const handleTestUrl = (url) => {
    console.log('=== Testing URL ===');
    console.log('Original URL:', url);
    
    const publicId = extractPublicIdFromUrl(url);
    console.log('Extracted Public ID:', publicId);
    
    const generatedUrl = getCloudinaryImageUrl(publicId, { width: 200, height: 200 });
    console.log('Generated URL:', generatedUrl);
  };

  const handleTestCloudinaryConfig = () => {
    console.log('=== Cloudinary Config Test ===');
    console.log('Environment variables:', {
      VITE_CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      VITE_CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={3}>Cloudinary Debug Test</Title>
        
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Button onClick={handleTestCloudinaryConfig} type="primary">
              Test Cloudinary Config
            </Button>
          </div>

          <div>
            <Title level={4}>Test URLs</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              {testUrls.map((url, index) => (
                <Card key={index} size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text code>{url}</Text>
                    <Button size="small" onClick={() => handleTestUrl(url)}>
                      Test in Console
                    </Button>
                    <div style={{ textAlign: 'center' }}>
                      <CloudinaryImage
                        publicId={url.includes('cloudinary') ? extractPublicIdFromUrl(url) : url}
                        alt={`Test ${index}`}
                        width={100}
                        height={100}
                        style={{ 
                          border: '1px solid #d9d9d9',
                          borderRadius: 4 
                        }}
                      />
                    </div>
                  </Space>
                </Card>
              ))}
            </Space>
          </div>

          <div>
            <Title level={4}>Direct Cloudinary Sample Image</Title>
            <Text>Testing with Cloudinary's default sample image:</Text>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <CloudinaryImage
                publicId="sample"
                alt="Cloudinary Sample"
                width={200}
                height={200}
                style={{ 
                  border: '1px solid #d9d9d9',
                  borderRadius: 8 
                }}
              />
            </div>
          </div>

          <div>
            <Paragraph type="secondary">
              Mở Developer Console (F12) để xem debug logs khi test các URLs.
            </Paragraph>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default CloudinaryTest;