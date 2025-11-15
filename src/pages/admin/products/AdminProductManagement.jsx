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
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../api/axios';
import { CloudinaryImage, getCloudinaryImageUrl, extractPublicIdFromUrl } from '../../../config/cloudinary.jsx';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

function AdminProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 6,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`,
    pageSizeOptions: ['6', '12', '18', '24'],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('productName');
  const [filters, setFilters] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [productDetail, setProductDetail] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isNewProductAdded, setIsNewProductAdded] = useState(false);
  const [isProductUpdated, setIsProductUpdated] = useState(false);
  const [deletingProductIds, setDeletingProductIds] = useState(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchProducts();
    }, searchTerm ? 500 : 0); // 500ms delay for search, immediate for other changes

    return () => clearTimeout(delayedSearch);
  }, [pagination.current, pagination.pageSize, searchTerm, sortBy]);

  // Effect to detect refresh query parameter (after adding/updating product)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const refreshParam = urlParams.get('refresh');
    const actionParam = urlParams.get('action');
    
    if (refreshParam) {
      // Distinguish action: new = add new, update = update
      if (actionParam === 'update') {
        setIsProductUpdated(true);
      } else {
        // Default is add new
        setIsNewProductAdded(true);
      }

      // Reset to page 1 and refresh
      setPagination(prev => ({ ...prev, current: 1 }));

      // Force refresh list
      setTimeout(() => {
        fetchProducts();
      }, 100);

      // Display notification based on action
      setTimeout(() => {
        if (actionParam === 'update') {
          message.success({
            content: (
              <div>
                <strong>Product updated successfully!</strong>
                <br />
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Changes have been saved and displayed in the list
                </span>
              </div>
            ),
            duration: 5,
            style: {
              marginTop: '20px'
            }
          });
        } else {
          message.success({
            content: (
              <div>
                <strong>Product added successfully!</strong>
                <br />
                <span style={{ fontSize: '12px', color: '#666' }}>
                  New product has been displayed in the list
                </span>
              </div>
            ),
            duration: 5,
            style: {
              marginTop: '20px'
            }
          });
        }
      }, 1000);

      // Reset flag sau một thời gian
      setTimeout(() => {
        setIsNewProductAdded(false);
        setIsProductUpdated(false);
      }, 5000);

      // Remove query parameter from URL
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

      // Handle errors in more detail
      if (error.code === 'ECONNABORTED') {
        message.error('Search request took too long. Please try with shorter keywords.');
      } else if (error.code === 'ERR_NETWORK') {
        message.error('Unable to connect to server. Please check your network connection.');
      } else {
        message.error('Unable to load product list. Please try again.');
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

  // Handle search with debounce
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  // Handle search input change to show loading immediately
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
      message.error('Unable to load product details');
    }
  };

  // Edit product
  const handleEdit = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  // Delete product với Modal confirmation
  const handleDelete = (productId, productName) => {
    console.log('Preparing to delete product:', productId, productName);
    Modal.confirm({
      title: 'Confirm Product Deletion',
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            Are you sure you want to delete product <strong>"{productName}"</strong>?
          </p>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: 0 }}>
            <em>The product will be marked as deleted and will not be displayed in the customer list. 
            You can restore it later if needed.</em>
          </p>
        </div>
      ),
      okText: 'Delete Product',
      okType: 'danger',
      cancelText: 'Cancel',
      width: 500,
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      onOk: async () => {
        // Thêm productId vào set đang xóa
        setDeletingProductIds(prev => new Set(prev).add(productId));
        
        try {
          console.log('Calling delete API for product:', productId);
          const deleteResponse = await axiosInstance.delete(`/products/${productId}`);
          console.log('Delete response:', deleteResponse);
          
          message.success({
            content: (
              <div>
                <span style={{ fontSize: '16px', marginRight: '8px' }}>✅</span>
                <strong>Product deleted successfully!</strong>
                <br />
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Product "{productName}" has been removed from the list
                </span>
              </div>
            ),
            duration: 4
          });

          // Refresh list after delete
          console.log('Refreshing product list after delete...');
          await fetchProducts();
          console.log('Product list refreshed successfully');
        } catch (error) {
          console.error('Error deleting product:', error);
          message.error({
            content: `Unable to delete product "${productName}". Please try again.`,
            duration: 5
          });
          throw error; // Re-throw để Modal.confirm có thể handle
        } finally {
          // Xóa productId khỏi set đang xóa
          setDeletingProductIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        }
      },
    });
  };

  // Bulk delete products
  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one product to delete');
      return;
    }

    const selectedProducts = products.filter(product =>
      selectedRowKeys.includes(product.productId)
    );

    Modal.confirm({
      title: `Confirm deletion of ${selectedRowKeys.length} products`,
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            Bạn có chắc chắn muốn xóa <strong>{selectedRowKeys.length} sản phẩm</strong> đã chọn?
          </p>
          <div style={{ maxHeight: 120, overflow: 'auto', marginBottom: 8 }}>
            {selectedProducts.slice(0, 5).map(product => (
              <p key={product.productId} style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                • {product.productName} ({product.productCode})
              </p>
            ))}
            {selectedProducts.length > 5 && (
              <p style={{ margin: '4px 0', fontSize: '13px', color: '#999' }}>
                ... và {selectedProducts.length - 5} sản phẩm khác
              </p>
            )}
          </div>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: 0 }}>
            <em>Các sản phẩm sẽ được đánh dấu là đã xóa và không hiển thị trong danh sách khách hàng.</em>
          </p>
        </div>
      ),
      okText: `Xóa ${selectedRowKeys.length} sản phẩm`,
      okType: 'danger',
      cancelText: 'Hủy bỏ',
      width: 550,
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      onOk: async () => {
        setIsBulkDeleting(true);

        try {
          console.log('Calling bulk delete API for products:', selectedRowKeys);
          // Xóa từng sản phẩm (có thể tối ưu với API batch sau)
          const deletePromises = selectedRowKeys.map(productId =>
            axiosInstance.delete(`/products/${productId}`)
          );

          await Promise.all(deletePromises);

          message.success({
            content: (
              <div>
                <span style={{ fontSize: '16px', marginRight: '8px' }}>✅</span>
                <strong>Deleted successfully!</strong>
                <br />
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Deleted {selectedRowKeys.length} products from the list
                </span>
              </div>
            ),
            duration: 4
          });

          setSelectedRowKeys([]); // Clear selection
          console.log('Refreshing product list after bulk delete...');
          await fetchProducts(); // Refresh list
          console.log('Product list refreshed successfully after bulk delete');
        } catch (error) {
          console.error('Error bulk deleting products:', error);
          message.error({
            content: `An error occurred while deleting products. Please try again.`,
            duration: 5
          });
          throw error; // Re-throw để Modal.confirm có thể handle
        } finally {
          setIsBulkDeleting(false);
        }
      },
    });
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Image',
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
      title: 'Product Code',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      sorter: true,
    },
    {
      title: 'Product Name',
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
      title: 'Price',
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
      title: 'Stock',
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
      title: 'Rating',
      dataIndex: 'averageRating',
      key: 'averageRating',
      width: 120,
      render: (rating, record) => (
        <Space direction="vertical" size={0}>
          <Rate disabled value={rating} allowHalf size="small" />
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>
            ({record.totalReviews} reviews)
          </span>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'productType',
      key: 'productType',
      width: 100,
      render: (type) => <Tag>{type}</Tag>,
    },
    {
      title: 'Category',
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
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record.productId)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record.productId)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deletingProductIds.has(record.productId)}
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
              Product Management
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/products/add')}
              >
                Add Product
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchProducts}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>

        {/* New Product Alert */}
        {isNewProductAdded && (
          <Alert
            message="New product has been added!"
            description="The newly added product is displayed in the list below."
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

        {/* Product Update Alert */}
        {isProductUpdated && (
          <Alert
            message="Product updated successfully!"
            description="Changes have been saved and displayed in the list."
            type="success"
            showIcon
            closable
            onClose={() => setIsProductUpdated(false)}
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
              placeholder="Search products (minimum 2 characters)..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              onChange={handleSearchInputChange}
              loading={loading && searchTerm}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="Sort by"
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
            >
              <Option value="productName">Product Name</Option>
              <Option value="price">Price</Option>
              <Option value="stockQuantity">Stock</Option>
              <Option value="averageRating">Rating</Option>
            </Select>
          </Col>
          {selectedRowKeys.length > 0 && (
            <Col xs={24} md={12}>
              <Space>
                <span>Selected {selectedRowKeys.length} products</span>
                <Button
                  danger
                  size="small"
                  loading={isBulkDeleting}
                  onClick={handleBulkDelete}
                  icon={<DeleteOutlined />}
                >
                  Delete Selected ({selectedRowKeys.length})
                </Button>
                <Button
                  size="small"
                  onClick={() => setSelectedRowKeys([])}
                >
                  Deselect
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
          title="Product Details"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="edit" type="primary" onClick={() => {
              setDetailModalVisible(false);
              handleEdit(productDetail?.productId);
            }}>
              Edit
            </Button>,
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Close
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
                <Descriptions.Item label="Product Code" span={1}>
                  {productDetail.productCode}
                </Descriptions.Item>
                <Descriptions.Item label="Product Name" span={1}>
                  {productDetail.productName}
                </Descriptions.Item>
                <Descriptions.Item label="Price" span={1}>
                  <span style={{ fontWeight: 600, color: '#f5222d' }}>
                    {formatPrice(productDetail.price)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Stock" span={1}>
                  <Tag color={productDetail.stockQuantity > 10 ? 'green' : productDetail.stockQuantity > 0 ? 'orange' : 'red'}>
                    {productDetail.stockQuantity}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Product Type" span={1}>
                  {productDetail.productType}
                </Descriptions.Item>
                <Descriptions.Item label="Manufacturer" span={1}>
                  {productDetail.manufacturer || 'No information available'}
                </Descriptions.Item>
                <Descriptions.Item label="Rating" span={2}>
                  <Space>
                    <Rate disabled value={productDetail.averageRating} allowHalf />
                    <span>({productDetail.totalReviews} reviews)</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Categories" span={2}>
                  <Space wrap>
                    {productDetail.productCategories?.map(pc => (
                      <Tag key={pc.category.categoryId}>
                        {pc.category.categoryName}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>
                  {productDetail.description || 'No description available'}
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