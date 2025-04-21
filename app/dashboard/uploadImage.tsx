import React,{useEffect, useState} from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload,message } from 'antd';
import axios from 'axios'
import type { UploadProps } from 'antd/lib/upload/interface';

interface UploadImageProps {
  onUploadSuccess: (file_id:string)=>void;
}

const UploadImage: React.FC<UploadImageProps> = ({onUploadSuccess}) => {
  const [userId, setUserId] = useState<string | null>(null); // 新增状态存储用户ID

  // 在组件挂载时从localStorage获取用户信息
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) {
        setUserId(JSON.parse(user).user_id);
      }
    }
  }, []);
  const props: UploadProps = {
    name: 'file',
    multiple: false,
  
    customRequest(options){
      if(!userId){
        message.error('Please login first');
        return;
      }
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('file', options.file);
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/uploadImage`, formData)
        .then(response => {
          console.log(response.data.file_id);
          if(onUploadSuccess){onUploadSuccess(response.data.file_id);}
          if(options.onSuccess)options.onSuccess(response.data);
        })
        .catch(error => {
          console.error('Error:',error);
        });
    },
  
    beforeUpload(file) {
      const isImage = file.type === 'image/png';
      if (!isImage) {
        message.error('You can only upload png image!');
      }
      return isImage || Upload.LIST_IGNORE;
    },
  
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };
  return(
  <Upload {...props}>
    <Button type="primary" icon={<UploadOutlined />}>
      Upload
    </Button>
  </Upload>
  )
};

export default UploadImage;