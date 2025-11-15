import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Row,
  Col,
  message,
  Typography,
  Space,
  Divider,
  DatePicker,
  Spin
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import axiosInstance from '../../../api/axios';
import CloudinaryUpload from '../../../components/cloudinary/CloudinaryUpload';
import mediaService from '../../../services/mediaService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EditProduct = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { productId } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [productData, setProductData] = useState(null);

  // Fetch product data for editing
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) {
        message.error({
          content: 'Không tìm thấy ID sản phẩm',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        });
        navigate('/admin/products');
        return;
      }

      try {
        setInitialLoading(true);
        console.log('Fetching product data for ID:', productId);
        
        const response = await axiosInstance.get(`/products/${productId}`);
        const product = response.data;
        
        console.log('Product data received:', product);
        setProductData(product);

        // Set form values
        form.setFieldsValue({
          productCode: product.productCode,
          productName: product.productName,
          description: product.description,
          price: product.price,
          stockQuantity: product.stockQuantity,
          productType: product.productType,
          manufacturer: product.manufacturer,
          releaseDate: product.releaseDate ? moment(product.releaseDate) : null
        });

        // Set existing images
        if (product.mediaFiles && product.mediaFiles.length > 0) {
          const existingImages = product.mediaFiles
            .filter(media => media.fileType === 'Image' || media.mediaUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i))
            .map(media => ({
              url: media.mediaUrl,
              mediaId: media.mediaId // Keep track of existing media IDs
            }));
          setImages(existingImages);
          console.log('Existing images:', existingImages);
        }

      } catch (error) {
        console.error('Error fetching product:', error);
        message.error({
          content: 'Không thể tải thông tin sản phẩm',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        });
        navigate('/admin/products');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProductData();
  }, [productId, form, navigate]);

  // Handle form submit
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Prepare product data
      const productData = {
        productId: parseInt(productId),
        productCode: values.productCode,
        productName: values.productName,
        description: values.description,
        price: values.price,
        stockQuantity: values.stockQuantity,
        productType: values.productType,
        manufacturer: values.manufacturer,
        releaseDate: values.releaseDate ? values.releaseDate.format('YYYY-MM-DD') : null
      };

      console.log('Updating product with data:', productData);
      console.log('PUT URL:', `/products/${productId}`);

      // Update product
      const response = await axiosInstance.put(`/products/${productId}`, productData);
      console.log('PUT Response status:', response.status);
      console.log('PUT Response data:', response.data);
      
      const updatedProduct = response.data;
      console.log('Product updated successfully:', updatedProduct);
      
      // Handle image updates - Delete all old images and upload current images
      try {
        message.loading('Đang cập nhật ảnh...', 0);



        // Step 1: Delete all existing media for this product
        try {
          await axiosInstance.delete(`/media/product/${productId}`);
        } catch (deleteError) {
          // Continue anyway - might be no existing media
        }

        // Step 2: Upload all current images (both kept and new ones)
        if (images.length > 0) {
          // Convert images to the format expected by mediaService (objects with url property)
          const imageObjects = images.map((img, index) => {
            let url = null;
            
            if (typeof img === 'string') {
              url = img; // New uploaded image URL string
            } else if (img && typeof img === 'object' && img.url) {
              url = img.url; // Image object with URL property
            } else if (img && typeof img === 'object' && img.mediaUrl) {
              url = img.mediaUrl; // From existing media
            }
            
            return url ? { url: url } : null;
          }).filter(obj => obj !== null);

          if (imageObjects.length > 0) {
            const mediaResults = await mediaService.uploadMultipleProductMedia(
              productId, 
              imageObjects
            );
          }
        }
        
        message.destroy(); // Clear loading message
        message.success({
          content: 'Cập nhật sản phẩm thành công!',
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        });
        
        // Refresh the product data to show updated images
        await fetchProductData();
        
      } catch (mediaError) {
        message.destroy(); // Clear loading message
        
        let errorMsg = 'Sản phẩm đã được cập nhật nhưng có lỗi khi cập nhật ảnh.';
        if (mediaError.message) {
          errorMsg += ` Chi tiết: ${mediaError.message}`;
        }
        
        message.warning({
          content: errorMsg,
          icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />
        });
      }

      // Navigate back to products list with update action
      navigate('/admin/products?refresh=' + Date.now() + '&action=update');
    } catch (error) {
      if (error.response?.data?.message) {
        message.error({
          content: error.response.data.message,
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        });
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = Object.values(error.response.data.errors).flat();
        message.error({
          content: `Lỗi: ${errorMessages.join(', ')}`,
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        });
      } else {
        message.error({
          content: 'Không thể cập nhật sản phẩm. Vui lòng thử lại.',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        });
      }
    } finally {
      setLoading(false);
      message.destroy(); // Make sure to clear any loading messages
    }
  };

  // Handle form reset to original values
  const handleReset = () => {
    if (productData) {
      form.setFieldsValue({
        productCode: productData.productCode,
        productName: productData.productName,
        description: productData.description,
        price: productData.price,
        stockQuantity: productData.stockQuantity,
        productType: productData.productType,
        manufacturer: productData.manufacturer,
        releaseDate: productData.releaseDate ? moment(productData.releaseDate) : null
      });

      // Reset images to original
      if (productData.mediaFiles && productData.mediaFiles.length > 0) {
        const originalImages = productData.mediaFiles
          .filter(media => media.fileType === 'Image' || media.mediaUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i))
          .map(media => ({
            url: media.mediaUrl,
            mediaId: media.mediaId
          }));
        setImages(originalImages);
      } else {
        setImages([]);
      }

      message.info('Đã khôi phục về dữ liệu gốc');
    }
  };

  if (initialLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Title level={4}>Không tìm thấy sản phẩm</Title>
        <Button onClick={() => navigate('/admin/products')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card>
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/products')}
              >
                Quay lại
              </Button>
              <Title level={3} style={{ margin: 0 }}>
                Chỉnh sửa sản phẩm
              </Title>
              <Text type="secondary">ID: {productId}</Text>
            </Space>
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={24}>
              {/* Left Column - Basic Info */}
              <Col xs={24} lg={12}>
                <Card title="Thông tin cơ bản" size="small" style={{ marginBottom: 16 }}>
                  {/* Product Code */}
                  <Form.Item
                    label="Mã sản phẩm"
                    name="productCode"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mã sản phẩm' },
                      { min: 3, message: 'Mã sản phẩm phải có ít nhất 3 ký tự' }
                    ]}
                  >
                    <Input 
                      placeholder="Nhập mã sản phẩm"
                      disabled // Usually product code shouldn't be changed
                    />
                  </Form.Item>

                  {/* Product Name */}
                  <Form.Item
                    label="Tên sản phẩm"
                    name="productName"
                    rules={[
                      { required: true, message: 'Vui lòng nhập tên sản phẩm' },
                      { min: 3, message: 'Tên sản phẩm phải có ít nhất 3 ký tự' }
                    ]}
                  >
                    <Input placeholder="Nhập tên sản phẩm" />
                  </Form.Item>

                  {/* Description */}
                  <Form.Item
                    label="Mô tả sản phẩm"
                    name="description"
                  >
                    <TextArea 
                      rows={4} 
                      placeholder="Nhập mô tả chi tiết về sản phẩm..."
                      showCount
                      maxLength={1000}
                    />
                  </Form.Item>

                  {/* Price & Stock */}
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Giá (USD)"
                        name="price"
                        rules={[
                          { required: true, message: 'Vui lòng nhập giá sản phẩm' },
                          { type: 'number', min: 0, message: 'Giá phải lớn hơn 0' }
                        ]}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="0.00"
                          min={0}
                          step={0.01}
                          precision={2}
                          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Số lượng tồn kho"
                        name="stockQuantity"
                        rules={[
                          { required: true, message: 'Vui lòng nhập số lượng' },
                          { type: 'number', min: 0, message: 'Số lượng không thể âm' }
                        ]}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="0"
                          min={0}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Product Type & Manufacturer */}
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Loại sản phẩm"
                        name="productType"
                        rules={[{ required: true, message: 'Vui lòng chọn loại sản phẩm' }]}
                      >
                        <Select placeholder="Chọn loại sản phẩm">
                          <Option value="Book">Sách</Option>
                          <Option value="EBook">Sách điện tử</Option>
                          <Option value="AudioBook">Sách nói</Option>
                          <Option value="Magazine">Tạp chí</Option>
                          <Option value="Stationery">Văn phòng phẩm</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Nhà sản xuất"
                        name="manufacturer"
                      >
                        <Input placeholder="Nhập tên nhà sản xuất" />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Release Date */}
                  <Form.Item
                    label="Ngày phát hành"
                    name="releaseDate"
                  >
                    <DatePicker 
                      style={{ width: '100%' }}
                      placeholder="Chọn ngày phát hành"
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Right Column - Images */}
              <Col xs={24} lg={12}>
                {/* Product Images */}
                <Card title="Hình ảnh sản phẩm" size="small" style={{ marginBottom: 16 }}>
                  <Form.Item
                    label="Upload ảnh sản phẩm"
                  >
                    <CloudinaryUpload
                      value={images}
                      onChange={setImages}
                      maxImages={5}
                      folder="products/books"
                      multiple={true}
                      aspectRatio="1:1"
                    />
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                      Ảnh hiện tại sẽ được giữ lại, ảnh mới sẽ được thêm vào
                    </div>
                  </Form.Item>
                </Card>
              </Col>
            </Row>

            <Divider />

            {/* Form Actions */}
            <Row justify="end">
              <Space>
                <Button onClick={handleReset}>
                  Khôi phục
                </Button>
                <Button onClick={() => navigate('/admin/products')}>
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Cập nhật sản phẩm
                </Button>
              </Space>
            </Row>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default EditProduct;