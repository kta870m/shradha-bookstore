import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  FolderOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';
import axiosInstance from '../../../api/axios';
import '../../../styles/AdminCategoryManagement.css';

const { Title } = Typography;
const { Option } = Select;

function AdminCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/categories');
      setCategories(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách danh mục');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle create/update category
  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        // Update category
        await axiosInstance.put(`/categories/${editingCategory.categoryId}`, values);
        message.success('Cập nhật danh mục thành công!');
      } else {
        // Create new category
        await axiosInstance.post('/categories', values);
        message.success('Thêm danh mục mới thành công!');
      }
      
      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục';
      message.error(errorMsg);
    }
  };

  // Handle delete category
  const handleDelete = async (categoryId) => {
    try {
      await axiosInstance.delete(`/categories/${categoryId}`);
      message.success('Xóa danh mục thành công!');
      fetchCategories();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Không thể xóa danh mục';
      message.error(errorMsg);
    }
  };

  // Open modal for create/edit
  const openModal = (category = null) => {
    setEditingCategory(category);
    setModalVisible(true);
    
    if (category) {
      form.setFieldsValue({
        categoryName: category.categoryName,
        parentCategoryId: category.parentCategoryId
      });
    } else {
      form.resetFields();
    }
  };

  // Get parent categories for select dropdown
  const getParentCategories = () => {
    return categories.filter(cat => !cat.parentCategoryId);
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 80,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (text, record) => (
        <Space>
          {record.parentCategoryId ? (
            <FolderOutlined style={{ color: '#1890ff' }} />
          ) : (
            <FolderOpenOutlined style={{ color: '#52c41a' }} />
          )}
          <strong>{text}</strong>
        </Space>
      ),
    },

    {
      title: 'Danh mục cha',
      dataIndex: 'parentCategory',
      key: 'parentCategory',
      render: (parentCategory) => (
        parentCategory ? (
          <Tag color="blue">{parentCategory.categoryName}</Tag>
        ) : (
          <Tag color="green">Danh mục gốc</Tag>
        )
      ),
    },
    {
      title: 'Số danh mục con',
      key: 'subCategoriesCount',
      render: (_, record) => (
        <Tag color="cyan">
          {record.subCategories?.length || 0} danh mục con
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space className="category-actions">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDelete(record.categoryId)}
            okText="Xóa"
            cancelText="Hủy"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Tooltip title="Xóa">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="category-management-container">
      <Card className="category-card">
        <div className="category-header">
          <Title level={2} className="category-title">
            Quản lý danh mục sản phẩm
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            size="large"
            className="add-category-btn"
          >
            Thêm danh mục mới
          </Button>
        </div>

        <Table
          className="category-table"
          columns={columns}
          dataSource={categories}
          rowKey="categoryId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} danh mục`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="categoryName"
            label="Tên danh mục"
            rules={[
              { required: true, message: 'Vui lòng nhập tên danh mục!' },
              { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự!' }
            ]}
          >
            <Input placeholder="Nhập tên danh mục..." />
          </Form.Item>



          <Form.Item
            name="parentCategoryId"
            label="Danh mục cha"
          >
            <Select
              placeholder="Chọn danh mục cha (tùy chọn)"
              allowClear
            >
              {getParentCategories().map(category => (
                <Option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => {
                  setModalVisible(false);
                  setEditingCategory(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminCategoryManagement;