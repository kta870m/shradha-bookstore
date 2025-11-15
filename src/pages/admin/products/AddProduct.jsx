import React, { useState } from 'react';
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
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axios';
import CloudinaryUpload from '../../../components/cloudinary/CloudinaryUpload';
import mediaService from '../../../services/mediaService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AddProduct = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  // Fetch categories - removed since categories not in Product entity

  // Handle form submit
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Prepare product data
      const productData = {
        productCode: values.productCode,
        productName: values.productName,
        description: values.description,
        price: values.price,
        stockQuantity: values.stockQuantity,
        productType: values.productType,
        manufacturer: values.manufacturer,
        releaseDate: values.releaseDate ? values.releaseDate.format('YYYY-MM-DD') : null
      };

      // Create product first
      const response = await axiosInstance.post('/products', productData);
      const newProduct = response.data;
      
      console.log('Product created successfully:', newProduct);
      console.log('Product ID:', newProduct.productId);
      
      // Upload images to Media table if any
      if (images.length > 0 && newProduct.productId) {
        try {
          message.loading('Uploading images...', 0);
          
          const mediaResults = await mediaService.uploadMultipleProductMedia(
            newProduct.productId, 
            images
          );
          
          message.destroy(); // Clear loading message
          message.success(`Product added successfully with ${mediaResults.length} images!`);
          
          console.log('Uploaded media results:', mediaResults);
        } catch (mediaError) {
          console.error('Error uploading media:', mediaError);
          message.destroy(); // Clear loading message
          
          // More detailed error message
          let errorMsg = 'Product created but there was an error uploading images.';
          if (mediaError.message) {
            errorMsg += ` Details: ${mediaError.message}`;
          }
          
          message.warning(errorMsg);
        }
      } else {
        message.success('Product added successfully!');
      }

      // Navigate về products list
      navigate('/admin/products?refresh=' + Date.now());
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = Object.values(error.response.data.errors).flat();
        message.error(`Error: ${errorMessages.join(', ')}`);
      } else {
        message.error('Unable to add product. Please try again.');
      }
    } finally {
      setLoading(false);
      message.destroy(); // Make sure to clear any loading messages
    }
  };

  // Handle form reset
  const handleReset = () => {
    form.resetFields();
    setImages([]);
    message.info('Form has been reset');
  };

  // Generate product code
  const generateProductCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    const code = `PRD${timestamp}${randomStr}`;
    form.setFieldsValue({ productCode: code });
  };

  // Test function for debugging media upload
  const testMediaUpload = async () => {
    try {
      console.log('Testing direct API call...');
      
      // Test payload
      const testPayload = {
        productId: 1, // Assuming Product ID 1 exists
        mediaUrl: "https://res.cloudinary.com/ddbvpnf0s/image/upload/v1234567890/test.jpg",
        mediaType: "image/jpeg"
      };
      
      console.log('Test payload:', testPayload);
      
      const response = await axiosInstance.post('/media', testPayload);
      console.log('Test success:', response.data);
      message.success('Test upload thành công!');
      
    } catch (error) {
      console.error('Test error:', error);
      console.error('Error response:', error.response?.data);
      message.error('Test upload thất bại!');
    }
  };

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
                Back
              </Button>
              <Title level={3} style={{ margin: 0 }}>
                Add New Product
              </Title>
            </Space>
          </Col>
          <Col>
            <Button onClick={testMediaUpload} type="dashed" size="small">
              Test Media API
            </Button>
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              stockQuantity: 0,
              price: 0,
              productType: 'Book'
            }}
          >
            <Row gutter={24}>
              {/* Left Column - Basic Info */}
              <Col xs={24} lg={12}>
                <Card title="Basic Information" size="small" style={{ marginBottom: 16 }}>
                  {/* Product Code */}
                  <Form.Item
                    label="Product Code"
                    name="productCode"
                    rules={[
                      { required: true, message: 'Please enter product code' },
                      { min: 3, message: 'Product code must be at least 3 characters' }
                    ]}
                  >
                    <Input 
                      placeholder="Enter product code"
                      addonAfter={
                        <Button 
                          type="link" 
                          size="small"
                          onClick={generateProductCode}
                        >
                          Generate
                        </Button>
                      }
                    />
                  </Form.Item>

                  {/* Product Name */}
                  <Form.Item
                    label="Product Name"
                    name="productName"
                    rules={[
                      { required: true, message: 'Please enter product name' },
                      { min: 3, message: 'Product name must be at least 3 characters' }
                    ]}
                  >
                    <Input placeholder="Enter product name" />
                  </Form.Item>

                  {/* Description */}
                  <Form.Item
                    label="Product Description"
                    name="description"
                  >
                    <TextArea 
                      rows={4} 
                      placeholder="Enter detailed product description..."
                      showCount
                      maxLength={1000}
                    />
                  </Form.Item>

                  {/* Price & Stock */}
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Price (USD)"
                        name="price"
                        rules={[
                          { required: true, message: 'Please enter product price' },
                          { type: 'number', min: 0, message: 'Price must be greater than 0' }
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
                        label="Stock Quantity"
                        name="stockQuantity"
                        rules={[
                          { required: true, message: 'Please enter quantity' },
                          { type: 'number', min: 0, message: 'Quantity cannot be negative' }
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
                        label="Product Type"
                        name="productType"
                        rules={[{ required: true, message: 'Please select product type' }]}
                      >
                        <Select placeholder="Select product type">
                          <Option value="Book">Book</Option>
                          <Option value="EBook">E-Book</Option>
                          <Option value="AudioBook">Audio Book</Option>
                          <Option value="Magazine">Magazine</Option>
                          <Option value="Stationery">Stationery</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Manufacturer"
                        name="manufacturer"
                      >
                        <Input placeholder="Enter manufacturer name" />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Release Date */}
                  <Form.Item
                    label="Release Date"
                    name="releaseDate"
                  >
                    <DatePicker 
                      style={{ width: '100%' }}
                      placeholder="Select release date"
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Right Column - Images */}
              <Col xs={24} lg={12}>
                {/* Product Images */}
                <Card title="Product Images" size="small" style={{ marginBottom: 16 }}>
                  <Form.Item
                    label="Upload Product Images"
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
                      Images will be stored separately in the Media table
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
                  Reset
                </Button>
                <Button onClick={() => navigate('/admin/products')}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Add Product
                </Button>
              </Space>
            </Row>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default AddProduct;