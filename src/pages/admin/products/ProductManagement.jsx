import React, { useState, useEffect } from 'react';
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
  Pagination,
  message,
  Image,
  Tooltip,
  Modal
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axios';
import '../../styles/ProductManagement.css';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('productName');
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [pagination.current, pagination.pageSize, searchTerm, sortBy, sortOrder]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/products', {
        params: {
          page: pagination.current,
          pageSize: pagination.pageSize,
          search: searchTerm || undefined,
          sortBy: sortBy,
          ascending: sortOrder === 'asc'
        }
      });

      setProducts(response.data.items || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.totalItems,
        totalPages: response.data.totalPages
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Update product
        await window.$axios.put(`/products/${editingProduct.productId}`, formData);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        // Create new product
        await window.$axios.post('/products', formData);
        alert('Thêm sản phẩm thành công!');
      }
      
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Có lỗi xảy ra khi lưu sản phẩm');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      description: product.description || '',
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId,
      isbn: product.isbn || '',
      author: product.author || '',
      publisher: product.publisher || '',
      publishedDate: product.publishedDate || '',
      pageCount: product.pageCount || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
      await window.$axios.delete(`/products/${productId}`);
      alert('Xóa sản phẩm thành công!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      description: '',
      price: '',
      stockQuantity: '',
      categoryId: '',
      isbn: '',
      author: '',
      publisher: '',
      publishedDate: '',
      pageCount: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    resetForm();
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="product-management">
      <div className="page-header">
        <h1>Quản lý Sản phẩm</h1>
        <button 
          className="btn-add"
          onClick={() => {
            setShowForm(true);
            setEditingProduct(null);
            resetForm();
          }}
        >
          ➕ Thêm sản phẩm mới
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Giá *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Số lượng *</label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Category ID *</label>
                <input
                  type="number"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>ISBN</label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Tác giả</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Nhà xuất bản</label>
                <input
                  type="text"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Ngày xuất bản</label>
                <input
                  type="date"
                  name="publishedDate"
                  value={formData.publishedDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Số trang</label>
                <input
                  type="number"
                  name="pageCount"
                  value={formData.pageCount}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">
                💾 {editingProduct ? 'Cập nhật' : 'Thêm mới'}
              </button>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                ❌ Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Mã SP</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Tác giả</th>
              <th>Nhà XB</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.productId}>
                <td>{product.productCode}</td>
                <td>{product.productName}</td>
                <td>{product.price.toLocaleString('vi-VN')} ₫</td>
                <td>{product.stockQuantity}</td>
                <td>{product.author || '-'}</td>
                <td>{product.publisher || '-'}</td>
                <td className="actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(product)}
                  >
                    ✏️ Sửa
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(product.productId)}
                  >
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="empty-state">
            <p>Chưa có sản phẩm nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductManagement;
