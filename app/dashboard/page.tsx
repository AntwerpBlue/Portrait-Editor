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
    // 只在客户端执行
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // 如果是管理员，添加管理菜单
        if (parsedUser.isAdmin === 1) {
          setMenuItems(prev => [
            ...prev,
            {
              key: '4',
              icon: <SearchOutlined />,
              label: 'View Data',
            }
          ]);
        }
      }
    }
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
        <div className="demo-logo-vertical">
          <Image src={logo} alt="logo" style={{ maxWidth: '100%', maxHeight: '100%' }} />
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