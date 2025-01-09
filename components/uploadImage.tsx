import React from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';
import type { UploadFile } from 'antd';


const handleUpload = async (options: any) => {
    
}

const UploadImage: React.FC = () => (
  <Upload
    customRequest={handleUpload}
    listType="picture"
  >
    <Button type="primary" icon={<UploadOutlined />}>
      Upload
    </Button>
  </Upload>
);

export default UploadImage;