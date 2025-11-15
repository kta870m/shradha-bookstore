import axiosInstance from '../api/axios';

/**
 * Service để xử lý Media API calls
 */
class MediaService {
  // Upload một ảnh vào Media table
  async uploadProductMedia(productId, mediaData) {
    try {
      // Validate input
      if (!productId || productId <= 0) {
        throw new Error('Product ID không hợp lệ');
      }
      
      if (!mediaData || !mediaData.url) {
        throw new Error('Media URL không hợp lệ');
      }

      const payload = {
        productId: productId,
        mediaUrl: mediaData.url,
        mediaType: this.getMediaTypeFromUrl(mediaData.url)
      };

      console.log('Uploading media payload:', payload);

      const response = await axiosInstance.post('/media', payload);
      console.log('Upload success:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading media:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Provide more detailed error message
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 400) {
          if (errorData?.errors) {
            // Handle validation errors
            const validationErrors = Object.values(errorData.errors).flat();
            throw new Error(`Validation error: ${validationErrors.join(', ')}`);
          } else if (typeof errorData === 'string') {
            throw new Error(`Bad request: ${errorData}`);
          } else {
            throw new Error(`Bad request: ${errorData?.message || 'Invalid data'}`);
          }
        } else if (status === 404) {
          throw new Error('Product không tồn tại hoặc API endpoint không tìm thấy');
        } else if (status === 401) {
          throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại');
        } else {
          throw new Error(`Server error (${status}): ${errorData?.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        throw new Error('Không thể kết nối đến server. Kiểm tra kết nối mạng');
      } else {
        throw new Error(`Upload error: ${error.message}`);
      }
    }
  }

  // Upload nhiều ảnh cùng lúc
  async uploadMultipleProductMedia(productId, imagesArray) {
    try {
      // Validate input
      if (!productId || productId <= 0) {
        throw new Error('Product ID không hợp lệ');
      }

      if (!Array.isArray(imagesArray) || imagesArray.length === 0) {
        throw new Error('Danh sách ảnh không hợp lệ');
      }

      // Validate each image before uploading
      for (let i = 0; i < imagesArray.length; i++) {
        const image = imagesArray[i];
        if (!image || !image.url) {
          throw new Error(`Ảnh thứ ${i + 1} không có URL hợp lệ`);
        }
      }

      // Upload one by one to get better error handling
      const results = [];
      for (let i = 0; i < imagesArray.length; i++) {
        const image = imagesArray[i];
        
        try {
          const result = await this.uploadProductMedia(productId, image);
          results.push(result);
        } catch (error) {
          throw new Error(`Lỗi upload ảnh thứ ${i + 1}: ${error.message}`);
        }
      }

      return results;
    } catch (error) {
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  // Lấy tất cả media của một product
  async getProductMedia(productId) {
    try {
      if (!productId || productId <= 0) {
        throw new Error('Product ID không hợp lệ');
      }

      const response = await axiosInstance.get(`/media/product/${productId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching product media:', error);
      
      if (error.response?.status === 404) {
        // Return empty array if product not found or no media
        return [];
      }
      
      throw error;
    }
  }

  // Xóa media
  async deleteMedia(mediaId) {
    try {
      if (!mediaId || mediaId <= 0) {
        throw new Error('Media ID không hợp lệ');
      }

      await axiosInstance.delete(`/media/${mediaId}`);
      return true;
    } catch (error) {
      console.error('Error deleting media:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Media không tồn tại');
      }
      
      throw error;
    }
  }

  // Cập nhật media
  async updateMedia(mediaId, updateData) {
    try {
      if (!mediaId || mediaId <= 0) {
        throw new Error('Media ID không hợp lệ');
      }

      const response = await axiosInstance.put(`/media/${mediaId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating media:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Media không tồn tại');
      }
      
      throw error;
    }
  }

  // Determine media type from URL
  getMediaTypeFromUrl(url) {
    if (!url || typeof url !== 'string') return 'unknown';
    
    // Extract extension from URL
    const urlParts = url.split('?')[0]; // Remove query parameters
    const extension = urlParts.split('.').pop()?.toLowerCase();
    
    if (!extension) return 'image/jpeg'; // Default
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'svg':
        return 'image/svg+xml';
      case 'bmp':
        return 'image/bmp';
      case 'ico':
        return 'image/x-icon';
      case 'mp4':
        return 'video/mp4';
      case 'webm':
        return 'video/webm';
      case 'mov':
        return 'video/quicktime';
      case 'avi':
        return 'video/x-msvideo';
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'image/jpeg'; // Default to jpeg for images
    }
  }

  // Validate image URL
  isValidImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
    const urlParts = url.split('?')[0]; // Remove query parameters
    const extension = urlParts.split('.').pop()?.toLowerCase();
    
    return extension ? imageExtensions.includes(extension) : false;
  }

  // Validate video URL
  isValidVideoUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'wmv', 'flv'];
    const urlParts = url.split('?')[0]; // Remove query parameters
    const extension = urlParts.split('.').pop()?.toLowerCase();
    
    return extension ? videoExtensions.includes(extension) : false;
  }

  // Get file size from URL (if possible)
  async getFileSizeFromUrl(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength, 10) : null;
    } catch (error) {
      console.warn('Could not get file size:', error.message);
      return null;
    }
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Test connection to media API
  async testConnection() {
    try {
      const response = await axiosInstance.get('/media');
      console.log('Media API connection test successful');
      return true;
    } catch (error) {
      console.error('Media API connection test failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
const mediaService = new MediaService();
export default mediaService;
