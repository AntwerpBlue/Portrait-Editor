"use client";
import Image from 'next/image'
import logo from '../public/logo.png'

import { useState, FormEvent } from 'react'

import UploadPage from '../pages/upload'
import ContactPage from '../pages/contact'
import ResultPage from '../pages/result'

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, Typography, Steps } from 'antd';

const { Header, Content, Footer, Sider } = Layout;

const App: React.FC =()=>{
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('1');

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const handleMenuClick = (key: any) =>{
    setSelectedMenu(key.key);
  }

  return (
    <Layout style={{display: 'flex', flexDirection: 'row', height: '100vh'}}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical">
          <Image src={logo} alt="logo" style={{maxWidth: '100%', maxHeight: '100%'}} />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
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
              icon: <UserOutlined />,
              label: 'Contact Us',
            },
          ]}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
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
          {selectedMenu === '2' && <ResultPage />}
          {selectedMenu === '3' && <ContactPage/>}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;