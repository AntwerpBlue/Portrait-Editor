import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  DatePicker,
  Select,
  Space,
  Statistic,
  Row,
  Col,
  message 
} from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 数据类型定义
interface StatsData {
  totalUsers: number;
  activeUsers: number;
  videoCount: number;
  storageUsage: string;
}

interface LogRecord {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  ipAddress: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: [] as any[],
    actionType: ''
  });

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      message.error('获取统计信息失败');
    }
  };

  // 获取日志数据
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        start: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        end: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
        action: filters.actionType
      };
      const response = await axios.get('/api/admin/logs', { params });
      setLogs(response.data);
    } catch (error) {
      message.error('获取日志失败');
    } finally {
      setLoading(false);
    }
  };

  // 导出CSV
  const handleExport = async() => {
    setExportLoading(true);
    try {
      ///////const res=await axios.post();
    } catch (error) {
      message.error('导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, [filters]);

  // 表格列配置
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      filters: [
        { text: '登录', value: 'login' },
        { text: '上传', value: 'upload' },
        { text: '删除', value: 'delete' },
      ],
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a: LogRecord, b: LogRecord) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1>数据统计</h1>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="总用户数" 
              value={stats?.totalUsers || 0} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="活跃用户" 
              value={stats?.activeUsers || 0} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="视频数量" 
              value={stats?.videoCount || 0} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="存储用量" 
              value={stats?.storageUsage || '0GB'} 
            />
          </Card>
        </Col>
      </Row>

      {/* 过滤控制区 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large">
          <RangePicker 
            //onChange={(dates) => setFilters({...filters, dateRange: dates})}
          />
          <Select
            placeholder="操作类型"
            style={{ width: 180 }}
            onChange={(value) => setFilters({...filters, actionType: value})}
            allowClear
          >
            <Option value="login">登录</Option>
            <Option value="upload">上传</Option>
            <Option value="delete">删除</Option>
          </Select>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchLogs}
          >
            刷新
          </Button>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            loading={exportLoading}
          >
            导出CSV
          </Button>
        </Space>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;