import React from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload,message } from 'antd';
import axios from 'axios'
import type { UploadProps } from 'antd/lib/upload/interface';

interface UploadImageProps {
  onUploadSuccess: (file_id:string)=>void;
}

const UploadImage: React.FC<UploadImageProps> = ({onUploadSuccess}) => {
  const props: UploadProps = {
    name: 'file',
    multiple: false,
  
    customRequest(options){
      const formData = new FormData();
      formData.append('file', options.file);
      axios.post('http://localhost:5000/uploadImage', formData)
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