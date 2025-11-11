import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Select, 
  Card, 
  Typography, 
  Row, 
  Col,
  message,
  Image,
  Tooltip,
  Modal,
  Descriptions,
  Rate,
  Alert
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../api/axios';
import { CloudinaryImage, getCloudinaryImageUrl, extractPublicIdFromUrl } from '../../../config/cloudinary.jsx';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

function AdminProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 6,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`,
    pageSizeOptions: ['6', '12', '18', '24'],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('productName');
  const [filters, setFilters] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [productDetail, setProductDetail] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isNewProductAdded, setIsNewProductAdded] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchProducts();
    }, searchTerm ? 500 : 0); // 500ms delay cho search, ngay lập tức cho các thay đổi khác

    return () => clearTimeout(delayedSearch);
  }, [pagination.current, pagination.pageSize, searchTerm, sortBy]);

  // Effect để detect khi có refresh query parameter (sau khi thêm sản phẩm)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('refresh')) {
      // Set flag để biết có sản phẩm mới
      setIsNewProductAdded(true);
      
      // Reset về trang 1 và refresh
      setPagination(prev => ({ ...prev, current: 1 }));
      
      // Force refresh danh sách
      setTimeout(() => {
        fetchProducts();
      }, 100);
      
      // Hiển thị thông báo đặc biệt với icon và style
      setTimeout(() => {
        message.success({
          content: (
            <div>
              <span style={{ fontSize: '16px', marginRight: '8px' }}>🎉</span>
              <strong>Thêm sản phẩm thành công!</strong>
              <br />
              <span style={{ fontSize: '12px', color: '#666' }}>
                Sản phẩm mới đã được hiển thị trong danh sách
              </span>
            </div>
          ),
          duration: 5,
          style: {
            marginTop: '20px'
          }
        });
      }, 1000);
      
      // Reset flag sau một thời gian
      setTimeout(() => {
        setIsNewProductAdded(false);
      }, 5000);
      
      // Xóa query parameter khỏi URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search]);

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        sortBy: sortBy,
        ascending: true
      };

      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await axiosInstance.get('/products', { params });

      setProducts(response.data.items || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.totalItems,
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Xử lý lỗi chi tiết hơn
      if (error.code === 'ECONNABORTED') {
        message.error('Yêu cầu tìm kiếm quá lâu. Vui lòng thử với từ khóa ngắn hơn.');
      } else if (error.code === 'ERR_NETWORK') {
        message.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        message.error('Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
      }
      
      // Reset products nếu có lỗi
      setProducts([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // Handle table change (pagination, sorting, filtering)
  const handleTableChange = (paginationInfo, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    }));

    if (sorter.field) {
      setSortBy(sorter.field);
    }
  };

  // Handle search với debounce
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  // Handle search input change để hiển thị loading ngay lập tức
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    if (value.length >= 2 || value.length === 0) {
      setSearchTerm(value);
      setPagination(prev => ({ ...prev, current: 1 }));
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price * 24000);
  };

  // View product detail
  const handleViewDetail = async (productId) => {
    try {
      const response = await axiosInstance.get(`/products/${productId}`);
      setProductDetail(response.data);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('Error fetching product detail:', error);
      message.error('Không thể tải chi tiết sản phẩm');
    }
  };

  // Edit product
  const handleEdit = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  // Delete product
  const handleDelete = (productId, productName) => {
    confirm({
      title: 'Xác nhận xóa sản phẩm',
      content: `Bạn có chắc chắn muốn xóa sản phẩm "${productName}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axiosInstance.delete(`/products/${productId}`);
          message.success('Xóa sản phẩm thành công');
          fetchProducts(); // Refresh list
        } catch (error) {
          message.error('Không thể xóa sản phẩm');
        }
      },
    });
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'thumbnailUrl',
      key: 'thumbnailUrl',
      width: 80,
      render: (url, record) => {
        // Tìm URL ảnh từ thumbnailUrl hoặc mediaFiles
        let imageUrl = url;
        
        // Nếu không có thumbnailUrl, lấy từ mediaFiles
        if (!imageUrl && record.mediaFiles && record.mediaFiles.length > 0) {
          const firstMedia = record.mediaFiles.find(media => 
            media.fileType === 'Image' || 
            media.mediaUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
          );
          
          if (firstMedia) {
            imageUrl = firstMedia.mediaUrl;
          }
        }
        
        // Nếu là Cloudinary URL, extract public ID và sử dụng CloudinaryImage
        if (imageUrl && imageUrl.includes('cloudinary')) {
          const publicId = extractPublicIdFromUrl(imageUrl);
          return (
            <CloudinaryImage
              publicId={publicId}
              alt={record.productName}
              width={60}
              height={60}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              fallback="/placeholder-book.svg"
            />
          );
        }
        
        // Fallback cho ảnh thường
        return (
          <Image
            width={60}
            height={60}
            src={imageUrl || '/placeholder-book.svg'}
            alt={record.productName}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback="/placeholder-book.svg"
          />
        );
      },
    },
    {
      title: 'Mã sản phẩm',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      sorter: true,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      sorter: true,
      render: (text, record) => (
        <Tooltip title={text}>
          <Button 
            type="link" 
            style={{ padding: 0, height: 'auto', textAlign: 'left' }}
            onClick={() => handleViewDetail(record.productId)}
          >
            <div style={{ 
              maxWidth: 200, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {text}
            </div>
          </Button>
        </Tooltip>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      sorter: true,
      render: (price) => (
        <span style={{ fontWeight: 600, color: '#f5222d' }}>
          {formatPrice(price)}
        </span>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 100,
      sorter: true,
      render: (stock) => {
        const color = stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red';
        return <Tag color={color}>{stock}</Tag>;
      },
    },
    {
      title: 'Đánh giá',
      dataIndex: 'averageRating',
      key: 'averageRating',
      width: 120,
      render: (rating, record) => (
        <Space direction="vertical" size={0}>
          <Rate disabled value={rating} allowHalf size="small" />
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>
            ({record.totalReviews} đánh giá)
          </span>
        </Space>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'productType',
      key: 'productType',
      width: 100,
      render: (type) => <Tag>{type}</Tag>,
    },
    {
      title: 'Danh mục',
      dataIndex: 'categories',
      key: 'categories',
      width: 150,
      render: (categories) => (
        <Space direction="vertical" size={2}>
          {categories?.slice(0, 2).map(cat => (
            <Tag key={cat.categoryId} size="small">
              {cat.categoryName}
            </Tag>
          ))}
          {categories?.length > 2 && (
            <Tag size="small">+{categories.length - 2}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record.productId)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record.productId)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.productId, record.productName)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý sản phẩm
            </Title>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/products/add')}
              >
                Thêm sản phẩm
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchProducts}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>

        {/* New Product Alert */}
        {isNewProductAdded && (
          <Alert
            message="Sản phẩm mới đã được thêm!"
            description="Sản phẩm vừa thêm đã được hiển thị trong danh sách bên dưới."
            type="success"
            showIcon
            closable
            onClose={() => setIsNewProductAdded(false)}
            style={{ 
              marginBottom: 16,
              border: '1px solid #52c41a',
              backgroundColor: '#f6ffed'
            }}
          />
        )}

        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm sản phẩm (tối thiểu 2 ký tự)..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              onChange={handleSearchInputChange}
              loading={loading && searchTerm}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="Sắp xếp theo"
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
            >
              <Option value="productName">Tên sản phẩm</Option>
              <Option value="price">Giá</Option>
              <Option value="stockQuantity">Tồn kho</Option>
              <Option value="averageRating">Đánh giá</Option>
            </Select>
          </Col>
          {selectedRowKeys.length > 0 && (
            <Col xs={24} md={12}>
              <Space>
                <span>Đã chọn {selectedRowKeys.length} sản phẩm</span>
                <Button 
                  danger 
                  size="small"
                  onClick={() => {
                    // Handle bulk delete
                    console.log('Delete selected:', selectedRowKeys);
                  }}
                >
                  Xóa đã chọn
                </Button>
              </Space>
            </Col>
          )}
        </Row>

        {/* Products Table */}
        <Table
          columns={columns}
          dataSource={products}
          rowKey="productId"
          rowSelection={rowSelection}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="middle"
        />

        {/* Product Detail Modal */}
        <Modal
          title="Chi tiết sản phẩm"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="edit" type="primary" onClick={() => {
              setDetailModalVisible(false);
              handleEdit(productDetail?.productId);
            }}>
              Chỉnh sửa
            </Button>,
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>
          ]}
          width={800}
        >
          {productDetail && (
            <div>
              {/* Hiển thị ảnh sản phẩm */}
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                {(() => {
                  const thumbnailUrl = productDetail.thumbnailUrl;
                  const mediaFiles = productDetail.mediaFiles || [];
                  
                  console.log('Rendering image for:', productDetail.productName);
                  console.log('Thumbnail URL:', thumbnailUrl);
                  console.log('Media Files:', mediaFiles);
                  
                  // Tìm URL ảnh từ thumbnailUrl hoặc mediaFiles
                  let imageUrl = thumbnailUrl;
                  
                  // Nếu không có thumbnailUrl, lấy từ mediaFiles
                  if (!imageUrl && mediaFiles.length > 0) {
                    // Tìm ảnh đầu tiên trong mediaFiles
                    const firstMedia = mediaFiles.find(media => 
                      media.fileType === 'Image' || 
                      media.mediaUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                    );
                    
                    if (firstMedia) {
                      imageUrl = firstMedia.mediaUrl;
                      console.log('Using image from mediaFiles:', imageUrl);
                    }
                  }
                  
                  console.log('Final image URL:', imageUrl);
                  console.log('Is Cloudinary URL:', imageUrl && imageUrl.includes('cloudinary'));
                  
                  // Nếu là Cloudinary URL
                  if (imageUrl && imageUrl.includes('cloudinary')) {
                    const publicId = extractPublicIdFromUrl(imageUrl);
                    console.log('Extracted Public ID:', publicId);
                    
                    return (
                      <CloudinaryImage
                        publicId={publicId}
                        alt={productDetail.productName}
                        width={200}
                        height={200}
                        style={{ 
                          objectFit: 'cover', 
                          borderRadius: 8,
                          border: '1px solid #d9d9d9'
                        }}
                        fallback="/placeholder-book.svg"
                      />
                    );
                  }
                  
                  // Sử dụng Image component thường
                  console.log('Using regular Image component');
                  return (
                    <Image
                      width={200}
                      height={200}
                      src={imageUrl || '/placeholder-book.svg'}
                      alt={productDetail.productName}
                      style={{ 
                        objectFit: 'cover', 
                        borderRadius: 8 
                      }}
                      fallback="/placeholder-book.svg"
                      onError={(e) => {
                        console.log('Image load error:', e);
                      }}
                    />
                  );
                })()}
              </div>
              
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Mã sản phẩm" span={1}>
                  {productDetail.productCode}
                </Descriptions.Item>
                <Descriptions.Item label="Tên sản phẩm" span={1}>
                  {productDetail.productName}
                </Descriptions.Item>
                <Descriptions.Item label="Giá" span={1}>
                  <span style={{ fontWeight: 600, color: '#f5222d' }}>
                    {formatPrice(productDetail.price)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Tồn kho" span={1}>
                  <Tag color={productDetail.stockQuantity > 10 ? 'green' : productDetail.stockQuantity > 0 ? 'orange' : 'red'}>
                    {productDetail.stockQuantity}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Loại sản phẩm" span={1}>
                  {productDetail.productType}
                </Descriptions.Item>
                <Descriptions.Item label="Nhà sản xuất" span={1}>
                  {productDetail.manufacturer || 'Chưa có thông tin'}
                </Descriptions.Item>
                <Descriptions.Item label="Đánh giá" span={2}>
                  <Space>
                    <Rate disabled value={productDetail.averageRating} allowHalf />
                    <span>({productDetail.totalReviews} đánh giá)</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Danh mục" span={2}>
                  <Space wrap>
                    {productDetail.productCategories?.map(pc => (
                      <Tag key={pc.category.categoryId}>
                        {pc.category.categoryName}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>
                  {productDetail.description || 'Chưa có mô tả'}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
}

export default AdminProductManagement;