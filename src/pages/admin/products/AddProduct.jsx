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
  Switch,
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

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AddProduct = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [images, setImages] = useState([]);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await axiosInstance.get('/categories');
      setCategories(response.data.items || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Không thể tải danh sách danh mục');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (values) => {
    if (images.length === 0) {
      message.error('Vui lòng upload ít nhất một ảnh sản phẩm');
      return;
    }

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
        isbn: values.isbn,
        author: values.author,
        publishedYear: values.publishedYear,
        language: values.language,
        pages: values.pages,
        weight: values.weight,
        dimensions: values.dimensions,
        isActive: values.isActive !== false,
        thumbnailUrl: images[0]?.url, // Ảnh đầu tiên làm thumbnail
        categoryIds: values.categoryIds || []
      };

      // Create product
      const response = await axiosInstance.post('/products', productData);
      
      // Upload additional images if any
      if (images.length > 1) {
        const productId = response.data.productId;
        // TODO: Implement multiple images upload to product media table
        // This would require additional API endpoint
      }

      message.success('Thêm sản phẩm thành công!');
      // Navigate về products list với timestamp để force refresh
      navigate('/admin/products?refresh=' + Date.now());
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Không thể thêm sản phẩm. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    form.resetFields();
    setImages([]);
    message.info('Đã reset form');
  };

  // Generate product code
  const generateProductCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    const code = `PRD${timestamp}${randomStr}`;
    form.setFieldsValue({ productCode: code });
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
                Quay lại
              </Button>
              <Title level={3} style={{ margin: 0 }}>
                Thêm sản phẩm mới
              </Title>
            </Space>
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              isActive: true,
              stockQuantity: 0,
              price: 0,
              productType: 'Book'
            }}
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
                      addonAfter={
                        <Button 
                          type="link" 
                          size="small"
                          onClick={generateProductCode}
                        >
                          Tạo mã
                        </Button>
                      }
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

                  {/* Product Type & Categories */}
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
                        label="Danh mục"
                        name="categoryIds"
                      >
                        <Select
                          mode="multiple"
                          placeholder="Chọn danh mục"
                          loading={loadingCategories}
                          showSearch
                          optionFilterProp="children"
                        >
                          {categories.map(cat => (
                            <Option key={cat.categoryId} value={cat.categoryId}>
                              {cat.categoryName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Active Status */}
                  <Form.Item
                    label="Trạng thái"
                    name="isActive"
                    valuePropName="checked"
                  >
                    <Switch 
                      checkedChildren="Hoạt động" 
                      unCheckedChildren="Không hoạt động"
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Right Column - Images & Additional Info */}
              <Col xs={24} lg={12}>
                {/* Product Images */}
                <Card title="Hình ảnh sản phẩm" size="small" style={{ marginBottom: 16 }}>
                  <Form.Item
                    label="Upload ảnh sản phẩm"
                    required
                  >
                    <CloudinaryUpload
                      value={images}
                      onChange={setImages}
                      maxImages={5}
                      folder="products/books"
                      multiple={true}
                      aspectRatio="1:1"
                    />
                  </Form.Item>
                </Card>

                {/* Book Details (nếu là sách) */}
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
                  prevValues.productType !== currentValues.productType
                }>
                  {({ getFieldValue }) => {
                    const productType = getFieldValue('productType');
                    if (productType === 'Book' || productType === 'EBook') {
                      return (
                        <Card title="Thông tin sách" size="small" style={{ marginBottom: 16 }}>
                          <Form.Item label="ISBN" name="isbn">
                            <Input placeholder="Nhập mã ISBN" />
                          </Form.Item>

                          <Form.Item label="Tác giả" name="author">
                            <Input placeholder="Nhập tên tác giả" />
                          </Form.Item>

                          <Form.Item label="Nhà xuất bản" name="manufacturer">
                            <Input placeholder="Nhập tên nhà xuất bản" />
                          </Form.Item>

                          <Row gutter={16}>
                            <Col xs={24} sm={12}>
                              <Form.Item label="Năm xuất bản" name="publishedYear">
                                <InputNumber 
                                  style={{ width: '100%' }}
                                  placeholder="2024"
                                  min={1900}
                                  max={new Date().getFullYear() + 1}
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                              <Form.Item label="Số trang" name="pages">
                                <InputNumber 
                                  style={{ width: '100%' }}
                                  placeholder="0"
                                  min={1}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col xs={24} sm={12}>
                              <Form.Item label="Ngôn ngữ" name="language">
                                <Select placeholder="Chọn ngôn ngữ">
                                  <Option value="Vietnamese">Tiếng Việt</Option>
                                  <Option value="English">Tiếng Anh</Option>
                                  <Option value="French">Tiếng Pháp</Option>
                                  <Option value="Chinese">Tiếng Trung</Option>
                                  <Option value="Japanese">Tiếng Nhật</Option>
                                  <Option value="Korean">Tiếng Hàn</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                              <Form.Item label="Trọng lượng (g)" name="weight">
                                <InputNumber 
                                  style={{ width: '100%' }}
                                  placeholder="0"
                                  min={0}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Form.Item label="Kích thước (cm)" name="dimensions">
                            <Input placeholder="VD: 20.5 x 13 x 2.5" />
                          </Form.Item>
                        </Card>
                      );
                    }
                    return null;
                  }}
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            {/* Form Actions */}
            <Row justify="end">
              <Space>
                <Button onClick={handleReset}>
                  Đặt lại
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
                  Thêm sản phẩm
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