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
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 数据类型定义
interface StatsData {
  totalUsers: number;
  weeklyUploads: number;
  projectCount: number;
}

interface ProjectsProps {
  id: string;
  userId: string;
  promptType: string;
  prompt: string;
  timestamp: string;
}

function exportToCSV(data: ProjectsProps[], filename: string = 'projects.csv') {
  // 1. 提取 CSV 表头（列名）
  const headers = Object.keys(data[0]).join(',');
  
  // 2. 将数据转换为 CSV 行
  const rows = data.map(item => 
    Object.values(item)
      .map(value => `"${String(value).replace(/"/g, '""')}"`) // 处理特殊字符和引号
      .join(',')
  ).join('\n');

  // 3. 合并表头和内容
  const csvContent = `${headers}\n${rows}`;

  // 4. 创建 Blob 对象并下载
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [projects, setProjects] = useState<ProjectsProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: [] as any[],
    promptType: ''
  });

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const user=localStorage.getItem('user');
      if (!user) {
        return;
      }
      const isAdmin= JSON.parse(user).isAdmin;
      const response = await axios.post('http://localhost:5000/api/admin/stats',{isAdmin: isAdmin});
      const formattedStats: StatsData = {
        totalUsers: response.data.total_users,
        weeklyUploads: response.data.weekly_requests,
        projectCount: response.data.total_requests,
      }
      setStats(formattedStats);
    } catch (error) {
      message.error('获取统计信息失败');
    }
  };

  // 获取日志数据
  const fetchProjects = async () => {
    setLoading(true);
    const user=localStorage.getItem('user');
    if (!user) {
      return;
    }
    try {
      const params = {
        isAdmin: JSON.parse(user).isAdmin,
        start: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        end: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
        promptType: filters.promptType
      };
      const response = await axios.post('http://localhost:5000/api/admin/projects', params );
      const formattedProjects = response.data.map((item: any) => ({
        id: item.ProjectID,
        userId: item.UserID,
        promptType: item.PromptType,
        prompt: item.PromptContent,
        timestamp: dayjs(item.UploadTime).format('YYYY-MM-DD HH:mm:ss')
      }))
      setProjects(formattedProjects);
      console.log(formattedProjects);
    } catch (error) {
      message.error('获取项目失败');
    } finally {
      setLoading(false);
    }
  };

  // 导出CSV
  const handleExport = async() => {
    setExportLoading(true);
    try {
      exportToCSV(projects, 'projects.csv');
    } catch (error) {
      message.error('导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchStats();
    fetchProjects();
  }, [filters]);

  // 表格列配置
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: 'Prompt Type',
      dataIndex: 'promptType',
      key: 'promptType',
      filters: [
        { text: 'Text', value: 'textPrompt' },
        { text: 'Image', value: 'imagePrompt' },
        { text: 'Relightening', value: 'relightening' },
      ],
    },
    {
      title: 'Prompt',
      dataIndex: 'prompt',
      key: 'prompt',
    },
    {
      title: '上传时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a: ProjectsProps, b: ProjectsProps) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
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
              title="近一周上传" 
              value={stats?.weeklyUploads || 0} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="项目数量" 
              value={stats?.projectCount || 0} 
            />
          </Card>
        </Col>

      </Row>

      {/* 过滤控制区 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large">
          <RangePicker 
            onChange={(dates) => {
              setFilters({...filters, dateRange: dates? dates : []})}}
          />
          <Select
            placeholder="Prompt Type"
            style={{ width: 180 }}
            onChange={(value) => setFilters({...filters, promptType: value})}
            allowClear
          >
            <Option value="textPrompt">Text</Option>
            <Option value="imagePrompt">Image</Option>
            <Option value="relightening">Relightening</Option>
          </Select>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchProjects}
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
          dataSource={projects}
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