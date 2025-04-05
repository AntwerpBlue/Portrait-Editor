import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  message, 
  Avatar, 
  Divider, 
  Space,
  Spin 
} from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';

interface UserData {
  id: string;
  username: string;
  email: string;
}
interface ResultProps {
  onNavigateToUpload: () => void
}

function convert2UserData(data: any): UserData {
  return {
    id: data.user_id,
    username: data.username,
    email: data.mail,
  };
}

const UserProfile: React.FC<ResultProps> = ({onNavigateToUpload}: ResultProps) => {
  const [form] = Form.useForm();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [passwordEditing, setPasswordEditing] = useState(false);

  // 获取当前用户信息
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('user');
        if (!token) {
          message.error('请先登录');
          onNavigateToUpload();
          return;
        }
        const user_info=convert2UserData(JSON.parse(token));
        setUser(user_info);
        form.setFieldsValue(user_info);
      } catch (error) {
        message.error('获取用户信息失败');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [form]);

  // 提交基本信息修改
  const handleSubmit = async (values: Partial<UserData>) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('/api/user/profile', values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...user!, ...values });
      setEditing(false);
      message.success('信息更新成功');
    } catch (error) {
      message.error('更新失败，请重试');
    }
  };

  // 修改密码
  const handlePasswordChange = async (values: {
    oldPassword: string;
    newPassword: string;
  }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/user/change-password', values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPasswordEditing(false);
      form.resetFields(['oldPassword', 'newPassword']);
      message.success('密码修改成功');
    } catch (error) {
      message.error('原密码错误或修改失败');
    }
  };

  if (loading) return <Spin tip="加载用户信息..." />;

  return (
    <Card 
      title="个人资料" 
      style={{ maxWidth: 600, margin: '0 auto' }}
      extra={
        !editing && (
          <Button type="link" onClick={() => setEditing(true)}>
            编辑资料
          </Button>
        )
      }
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Avatar 
          size={120} 
          icon={<UserOutlined />} 
          style={{ marginBottom: 12 }}
        />
        {!editing && <h3>{user?.username}</h3>}
      </div>

      {/* 基本信息表单 */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={user || {}}
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input 
            prefix={<UserOutlined />} 
            disabled={!editing}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式不正确' }
          ]}
        >
          <Input 
            prefix={<MailOutlined />} 
            disabled={!editing}
          />
        </Form.Item>

        {editing && (
          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setEditing(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        )}
      </Form>

      <Divider />

      {/* 密码修改区域 */}
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="link" 
          onClick={() => setPasswordEditing(!passwordEditing)}
          icon={<LockOutlined />}
        >
          {passwordEditing ? '取消修改密码' : '修改密码'}
        </Button>
      </div>

      {passwordEditing && (
        <Form
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="oldPassword"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password placeholder="输入当前密码" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password placeholder="输入新密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              确认修改
            </Button>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
};

export default UserProfile;