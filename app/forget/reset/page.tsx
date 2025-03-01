"use client"
import React from 'react';
import {
  LockOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProConfigProvider,
  ProFormText,
} from '@ant-design/pro-components';
import {useRouter} from 'next/navigation';
import axios from 'axios';
import { Form, theme, App } from 'antd';
import {parseCookies, destroyCookie} from 'nookies';
import { GetServerSidePropsContext } from 'next';

export const getServerSideProps = (context:GetServerSidePropsContext) => {
  const cookies = parseCookies(context);
  const userId = cookies.userId;
  const email = cookies.email;
  return {
    props: {
      userId,
      email,
    },
  };
};

export default function ForgetPage({userId,email}:any){
  const router=useRouter();
  const { message } = App.useApp();
  const { token } = theme.useToken();

  const handleSubmit = async (values: any) => {
    if(values.password!==values.confirm){
      message.error('两次输入的密码不一致');
      return;
    }
    else{
        axios.post('http://localhost:5000/reset-password',{
          userId:{userId},
          email:{email},
          new_password:values.password
        })
        .then(res=>{
          message.success('密码修改成功');
          destroyCookie(null, 'userId');
          destroyCookie(null, 'email');
          router.push('/login');
        })
        .catch(err=>{
          message.error('密码修改失败');
        })
    }
  }

  return (
    <ProConfigProvider hashed={false}>
      <div style={{ backgroundColor: token.colorBgContainer }}>
        <LoginForm 
          title="中科大3DV课题组"
          subTitle="重置密码"
          submitter={{
            searchConfig:{submitText: '修改密码'},
          }}
          onFinish={handleSubmit}
          >
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />,
            }}
            placeholder={'请输入密码'}
            rules={[
              {
                required: true,
                message: '请输入密码!',
              },
            ]}
          />
          <ProFormText.Password
            name="confirm"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />,
            }}
            placeholder={'确认密码'}
            rules={[
              {
                required: true,
                message: '请再次输入密码!',
              },
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
              href={'/login'}
            >
              返回登录
            </a>
          </div>
        </LoginForm>
      </div>
    </ProConfigProvider>
  );
};