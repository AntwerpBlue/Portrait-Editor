import type { ActionType } from '@ant-design/pro-components';
import { ProList } from '@ant-design/pro-components';
import { Badge, Button, Image, message, Popconfirm, Tag } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

interface VideoProject {
  id: string;
  name: string;
  thumbnail: string; // 视频缩略图URL
  status: 'processing' | 'completed' | 'failed';
  submitTime: string;
  completeTime: string | null;
  videoUrl: string | null;
}

const ResultPage: React.FC = () => {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [loading, setLoading] = useState(false);
  const action = useRef<ActionType>(null);

  // 从后端API获取用户视频项目数据
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/get-projects');
        setProjects(response.data);
      } catch (error) {
        message.error('获取项目列表失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  // 处理重命名
  const handleRename = async (id: string, newName: string) => {
    try {
      await axios.patch(`/api/video-projects/${id}`, { name: newName });
      setProjects(projects.map(p => p.id === id ? {...p, name: newName} : p));
      message.success('重命名成功');
    } catch (error) {
      message.error('重命名失败');
    }
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/video-projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  return (
    <ProList<VideoProject>
      rowKey="id"
      actionRef={action}
      dataSource={projects}
      loading={loading}
      pagination={{
        pageSize: 10,
      }}
      metas={{
        title: {
          dataIndex: 'name',
          //editable: true,
          render: (text, record) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>{text}</span>
              {record.status === 'processing' && (
                <Tag color="blue" style={{ marginLeft: 8 }}>处理中</Tag>
              )}
              {record.status === 'failed' && (
                <Tag color="red" style={{ marginLeft: 8 }}>失败</Tag>
              )}
            </div>
          ),
        },
        avatar: {
          dataIndex: 'thumbnail',
          render: (text) => (
            <Image
              //src={text}
              width={80}
              height={60}
              style={{ borderRadius: 4 }}
              alt="视频缩略图"
              placeholder={
                <div style={{
                  width: 80,
                  height: 60,
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span>预览</span>
                </div>
              }
            />
          ),
        },
        description: {
          render: (_, record) => (
            <div>
              <div>提交时间: {dayjs(record.submitTime).format('YYYY-MM-DD HH:mm')}</div>
              {record.completeTime ? (
                <div>完成时间: {dayjs(record.completeTime).format('YYYY-MM-DD HH:mm')}</div>
              ) : (
                <div>状态: 处理中</div>
              )}
            </div>
          ),
        },
        actions: {
          render: (text, record) => [
            <Button 
              key="view" 
              type="link"
              onClick={() => {
                if (record.videoUrl) {
                  window.open(record.videoUrl, '_blank');
                } else {
                  message.info('视频尚未处理完成');
                }
              }}
            >
              查看
            </Button>,
            <Button 
              key="rename" 
              type="link"
              onClick={() => {
                action.current?.startEditable(record.id);
              }}
            >
              重命名
            </Button>,
            <Popconfirm
              key="delete"
              title="确定要删除这个项目吗?"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger>删除</Button>
            </Popconfirm>,
          ],
        },
      }}
      editable={{
        onSave: async (key, record, originRow) => {
          await handleRename(record.id, record.name);
          return true;
        },
      }}
      toolbar={{
        search: {
          placeholder: '搜索项目名称',
          onSearch: (value: string) => {
            // 实现搜索功能
            console.log('搜索:', value);
          },
        },
        actions: [
          <Button type="primary" key="primary" onClick={() => {
            // 跳转到新建项目页面
            window.location.href = '/video-editor/new';
          }}>
            新建项目
          </Button>,
        ],
      }}
    />
  );
};

export default ResultPage;