import React from 'react';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { message, Upload } from 'antd';
import axios from 'axios';

const { Dragger } = Upload;

const UploadVideo: React.FC<{onUpload: () => void}> = ({ onUpload }) => {
  const props: UploadProps = {
    name: 'file',
    multiple: false,
  
    customRequest(options){
      const formData = new FormData();
      formData.append('file', options.file);
      axios.post('http://localhost:5000/upload', formData)
        .then(response => {
          console.log(response.data.file_id);
          if(onUpload){onUpload();}
          if(options.onSuccess)options.onSuccess(response.data);
        })
        .catch(error => {
          console.error('Error:',error);
        });
    },
  
    beforeUpload(file) {
      const isVideo = file.type === 'video/mp4';
      if (!isVideo) {
        message.error('You can only upload mp4 file!');
      }
      return isVideo || Upload.LIST_IGNORE;
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
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };
    return (
    <Dragger {...props}>
        <p className="ant-upload-drag-icon">
        <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
        Support for a single upload. Strictly prohibited from uploading company data or other
        banned files.
        </p>
    </Dragger>
)};

export default UploadVideo;