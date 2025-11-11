import React from 'react';
import { Image, Space } from 'antd';
import { CloudinaryImage, extractPublicIdFromUrl } from '../../config/cloudinary.jsx';

/**
 * Component để hiển thị gallery ảnh từ Cloudinary
 */
const CloudinaryImageGallery = ({ 
  images = [], 
  alt = '', 
  thumbnailSize = 60, 
  previewSize = 400,
  showPreview = true 
}) => {
  if (!images || images.length === 0) {
    return (
      <Image
        width={thumbnailSize}
        height={thumbnailSize}
        src="/placeholder-book.svg"
        alt={alt}
        style={{ objectFit: 'cover', borderRadius: 4 }}
      />
    );
  }

  // Nếu chỉ có 1 ảnh
  if (images.length === 1) {
    const image = images[0];
    const isCloudinary = image && typeof image === 'string' && image.includes('cloudinary');
    
    if (isCloudinary) {
      const publicId = extractPublicIdFromUrl(image);
      return (
        <CloudinaryImage
          publicId={publicId}
          alt={alt}
          width={thumbnailSize}
          height={thumbnailSize}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="/placeholder-book.svg"
        />
      );
    }
    
    return (
      <Image
        width={thumbnailSize}
        height={thumbnailSize}
        src={image || '/placeholder-book.svg'}
        alt={alt}
        style={{ objectFit: 'cover', borderRadius: 4 }}
        fallback="/placeholder-book.svg"
        preview={showPreview}
      />
    );
  }

  // Nếu có nhiều ảnh, hiển thị preview group
  const previewImages = images.map(img => {
    if (img && typeof img === 'string' && img.includes('cloudinary')) {
      const publicId = extractPublicIdFromUrl(img);
      return {
        src: `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'ddbvpnf0s'}/image/upload/w_${previewSize},h_${previewSize},c_fill,f_auto,q_auto/${publicId}`
      };
    }
    return { src: img || '/placeholder-book.svg' };
  });

  return (
    <Image.PreviewGroup items={previewImages}>
      <Space size={4}>
        {images.slice(0, 3).map((image, index) => {
          const isCloudinary = image && typeof image === 'string' && image.includes('cloudinary');
          
          if (isCloudinary) {
            const publicId = extractPublicIdFromUrl(image);
            return (
              <CloudinaryImage
                key={index}
                publicId={publicId}
                alt={`${alt} ${index + 1}`}
                width={thumbnailSize}
                height={thumbnailSize}
                style={{ objectFit: 'cover', borderRadius: 4 }}
                fallback="/placeholder-book.svg"
              />
            );
          }
          
          return (
            <Image
              key={index}
              width={thumbnailSize}
              height={thumbnailSize}
              src={image || '/placeholder-book.svg'}
              alt={`${alt} ${index + 1}`}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              fallback="/placeholder-book.svg"
              preview={index === 0} // Chỉ cho preview ảnh đầu tiên
            />
          );
        })}
        {images.length > 3 && (
          <div 
            style={{
              width: thumbnailSize,
              height: thumbnailSize,
              borderRadius: 4,
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#666'
            }}
          >
            +{images.length - 3}
          </div>
        )}
      </Space>
    </Image.PreviewGroup>
  );
};

export default CloudinaryImageGallery;