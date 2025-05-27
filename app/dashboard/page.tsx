"use client"
import Image from 'next/image'
import logo from '../../public/logo.png'

import { useState, useEffect } from 'react'

import UploadPage from './upload'
import ContactPage from './contact'
import ResultPage from './result'
import AdminDashboard from './adminDashboard'
import { useRouter } from 'next/navigation';

import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  LogoutOutlined,
  LoginOutlined,
  MessageOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, Space, Typography, Avatar, MenuProps } from 'antd';
import { LoginPromptModal } from '../../components/LoginPromptModal';

const { Header, Content, Sider } = Layout;

interface User{
  username:string,
  email:string,
}

const Welcome = ({ user }: { user: User | null }) => {
  const router = useRouter();
  
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    router.push('/login');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return user ? (
    <Space style={{ paddingRight: 24 }}>
      <Avatar size="small" icon={<UserOutlined />} />
      <Typography.Text>欢迎，{user?.username || '用户'}</Typography.Text>
      <Button
        type="text"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
      >
        退出登录
      </Button>
    </Space>
  ) : (
    <Space style={{ paddingRight: 24 }}>
      <Avatar size="small" icon={<UserOutlined />} />
      <Typography.Text>欢迎，请登录</Typography.Text>
      <Button
        type="text"
        icon={<LoginOutlined />}
        onClick={handleLogin}
      >
        登录
      </Button>
    </Space>
  )
}

const Home: React.FC = () => {
  const [selectedMenu, setSelectedMenu] = useState('1');
  const [user, setUser] = useState<null | User>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [menuItems, setMenuItems] = useState([
    {
      key: '1',
      icon: <UploadOutlined />,
      label: 'Upload',
    },
    {
      key: '2',
      icon: <VideoCameraOutlined />,
      label: 'Result',
    },
    {
      key: '3',
      icon: <MessageOutlined />,
      label: 'Contact Us',
    }
  ]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    // 立即读取当前用户状态
    const updateUserState = () => {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        const currentUser = userData ? JSON.parse(userData) : null;
        setUser(currentUser);

        // 更新菜单项（检查是否为管理员）
        setMenuItems(prev => {
          const baseItems = [...prev.slice(0, 3)]; // 保持前3个基础菜单
          if (currentUser?.isAdmin === 1 && !prev.some(item => item.key === '4')) {
            return [
              ...baseItems,
              {
                key: '4',
                icon: <SearchOutlined />,
                label: 'View Data',
              }
            ];
          }
          return baseItems;
        });
      }
    };

    // 初始读取
    updateUserState();

    // 添加全局storage事件监听
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        updateUserState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleMenuClick: MenuProps['onClick'] = (key) => {
    if (key.key === '2' && !user) {
      setShowLoginModal(true);
    }
    setSelectedMenu(key.key);
  }

  return (
    <Layout style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
      <Sider>
        <div className="demo-logo-vertical" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '48px',
        }}>
          <Image src={logo} alt="logo" style={{ maxWidth: '90%', maxHeight: '80%' }} />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, paddingLeft: 24, display: 'flex', justifyContent: 'space-between' }}>
          <Welcome user={user} />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {selectedMenu === '1' && <UploadPage />}
          {selectedMenu === '2' && <ResultPage onNavigateToUpload={() => { setSelectedMenu('1'); }} />}
          {selectedMenu === '3' && <ContactPage />}
          {selectedMenu === '4' && <AdminDashboard />}
        </Content>
      </Layout>
      <LoginPromptModal
        open={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
      />
    </Layout>
  );
}

export default Home;