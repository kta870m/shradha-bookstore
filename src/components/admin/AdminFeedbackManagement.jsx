import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Modal,
  Form,
  message,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
  Typography,
  Popconfirm,
  Rate,
  DatePicker,
  Descriptions,
  Tooltip
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  MessageOutlined,
  UserOutlined,
  CalendarOutlined,
  StarOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { getFeedbacksForAdmin, updateFeedback, deleteFeedback, getFeedbackStatistics } from '../../api/admin/feedbackApi';
import { customerApi } from '../../api/admin/customerApi';
import '../../styles/AdminFeedbackManagement.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const AdminFeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [statistics, setStatistics] = useState({});

  // Modal states
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isResponseModalVisible, setIsResponseModalVisible] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [form] = Form.useForm();
  const [responseForm] = Form.useForm();

  useEffect(() => {
    fetchFeedbacks();
    fetchCustomers();
    fetchStatistics();
  }, [currentPage, pageSize, searchText, selectedUserId, selectedPriority, selectedStatus, sortBy]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await getFeedbacksForAdmin({
        page: currentPage,
        pageSize,
        search: searchText,
        userId: selectedUserId,
        priority: selectedPriority,
        status: selectedStatus,
        sortBy
      });
      
      if (response.success) {
        setFeedbacks(response.data);
        setTotalFeedbacks(response.totalItems);
        setStatistics(response.statistics);
      }
    } catch (error) {
      message.error('Unable to load feedback list');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerApi.getCustomers({ pageSize: 1000 });
      if (response.success) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await getFeedbackStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleEdit = (record) => {
    setCurrentFeedback(record);
    form.setFieldsValue({
      subject: record.subject,
      message: record.message,
      priority: record.priority,
      status: record.status,
      rating: record.rating
    });
    setIsEditModalVisible(true);
  };

  const handleView = (record) => {
    setCurrentFeedback(record);
    setIsViewModalVisible(true);
  };

  const handleResponse = (record) => {
    setCurrentFeedback(record);
    responseForm.setFieldsValue({
      adminResponse: record.adminResponse || ''
    });
    setIsResponseModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const response = await updateFeedback(currentFeedback.feedbackId, values);
      
      if (response.success) {
        message.success('Feedback updated successfully');
        setIsEditModalVisible(false);
        fetchFeedbacks();
      }
    } catch (error) {
      message.error('Unable to update feedback');
    }
  };

  const handleUpdateResponse = async () => {
    try {
      const values = await responseForm.validateFields();
      const updateData = {
        ...values,
        status: 'Resolved'
      };
      
      const response = await updateFeedback(currentFeedback.feedbackId, updateData);
      
      if (response.success) {
        message.success('Response sent successfully');
        setIsResponseModalVisible(false);
        fetchFeedbacks();
      }
    } catch (error) {
      message.error('Unable to send response');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteFeedback(id);
      if (response.success) {
        message.success('Feedback deleted successfully');
        fetchFeedbacks();
      }
    } catch (error) {
      message.error('Unable to delete feedback');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'orange',
      'In Progress': 'blue',
      'Resolved': 'green',
      'Closed': 'default'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'green',
      'Medium': 'orange',
      'High': 'red'
    };
    return colors[priority] || 'default';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'feedbackId',
      key: 'feedbackId',
      width: 80,
      sorter: true
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div>
          <div><UserOutlined /> {record.userName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.userEmail}</div>
        </div>
      )
    },
    {
      title: 'Title',
      dataIndex: 'subject',
      key: 'subject',
      width: 250,
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{priority}</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      )
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      render: (rating) => rating ? <Rate disabled value={rating} style={{ fontSize: '14px' }} /> : '-'
    },
    {
      title: 'Created Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 150,
      render: (date) => (
        <div>
          <CalendarOutlined /> {moment(date).format('DD/MM/YYYY HH:mm')}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="Respond">
            <Button 
              icon={<MessageOutlined />} 
              size="small" 
              type="primary"
              onClick={() => handleResponse(record)}
              disabled={record.status === 'Resolved'}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this feedback?"
              onConfirm={() => handleDelete(record.feedbackId)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="admin-feedback-management">
      <div className="page-header">
        <Title level={2}>
          <MessageOutlined /> Customer Feedback Management
        </Title>
      </div>

      {/* Filters */}
      <Card className="filters-card">
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Search
              placeholder="Search by title, content, customer name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={fetchFeedbacks}
              enterButton
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder="Customer"
              value={selectedUserId}
              onChange={setSelectedUserId}
              allowClear
              style={{ width: '100%' }}
            >
              {customers.map(customer => (
                <Option key={customer.id} value={customer.id}>
                  {customer.fullName}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={3}>
            <Select
              placeholder="Priority"
              value={selectedPriority}
              onChange={setSelectedPriority}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="Low">Low</Option>
              <Option value="Medium">Medium</Option>
              <Option value="High">High</Option>
            </Select>
          </Col>
          <Col xs={24} md={3}>
            <Select
              placeholder="Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="Pending">Pending</Option>
              <Option value="In Progress">In Progress</Option>
              <Option value="Resolved">Resolved</Option>
              <Option value="Closed">Closed</Option>
            </Select>
          </Col>
          <Col xs={24} md={3}>
            <Select
              placeholder="Sort by"
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
            >
              <Option value="submittedAt">Created Date</Option>
              <Option value="subject">Subject</Option>
              <Option value="status">Status</Option>
              <Option value="priority">Priority</Option>
              <Option value="rating">Rating</Option>
              <Option value="user">Customer</Option>
            </Select>
          </Col>
          <Col xs={24} md={3}>
            <Button icon={<ReloadOutlined />} onClick={fetchFeedbacks}>
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Feedback Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={feedbacks}
          rowKey="feedbackId"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalFeedbacks,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} feedback`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Edit Feedback"
        open={isEditModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsEditModalVisible(false)}
        width={600}
        okText="Update"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please enter subject' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please enter message' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="priority" label="Priority">
                <Select>
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Status">
                <Select>
                  <Option value="Pending">Pending</Option>
                  <Option value="In Progress">In Progress</Option>
                  <Option value="Resolved">Resolved</Option>
                  <Option value="Closed">Closed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="rating" label="Rating">
                <Rate />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="Feedback Details"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {currentFeedback && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID" span={1}>
              {currentFeedback.feedbackId}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng" span={1}>
              <div>
                <div>{currentFeedback.userName}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {currentFeedback.userEmail}
                </div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Tiêu đề" span={2}>
              {currentFeedback.subject}
            </Descriptions.Item>
            <Descriptions.Item label="Nội dung" span={2}>
              {currentFeedback.message}
            </Descriptions.Item>
            <Descriptions.Item label="Ưu tiên">
              <Tag color={getPriorityColor(currentFeedback.priority)}>
                {currentFeedback.priority}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(currentFeedback.status)}>
                {currentFeedback.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Đánh giá">
              {currentFeedback.rating ? (
                <Rate disabled value={currentFeedback.rating} />
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {moment(currentFeedback.createdDate).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            {currentFeedback.adminResponse && (
              <>
                <Descriptions.Item label="Admin Response" span={2}>
                  {currentFeedback.adminResponse}
                </Descriptions.Item>
                <Descriptions.Item label="Response Date" span={2}>
                  {moment(currentFeedback.responseDate).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Response Modal */}
      <Modal
        title="Respond to Customer"
        open={isResponseModalVisible}
        onOk={handleUpdateResponse}
        onCancel={() => setIsResponseModalVisible(false)}
        width={600}
        okText="Send Response"
        cancelText="Cancel"
      >
        {currentFeedback && (
          <>
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
              <Text strong>Customer Feedback:</Text>
              <div style={{ marginTop: 8 }}>
                <Text>{currentFeedback.subject}</Text>
              </div>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary">{currentFeedback.message}</Text>
              </div>
            </div>
            <Form form={responseForm} layout="vertical">
              <Form.Item
                name="adminResponse"
                label="Your Response"
                rules={[{ required: true, message: 'Please enter your response' }]}
              >
                <TextArea rows={6} placeholder="Enter your response to the customer..." />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AdminFeedbackManagement;