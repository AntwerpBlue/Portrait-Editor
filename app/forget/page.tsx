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
  const [captchaLoading, setCaptchaLoading] = React.useState(false); // 新增加载状态

  const sendVerificationCode = async (mail:string,username:string) => {
    if (!mail || !username) {
      message.error("信息不完整，请重新输入");
      return false;
    }
    try{
      setCaptchaLoading(true);
      const res= await axios.post('http://localhost:5000/send-verification-code',{
        email:mail,
        username:username,
        type:'forget'
      })
      setVerificationCode(res.data.verification_code);
      console.log(`验证码已发送到邮箱: ${mail}, 验证码: ${res.data.verification_code}`);
      message.success("验证码已发送");
      return true;
    }
    catch (err){
      message.error((err as any).response?.data?.message || "验证码发送失败");
      return false; // 发送失败返回false
    } finally {
      setCaptchaLoading(false);
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
                    await form.validateFields(['mail']);
                    const mail = form.getFieldValue('mail') as string;
                    const username = form.getFieldValue('username') as string;
                    console.log(mail);
                    const success = await sendVerificationCode(mail, username);
                    if (!success) {
                  // 如果发送失败，抛出错误阻止计时开始
                  throw new Error('验证码发送失败');
                }
                  }catch(error){////////////////////////////////FIXME: CANNOT CATCH
                    console.error('发送验证码失败:', error);
                    throw error;
                  }
                }}
                disabled={captchaLoading} // 添加加载状态禁用
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