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
import { setCookie } from 'nookies';

export default function ForgetPage(){
  const [form] =Form.useForm();

  const router=useRouter();
  const { message } = App.useApp();
  const { token } = theme.useToken();

  const [verificationCode, setVerificationCode] = React.useState<string | null>(null);

  const sendVerificationCode = async (mail:string,username:string) => {
    if(mail&&username){
      axios.post('http://localhost:5000/send-verification-code',{
        email:mail,
        username:username
      })
      .then((res)=>{
        setVerificationCode(res.data.verification_code);
        console.log(`验证码已发送到邮箱: ${mail}, 验证码: ${res.data.verification_code}`);
        message.success("验证码已发送");
      })
      .catch((err)=>{
        message.error(err.response.data.error);
      })
    }
    else{
      message.error("信息不完整，请重新输入");
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
        setCookie(
          null, 'username', values.username, {
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
          }
        );
        setCookie(
          null, 'mail', values.mail, {
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
          }
        )
        router.push('/forget/reset');
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
                  try{
                    const values = await form.validateFields();
                    const mail = values.mail;
                    const username = values.username;
                    console.log(mail);
                    await sendVerificationCode(mail,username);
                  }catch(error){////////////////////////////////FIXME: CANNOT CATCH
                    console.error('发送验证码失败:', error);
                    throw error;
                  }
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