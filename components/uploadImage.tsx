import React from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';
import type { UploadFile } from 'antd';

interface UploadImageProps {
  onFileChange: (file:UploadFile)=>void;
}

const UploadImage: React.FC<UploadImageProps> = ({onFileChange}) => {
  const handleUpload=async ({file,onSuccess}: any) => {
    setTimeout(()=>{
      onSuccess('ok');
      onFileChange(file);
    },10000);
  };
  return(
  <Upload
    customRequest={handleUpload}
    listType="picture"
  >
    <Button type="primary" icon={<UploadOutlined />}>
      Upload
    </Button>
  </Upload>
  )
};

export default UploadImage;