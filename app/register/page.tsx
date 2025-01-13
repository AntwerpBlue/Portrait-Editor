"use client"
import React from 'react';
import { App } from 'antd';
import {
  LockOutlined,
  UserOutlined,
  MailOutlined
} from '@ant-design/icons';
import {useRouter} from 'next/navigation';
import {
  LoginForm,
  ProConfigProvider,
  ProFormText,
} from '@ant-design/pro-components';
import { theme } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import axios from 'axios'

export default function ForgetPage(){
  const router=useRouter();
  const { message } = App.useApp();

  const { token } = theme.useToken();

  const handleSubmit = async (values:any) => {
    if(!values.username||!values.password||!values.mail){
      message.error("请输入完整信息")
    }
    else{
      if(values.password.length<8){
        message.error("密码长度不能小于8")
      }
      else{
        axios.post("http://localhost:5000/register",{
          username:values.username,
          password:values.password,
          mail:values.mail
        })
        .then((res)=>{
          message.success("注册成功")
          router.push('/login');
        })
        .catch((err)=>{
          if(err.response){
            message.error(err.response.data.error);
          }
          else{
            message.error("注册失败");
          }
        });
      }
    }
  }

  return (
    <ProConfigProvider hashed={false}>
      <div style={{ backgroundColor: token.colorBgContainer }}>
        <LoginForm 
          title="中科大3DV课题组" 
          subTitle="请输入正确的邮箱，如忘记密码将发送邮件到该邮箱" 
          submitter={{
            searchConfig:{submitText: '注册'},
          }}
          onFinish={handleSubmit}>
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
              prefix: <LockOutlined className={'prefixIcon'} />,
              strengthText:
                'Password should contain numbers, letters and special characters, at least 8 characters long.',
              statusRender: (value) => {
                const getStatus = () => {
                  if (value && value.length > 12) {
                    return 'ok';
                  }
                  if (value && value.length > 6) {
                    return 'pass';
                  }
                  return 'poor';
                };
                const status = getStatus();
                if (status === 'pass') {
                  return (
                    <div style={{ color: token.colorWarning }}>
                      强度：中
                    </div>
                  );
                }
                if (status === 'ok') {
                  return (
                    <div style={{ color: token.colorSuccess }}>
                      强度：强
                    </div>
                  );
                }
                return (
                  <div style={{ color: token.colorError }}>强度：弱</div>
                );
              },
            }}
            placeholder={'请输入密码'}
            rules={[
              {
                required: true,
                message: '请输入密码！',
              },
            ]}
          />
          <ProFormText 
            name="mail" 
            fieldProps={{
              size: 'large',
              prefix: <MailOutlined className={'prefixIcon'} />,
            }}
            placeholder={'请输入邮箱'}
            rules={[
              {
                required: true,
                message: '请输入邮箱!',
              }
            ]}
          />
          <div
            style={{
              marginBlockEnd: 24,
            }}
          >
          </div>
        </LoginForm>
      </div>
    </ProConfigProvider>
  );
};