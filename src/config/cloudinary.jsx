import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { fill, fit, crop, scale } from '@cloudinary/url-gen/actions/resize';
import { quality, format } from '@cloudinary/url-gen/actions/delivery';
import { auto } from '@cloudinary/url-gen/qualifiers/format';
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality';

// Khởi tạo Cloudinary instance
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ddbvpnf0s';
console.log('Cloudinary cloud name:', cloudName);

const cld = new Cloudinary({
  cloud: {
    // Cloud name từ Cloudinary URL
    cloudName: cloudName
  }
});

console.log('Cloudinary instance created:', cld);

// Helper function để tạo URL ảnh từ Cloudinary
export const getCloudinaryImageUrl = (publicId, options = {}) => {
  if (!publicId) return null;
  
  try {
    const image = cld.image(publicId);
    
    // Áp dụng các transformations mặc định
    image
      .delivery(format(auto())) // Tự động chọn format tốt nhất
      .delivery(quality(autoQuality())); // Tự động tối ưu chất lượng

    // Áp dụng resize nếu có options
    if (options.width && options.height) {
      image.resize(fill().width(options.width).height(options.height));
    } else if (options.width) {
      image.resize(scale().width(options.width));
    } else if (options.height) {
      image.resize(scale().height(options.height));
    }

    return image.toURL();
  } catch (error) {
    console.error('Error generating Cloudinary URL:', error);
    return null;
  }
};

// Helper component để hiển thị ảnh Cloudinary
export const CloudinaryImage = ({ 
  publicId, 
  alt, 
  width, 
  height, 
  className, 
  style,
  fallback = '/placeholder-book.svg',
  ...props 
}) => {
  console.log('CloudinaryImage component received:', { publicId, alt, width, height });
  
  if (!publicId) {
    console.log('No publicId provided, using fallback');
    return (
      <img 
        src={fallback} 
        alt={alt} 
        width={width} 
        height={height}
        className={className}
        style={style}
        {...props}
      />
    );
  }

  try {
    console.log('Creating Cloudinary image with publicId:', publicId);
    const image = cld.image(publicId);
    
    // Áp dụng transformations
    image
      .delivery(format(auto()))
      .delivery(quality(autoQuality()));

    if (width && height) {
      image.resize(fill().width(width).height(height));
    } else if (width) {
      image.resize(scale().width(width));
    } else if (height) {
      image.resize(scale().height(height));
    }

    const imageUrl = image.toURL();
    console.log('Generated Cloudinary URL:', imageUrl);

    return (
      <AdvancedImage 
        cldImg={image}
        alt={alt}
        className={className}
        style={style}
        onError={(e) => {
          console.error('Cloudinary image load error:', e);
          // Fallback nếu ảnh không load được
          e.target.src = fallback;
        }}
        onLoad={() => {
          console.log('Cloudinary image loaded successfully');
        }}
        {...props}
      />
    );
  } catch (error) {
    console.error('Error rendering Cloudinary image:', error);
    return (
      <img 
        src={fallback} 
        alt={alt} 
        width={width} 
        height={height}
        className={className}
        style={style}
        {...props}
      />
    );
  }
};

// Helper để extract public ID từ Cloudinary URL
export const extractPublicIdFromUrl = (url) => {
  console.log('Extracting public ID from URL:', url);
  
  if (!url || typeof url !== 'string') {
    console.log('Invalid URL provided');
    return null;
  }
  
  try {
    // Pattern để match Cloudinary URL
    const cloudinaryPattern = /\/v\d+\/(.+?)(?:\.[a-zA-Z]+)?$/;
    const match = url.match(cloudinaryPattern);
    
    console.log('Pattern match result:', match);
    
    if (match && match[1]) {
      console.log('Extracted public ID:', match[1]);
      return match[1];
    }
    
    // Pattern khác cho URL không có version
    const simplePattern = /\/([^\/]+)(?:\.[a-zA-Z]+)?$/;
    const simpleMatch = url.match(simplePattern);
    
    if (simpleMatch && simpleMatch[1]) {
      console.log('Extracted public ID (simple pattern):', simpleMatch[1]);
      return simpleMatch[1];
    }
    
    // Nếu không match pattern, có thể đây đã là public ID
    console.log('Using URL as public ID:', url);
    return url;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

export default cld;