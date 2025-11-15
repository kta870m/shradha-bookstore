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
      message.error('Unable to load category list');
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
        message.success('Category updated successfully!');
      } else {
        // Create new category
        await axiosInstance.post('/categories', values);
        message.success('New category added successfully!');
      }
      
      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An error occurred while saving category';
      message.error(errorMsg);
    }
  };

  // Handle delete category
  const handleDelete = async (categoryId) => {
    try {
      await axiosInstance.delete(`/categories/${categoryId}`);
      message.success('Category deleted successfully!');
      fetchCategories();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Unable to delete category';
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
      title: 'Category Name',
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
      title: 'Parent Category',
      dataIndex: 'parentCategory',
      key: 'parentCategory',
      render: (parentCategory) => (
        parentCategory ? (
          <Tag color="blue">{parentCategory.categoryName}</Tag>
        ) : (
          <Tag color="green">Root Category</Tag>
        )
      ),
    },
    {
      title: 'Subcategories Count',
      key: 'subCategoriesCount',
      render: (_, record) => (
        <Tag color="cyan">
          {record.subCategories?.length || 0} subcategories
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space className="category-actions">
          <Tooltip title="Edit">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Confirm Delete"
            description="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.categoryId)}
            okText="Delete"
            cancelText="Cancel"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Tooltip title="Delete">
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
            Category Management
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            size="large"
            className="add-category-btn"
          >
            Add New Category
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
              `${range[0]}-${range[1]} of ${total} categories`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
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
            label="Category Name"
            rules={[
              { required: true, message: 'Please enter category name!' },
              { min: 2, message: 'Category name must be at least 2 characters!' }
            ]}
          >
            <Input placeholder="Enter category name..." />
          </Form.Item>



          <Form.Item
            name="parentCategoryId"
            label="Parent Category"
          >
            <Select
              placeholder="Select parent category (optional)"
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
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCategory ? 'Update' : 'Add New'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminCategoryManagement;