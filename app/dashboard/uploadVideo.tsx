import React,{useState,useEffect} from 'react';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { message, Upload } from 'antd';
import axios from 'axios';
import { LoginPromptModal } from '../../components/LoginPromptModal';
import '@ant-design/v5-patch-for-react-19';

const { Dragger } = Upload;

interface UploadVideoProps {
  onUploadSuccess: (file_id: string) => void;
}

const UploadVideo: React.FC<UploadVideoProps> = ({ onUploadSuccess }) => {
  const [userId, setUserId] = useState<string | null>(null); // 新增状态存储用户ID

  // 在组件挂载时从localStorage获取用户信息
  useEffect(() => {
      const updateUser = () => {
        const user = localStorage.getItem('user');
        setUserId(user ? JSON.parse(user).user_id : null);
      };
  
      // 初始读取
      updateUser();
  
      // 添加全局监听
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'user') {
          updateUser();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      
      return () => window.removeEventListener('storage', handleStorageChange);
    }, []);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const props: UploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    customRequest(options){
      if(!userId){
        setShowLoginModal(true);
        return false;
      }
      const formData = new FormData();
      formData.append('file', options.file);
      formData.append('user_id', userId);
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/uploadVideo`, formData)
        .then(response => {
          console.log(response.data.file_id);
          if(onUploadSuccess){onUploadSuccess(response.data.file_id);}
          if(options.onSuccess)options.onSuccess(response.data);
        })
        .catch(error => {
          message.error(`Error: ${error.response.data.error}`);
          return false;
        });
    },
  
    beforeUpload:async (file)=>{
      if(!userId){
        setShowLoginModal(true);
        return false;
      }
      else{
        try{
          const res=await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/check-user`, { user_id: userId });
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