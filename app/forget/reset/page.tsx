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
import axios,{AxiosError} from 'axios';
import { Form, theme, App } from 'antd';

import '@ant-design/v5-patch-for-react-19';


export default function ForgetPage(){
  const router=useRouter();
  const { message } = App.useApp();
  const { token } = theme.useToken();

  const handleSubmit = async (values: any) => {
    if(values.password!==values.confirm){
      message.error('两次输入的密码不一致');
      return;
    }
    else{
      try{
        const res=await axios.post('http://localhost:5000/api/forget/reset',{
          new_password:values.password
        },{
          withCredentials:true
        });
        message.success('密码修改成功');
        router.push('/login');
      }
      catch(error){
        if (axios.isAxiosError(error) && error.response) {
          // 明确 error.response.data 的结构
          const errorMessage = error.response.data?.error || "未知错误";
          console.error("后端错误:", errorMessage);
          alert(`错误: ${errorMessage}`);
        } else {
          // 其他类型的错误（如网络错误）
          console.error("请求失败:", error instanceof Error ? error.message : "未知错误");
          alert("网络请求失败");
        }
      }
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