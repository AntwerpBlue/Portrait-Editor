"use client"
import {
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProConfigProvider,
  ProFormText,
  ProFormCheckbox,
} from '@ant-design/pro-components';
import '@ant-design/v5-patch-for-react-19';
import { App, Form, theme } from 'antd';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';


export default function loginPage(){
  const { message } = App.useApp();
  const router = useRouter();
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 前端验证
      if (!values.username || !values.password) {
        message.error('请输入用户名和密码');
        return;
      }

      // 调用后端API
      const response = await axios.post('http://localhost:5000/api/login', {
        username: values.username,
        password: values.password,
      });

      // 处理登录成功
      if (response.data.success) {
        // 登录成功，跳转到主页
        router.push('/dashboard');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '登录失败';
        message.error(errorMessage);
      } 
      else {
        message.error('登录失败');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ProConfigProvider hashed={false}>
      <div style={{ backgroundColor: token.colorBgContainer }}>
        <LoginForm 
            title="中科大3DV课题组" 
            subTitle="首次登录请注册"
            submitter={{
              searchConfig: {
                submitText: '登录',
              },
              submitButtonProps: {
                loading,
              },
            }}
            onFinish={handleSubmit}
            >
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className={'prefixIcon'} />,
            }}
            placeholder={'请输入用户名'}
            rules={[
              {
                required: true,
                message: '请输入用户名!',
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />
            }}
            placeholder={'请输入密码'}
            rules={[
              {
                required: true,
                message: '请输入密码！'
              },
              {
                min: 8,
                message: '密码长度不能少于8个字符',
              }
            ]}
          />
          
          <div
            style={{
              marginBlockEnd: 24,
            }}
          >
            <a
              style={{
                float: 'right',
              }}
              href={'/forget'}
            >
              忘记密码
            </a>
            <a style={{
                float: 'right',
                paddingRight: '10px',
              }}
              href={'/register'}> 注册</a>
          </div>
        </LoginForm>
      </div>
    </ProConfigProvider>
  );
};