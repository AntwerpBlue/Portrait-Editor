import React,{useState} from 'react';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { message, Upload } from 'antd';
import axios from 'axios';
import { LoginPromptModal } from '../../components/LoginPromptModal';

const { Dragger } = Upload;

interface UploadVideoProps {
  onUploadSuccess: (file_id: string) => void;
}

const UploadVideo: React.FC<UploadVideoProps> = ({ onUploadSuccess }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const props: UploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    customRequest(options){
      const formData = new FormData();
      formData.append('file', options.file);
      axios.post('http://localhost:5000/uploadVideo', formData)
        .then(response => {
          console.log(response.data.file_id);
          if(onUploadSuccess){onUploadSuccess(response.data.file_id);}
          if(options.onSuccess)options.onSuccess(response.data);
        })
        .catch(error => {
          console.error('Error:',error);
        });
    },
  
    beforeUpload:async (file)=>{
      const token=localStorage.getItem('user');
      if(!token){
        setShowLoginModal(true);
        return false;
      }
      else{
        const user = JSON.parse(token).user_id;
        try{
          const res=await axios.post('http://localhost:5000/check-user', { user_id: user });
          if(res.data.processing>=3){
            message.error('You can create 3 projects at most at a time!');
            return false;
          }
        }
        catch(err){
          console.log(err);
        }
      }
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
      <>
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
    <LoginPromptModal
            open={showLoginModal}
            onCancel={() => setShowLoginModal(false)}
          />  
      </>
)};

export default UploadVideo;