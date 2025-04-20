"use client"
import React from 'react';
import { App,Form, Button} from 'antd';
import {
  LockOutlined,
  UserOutlined,
  MailOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import {useRouter} from 'next/navigation';
import {
  LoginForm,
  ProConfigProvider,
  ProFormCaptcha,
  ProFormText,
} from '@ant-design/pro-components';
import { theme } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import axios from 'axios'

interface registerProp{
  username:string,
  password:string,
  mail:string,
  captcha:string
}

export default function ForgetPage(){
  const router=useRouter();
  const { message } = App.useApp();

  const { token } = theme.useToken();
  const [form] =Form.useForm();

  const [verificationCode, setVerificationCode] = React.useState<string | null>(null);

  const sendVerificationCode = async (mail:string) => {
    if(mail){
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/send-code`,{
        email:mail,
        type:"register"
      })
      .then((res)=>{
        setVerificationCode(res.data.verification_code);
        console.log(`验证码已发送到邮箱: ${mail}, 验证码: ${res.data.verification_code}`);
        message.success("验证码已发送");
      })
      .catch((err)=>{
        console.error(err.data.error)
        message.error("发送失败");
      })
    }
  }

  const handleSubmit = async (values:registerProp) => {
    if(!values.username||!values.password||!values.mail){
      message.error("请输入完整信息")
    }
    else{
      if(values.password.length<8){
        message.error("密码长度不能小于8")
      }
      else if(verificationCode!==values.captcha){
        message.error("验证码错误")
      }
      else{
        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/register`,{
          username:values.username,
          password:values.password,
          mail:values.mail
        })
        .then((res)=>{
          message.success(res.data.message)
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
      <Button 
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/dashboard')}
          style={{
            position: 'absolute',
            left: 24,
            top: 24,
            zIndex: 1
          }}
        >
          返回主页
        </Button>
        <LoginForm 
          title="中科大3DV课题组" 
          subTitle="请输入正确的邮箱，如忘记密码将发送邮件到该邮箱" 
          submitter={{
            searchConfig:{submitText: '注册'},
          }}
          form={form}
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
                'Password is recommended to contain numbers, letters and special characters, at least 8 characters long.',
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
          <ProFormText.Password
            name="confirmPassword"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />,
            }}
            placeholder={'请确认密码'}
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: '请确认密码！',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'));
                },
              }),
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
                    await form.validateFields(['mail']);
                    const mail = form.getFieldValue('mail');
                    console.log(mail);
                    sendVerificationCode(mail);
                  }catch (error){
                    console.log(error);
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