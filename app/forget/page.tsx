"use client"
import React from 'react';
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProConfigProvider,
  ProFormCaptcha,
  ProFormText,
} from '@ant-design/pro-components';
import {useRouter} from 'next/navigation';
import '@ant-design/v5-patch-for-react-19';
import axios from 'axios';
import { Form, theme, App } from 'antd';


export default function ForgetPage(){
  const [form] =Form.useForm();

  const router=useRouter();
  const { message } = App.useApp();
  const { token } = theme.useToken();

  const [verificationCode, setVerificationCode] = React.useState<string | null>(null);

  const sendVerificationCode = async (mail:string) => {
    if(mail){
      axios.post('http://localhost:5000/send-verification-code',{
        email:mail
      })
      .then((res)=>{
        setVerificationCode(res.data.verification_code);
        console.log(`验证码已发送到邮箱: ${mail}, 验证码: ${res.data.verification_code}`);
        message.success("验证码已发送");
      })
      .catch((err)=>{
        message.error("发送失败");
      })
    }
  }

  const handleSubmit = async (values: any) => {
    if(!values.username||!values.mail){
      message.error("请输入完整信息")
    }
    else{
      if(verificationCode!==values.captcha){
        message.error("验证码错误")
      }
      else{
        router.push('/forget/reset');/////FIX TO TRANSFER MESSAGE TO RESET PAGE
      }
    }
  }

  return (
    <ProConfigProvider hashed={false}>
      <div style={{ backgroundColor: token.colorBgContainer }}>
        <LoginForm 
          title="中科大3DV课题组"
          subTitle="输入用户名与邮箱以重置密码"
          submitter={{
            searchConfig:{submitText: '发送邮件'},
          }}
          form={form}
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
          <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={'prefixIcon'} />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={'请输入验证码'}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${'获取验证码'}`;
                  }
                  return '获取验证码';
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: '请输入验证码！',
                  },
                ]}
                onGetCaptcha={async () => {
                  const values = await form.validateFields();
                  const mail = values.mail;
                  console.log(mail);
                  sendVerificationCode(mail);
                }}
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