import type { ActionType } from '@ant-design/pro-components';
import { ProList } from '@ant-design/pro-components';
import { Button, Image, message, Popconfirm, Tag } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

interface VideoProject {
  id: string;
  name: string;
  thumbnail: string; // 视频缩略图URL
  status: 'processing' | 'completed' | 'failed' | 'waiting';
  submitTime: string;
  completeTime: string | null;
  videoUrl: string | null;
  prompt: string| null;
}

interface ResultProp{
  ProjectID: string,
  UserID: string,
  UploadTime:string,
  CompleteTime:string,
  Status:string,
  Name:string,
  ThumbNail:string,
  Result:string|null,
  PromptType:string,
  PromptContent:string,
  RelightBG:string|null
}

function getPrompt(data:ResultProp):string{
  const type=data.PromptType;
  if(type==="textPrompt"){
    return "TextPrompt: "+data.PromptContent;
  }
  else if(type==="imagePrompt"){
    return "ImagePrompt: "+data.PromptContent;
  }
  else if(type==="relightening"){
    return "Relightening: "+data.PromptContent+"-from "+data.RelightBG;
  }
  return "";
}

function convertToVideoProject(data: ResultProp): VideoProject {
  return {
    id: data.ProjectID,
    name: data.Name,
    thumbnail: data.ThumbNail,
    status: data.Status as 'processing' | 'completed' | 'failed' | 'waiting',
    submitTime: data.UploadTime,
    completeTime: data.CompleteTime,
    videoUrl: data.Result,
    prompt: getPrompt(data)
  };
}

interface ResultProps {
  onNavigateToUpload: () => void
}

const ResultPage: React.FC<ResultProps> = ({onNavigateToUpload}: ResultProps) => {
  const [messageApi, contextHolder] = message.useMessage(); // 新增这行
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [changeFlag, setchangeFlage] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<VideoProject[]>([]); // 新增：存储过滤后的数据
  const action = useRef<ActionType>(null);

  // 从后端API获取用户视频项目数据
  useEffect(() => {
    const user= JSON.parse(localStorage.getItem('user')||'{}');
    const fetchProjects = async () => {
      setLoading(true);
      try {
        console.log(user.user_id);
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/get-projects`,{
          user_id: user.user_id
        });
        setProjects(response.data.map(convertToVideoProject));
        setFilteredProjects(response.data.map(convertToVideoProject));
      } catch (error) {
        console.error('获取项目列表失败: ',error)
        messageApi.error(`获取项目列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [changeFlag]);

  const handleSearch = (value: string) => {
    if (!value.trim()) {
      setFilteredProjects(projects); // 如果搜索词为空，显示全部数据
      return;
    }
    const filtered = projects.filter((project) =>
      project.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProjects(filtered);
  };

  // 处理重命名
  const handleRename = async (id: string, newName: string) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/rename-project`,{
        project_id: id,
        new_name: newName
      });
      setProjects(projects.map(p => p.id === id ? {...p, name: newName} : p));
      setchangeFlage(!changeFlag);
      messageApi.success('重命名成功');
    } catch (error) {
      messageApi.error(`重命名失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/delete-project`,{
        project_id: id,
      });
      setProjects(projects.filter(p => p.id !== id));
      setchangeFlage(!changeFlag);
      messageApi.success('删除成功');
    } catch (error) {
      messageApi.error(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  return (
    <>
      {contextHolder}
    <ProList<VideoProject>
      rowKey="id"
      actionRef={action}
      dataSource={filteredProjects}
      loading={loading}
      pagination={{
        pageSize: 5,
      }}
      metas={{
        title: {
          dataIndex: 'name',
          editable:  (record) => {
            // 只有特定状态的项目可编辑
            return record.status !== 'failed';
          },
          render: (text, record) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>{text}</span>
              {record.status === 'processing' && (
                <Tag color="blue" style={{ marginLeft: 8 }}>处理中</Tag>
              )}
              {record.status === 'failed' && (
                <Tag color="red" style={{ marginLeft: 8 }}>失败</Tag>
              )}
              {record.status === 'waiting' && (
                <Tag color="orange" style={{ marginLeft: 8 }}>等待中</Tag>
              )}
              {record.status === 'completed' && (
                <Tag color="green" style={{ marginLeft: 8 }}>已完成</Tag>
              )}
            </div>
          ),
        },
        avatar: {
          dataIndex: 'thumbnail',
          editable: false,
          render: () => (
            <Image
              src={"https://img1.ali213.net/glpic/2019/08/02/584_20190802115314395.jpg"}//////TODO: change to real thumbnail
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
              <div>提交时间: {dayjs(record.submitTime+'+08:00').format('YYYY-MM-DD HH:mm:ss')}</div>
              {record.completeTime ? (
                <div>完成时间: {dayjs(record.completeTime+'+08:00').format('YYYY-MM-DD HH:mm:ss')}</div>
              ) : (
                <div>状态: 处理中</div>
              )}
              <div>{record.prompt}</div>
            </div>
          ),
        },
        actions: {
          render: (text, record) => [
            <Button 
              key="view" 
              type="link"
              onClick={() => {
                console.log("按钮被点击");
                if (record.videoUrl) {
                  const url=`${process.env.NEXT_PUBLIC_API_URL}/api/videos/`+record.videoUrl+".mp4"
                  window.open(url, '_blank');
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
        onSave: async (key, record) => {
          await handleRename(record.id, record.name);
          return true;
        },
      }}
      toolbar={{
        search: {
          placeholder: '搜索项目名称',
          onSearch: (value: string) => {
            handleSearch(value);
            console.log('搜索:', value);
          },
        },
        actions: [
          <Button type="primary" key="primary" onClick={onNavigateToUpload}>
            新建项目
          </Button>,
        ],
      }}
    >
  </ProList>
  </>
  );
};

export default ResultPage;