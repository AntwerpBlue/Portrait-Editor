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
  const [autoLoginChecked, setAutoLoginChecked] = useState(false); // 默认不勾选自动登录

  const clearAuthStorage = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 前端验证
      if (!values.username || !values.password) {
        message.error('请输入用户名和密码');
        return;
      }

      // 调用后端API
      const response = await axios.post('http://localhost:5000/login', {
        username: values.username,
        password: values.password,
        autoLogin: values.autoLogin,
      });

      if (response.data.success) {
        message.success('登录成功');
        if (values.autoLogin) {
          // 自动登录使用localStorage
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('refreshToken', response.data.refreshToken); // 存储刷新token
        } else {
          // 非自动登录使用sessionStorage
          sessionStorage.setItem('authToken', response.data.token);
        }
        
        // 存储用户基本信息
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // 检查是否有重定向URL
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect');
        router.push(redirectUrl || '/');
      } else {
        message.error(response.data.message || '登录失败');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '登录失败';
        message.error(errorMessage);
        
        // 特定错误处理
        if (error.response?.status === 401) {
          clearAuthStorage();
        }
      } 
      else {
        message.error('登录失败');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAutoLogin = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          setLoading(true);
          // 使用refresh token获取新的access token
          const response = await axios.post('http://localhost:5000/refresh-token', {
            refreshToken
          });
          
          if (response.data.success) {
            localStorage.setItem('authToken', response.data.token);
            const redirectUrl = new URLSearchParams(window.location.search).get('redirect');
            router.push(redirectUrl || '/');
          }
        } catch (error) {
          clearAuthStorage();
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkAutoLogin();
  }, [router]);

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
            <ProFormCheckbox 
              noStyle 
              name="autoLogin"
              initialValue={autoLoginChecked}
              fieldProps={{
                onChange: (e) => setAutoLoginChecked(e.target.checked),
              }
              }
            >
              自动登录
            </ProFormCheckbox>
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