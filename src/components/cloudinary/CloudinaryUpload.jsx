import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Button, 
  message, 
  Image, 
  Space, 
  Card, 
  Typography, 
  Row, 
  Col,
  Spin,
  Tag,
  Tooltip,
  Modal
} from 'antd';
import { 
  UploadOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CloudUploadOutlined,
  PlusOutlined 
} from '@ant-design/icons';

const { Text, Title } = Typography;

/**
 * Component để upload ảnh lên Cloudinary
 * Sử dụng Cloudinary Upload Widget
 */
const CloudinaryUpload = ({ 
  value = [], 
  onChange, 
  maxImages = 5, 
  folder = 'products',
  multiple = true,
  disabled = false,
  aspectRatio = null // '1:1', '16:9', etc.
}) => {
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  
  // Cloud name từ env
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ddbvpnf0s';
  
  // Upload preset - cần tạo trong Cloudinary Dashboard
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'shradha_products';

  // Mở Cloudinary Upload Widget
  const handleUpload = () => {
    if (disabled) return;
    
    // Tạo upload widget
    const widget = window.cloudinary?.createUploadWidget({
      cloudName: cloudName,
      uploadPreset: uploadPreset,
      folder: folder,
      multiple: multiple && value.length < maxImages,
      maxFiles: multiple ? Math.max(1, maxImages - value.length) : 1,
      maxFileSize: 10000000, // 10MB
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      cropping: aspectRatio ? true : false,
      croppingAspectRatio: aspectRatio ? parseFloat(aspectRatio.replace(':', '/')) : null,
      showSkipCropButton: false,
      croppingDefaultSelectionRatio: 1,
      sources: ['local', 'url', 'camera'],
      showAdvancedOptions: true,
      showInsecurePreview: false,
      showCompletedButton: true,
      styles: {
        palette: {
          window: "#FFFFFF",
          windowBorder: "#90A0B3",
          tabIcon: "#1890ff",
          menuIcons: "#5A616A",
          textDark: "#000000",
          textLight: "#FFFFFF",
          link: "#1890ff",
          action: "#FF620C",
          inactiveTabIcon: "#0E2F5A",
          error: "#F44235",
          inProgress: "#0078FF",
          complete: "#20B832",
          sourceBg: "#E4EBF1"
        },
        fonts: {
          default: null,
          "'Fira Sans', sans-serif": {
            url: "https://fonts.googleapis.com/css?family=Fira+Sans",
            active: true
          }
        }
      }
    }, (error, result) => {
      if (error) {
        console.error('Upload error:', error);
        message.error('Lỗi upload ảnh: ' + error.message);
        return;
      }
      
      if (result && result.event === 'success') {
        const newImage = {
          uid: result.info.public_id,
          name: result.info.original_filename + '.' + result.info.format,
          status: 'done',
          url: result.info.secure_url,
          publicId: result.info.public_id,
          thumbnailUrl: result.info.eager?.[0]?.secure_url || result.info.secure_url,
          // Add metadata for media service
          mediaType: `image/${result.info.format}`,
          size: result.info.bytes,
          width: result.info.width,
          height: result.info.height
        };
        
        const newImages = multiple ? [...value, newImage] : [newImage];
        onChange?.(newImages);
        message.success('Upload ảnh thành công!');
      }
    });
    
    widget.open();
  };

  // Load Cloudinary widget script nếu chưa có
  const loadCloudinaryWidget = () => {
    return new Promise((resolve) => {
      if (window.cloudinary) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      script.onload = resolve;
      document.head.appendChild(script);
    });
  };

  // Handle click upload
  const handleUploadClick = async () => {
    setLoading(true);
    try {
      await loadCloudinaryWidget();
      handleUpload();
    } catch (error) {
      message.error('Không thể tải Cloudinary widget');
    } finally {
      setLoading(false);
    }
  };

  // Xóa ảnh
  const handleRemove = (imageToRemove) => {
    const newImages = value.filter(img => img.uid !== imageToRemove.uid);
    onChange?.(newImages);
    message.success('Đã xóa ảnh');
  };

  // Preview ảnh
  const handlePreview = (file) => {
    setPreviewImage(file.url);
    setPreviewTitle(file.name);
    setPreviewVisible(true);
  };

  // Render upload button
  const renderUploadButton = () => {
    const canUpload = !disabled && (!multiple || value.length < maxImages);
    
    return (
      <Button
        type="dashed"
        icon={loading ? <Spin size="small" /> : <CloudUploadOutlined />}
        onClick={handleUploadClick}
        disabled={!canUpload}
        loading={loading}
        style={{
          width: 104,
          height: 104,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ marginTop: 8, fontSize: 12 }}>
          {loading ? 'Đang tải...' : 'Upload'}
        </div>
      </Button>
    );
  };

  // Render image item
  const renderImageItem = (image, index) => (
    <div key={image.uid} style={{ position: 'relative' }}>
      <Image
        width={104}
        height={104}
        src={image.thumbnailUrl || image.url}
        alt={image.name}
        style={{ 
          objectFit: 'cover', 
          borderRadius: 6,
          border: '1px solid #d9d9d9'
        }}
        preview={{
          mask: (
            <div style={{ color: 'white', fontSize: 12 }}>
              <EyeOutlined /> Preview
            </div>
          )
        }}
      />
      
      {/* Actions overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          display: 'flex',
          gap: 4
        }}
      >
        {index === 0 && multiple && (
          <Tag 
            color="blue" 
            size="small"
            style={{ fontSize: 10, padding: '0 4px', lineHeight: '16px' }}
          >
            Chính
          </Tag>
        )}
        
        <Tooltip title="Xóa ảnh">
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleRemove(image)}
            style={{
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #ff4d4f'
            }}
          />
        </Tooltip>
      </div>
    </div>
  );

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Upload area */}
        <div>
          <Row gutter={[8, 8]}>
            {/* Existing images */}
            {value.map((image, index) => (
              <Col key={image.uid}>
                {renderImageItem(image, index)}
              </Col>
            ))}
            
            {/* Upload button */}
            {(!multiple || value.length < maxImages) && (
              <Col>
                {renderUploadButton()}
              </Col>
            )}
          </Row>
        </div>

        {/* Info text */}
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {multiple 
              ? `Có thể upload tối đa ${maxImages} ảnh. ${value.length}/${maxImages} ảnh đã chọn.`
              : 'Chỉ có thể upload 1 ảnh.'
            }
            {multiple && value.length > 0 && ' Ảnh đầu tiên sẽ là ảnh đại diện.'}
          </Text>
        </div>

        {/* Upload requirements */}
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Định dạng: JPG, PNG, GIF, WebP. Kích thước tối đa: 10MB.
            {aspectRatio && ` Tỷ lệ khuyên dùng: ${aspectRatio}.`}
          </Text>
        </div>
      </Space>

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <Image
          alt="preview"
          style={{ width: '100%' }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
};

export default CloudinaryUpload;