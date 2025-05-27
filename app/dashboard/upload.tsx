import React, {useState,useEffect} from 'react'
import '@ant-design/v5-patch-for-react-19';
import { Steps, message, Button, theme } from 'antd';
import axios from 'axios';
import UploadVideo from './uploadVideo'
import SelectPrompt from './selectPrompt'
import UploadImage from './uploadImage'
import SubmitRequest from './submitRequest'
import { useStorage } from '@/hooks/useStorage';

export interface Prompt{
  type:string,
  prompt:string,
  BG:string|null
}

export interface selectProp{
  selectedOption:string,
  textPrompt:string,
  relighteningPrompt:string,
  relighteningBG:string,
  imagePrompt:string
}

const UploadPage: React.FC = () => {
  const { token } = theme.useToken();
  const [videoId, setVideoId] = useState<string|null>(null)
  const [current, setCurrent] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const [imageId, setimageId] =useState<string|null>(null);
  const [promptData, setPromptData] =useState<Prompt>({type:"", prompt:"", BG:""});
  const [UserEmail, setUserEmail] = useState('');
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

  const handleData = (data: selectProp) => {
    if(data.selectedOption === "textPrompt"){
      setPromptData({type: "textPrompt", prompt: data.textPrompt, BG:null});
    }
    else if(data.selectedOption === "relightening"){
      setPromptData({type: "relightening", prompt: data.relighteningPrompt, BG:data.relighteningBG});
    }
    else if(data.selectedOption === "imagePrompt"){
      setPromptData({type: "imagePrompt", prompt: data.imagePrompt, BG:null});
    }
  }

  const handleVideoUpload = (fileId:string)=>{
    setIsUploaded(true);
    setVideoId(fileId);
  }

  const handleFileChange = (fileId: string) => {
    setimageId(fileId);
    console.log("Upload Success",fileId);
  }

  const handleDoneClick = () => {
    if (!userId) {
        message.error('Please login first');
        return;
    }
    const formData = new FormData();
    formData.append('videoId', videoId as string);
    formData.append('promptType', promptData.type);
    formData.append('promptContent', promptData.prompt);
    if (promptData.type === 'relightening' && promptData.BG) {
        formData.append('relightBG', promptData.BG);
    }
    if(!UserEmail){
      message.error('Please enter your email!');
      return;
    }
    formData.append('email', UserEmail);
    formData.append('user_id', userId);
    if (imageId) {
        formData.append('imageId', imageId as string);
    }
    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/submit`, formData)
        .then((response) => {
            message.success(response.data.message);
            cancel();
        })
        .catch((error) => {
            console.log(error.response.data.error);
            message.error(error.response.data.error);
        });
  }

  const steps = [
    {
      title: 'Upload Video',
      content: (<UploadVideo onUploadSuccess={handleVideoUpload}/>),
    },
    {
      title: 'Select Editor',
      content: (<SelectPrompt onSelect={handleData}/>),
    },
    {
      title: 'Upload Image',
      content: (<UploadImage onUploadSuccess={handleFileChange}/>)
    },
    {
      title: 'Submit',
      content: (<SubmitRequest onEmailChange={setUserEmail}/>),
    },
  ];
  
  const next = () => {
    if(current === 0 && !isUploaded){
      message.error('Please upload a video first!');
      return;
    }
    if(current === 1){
      if(!promptData.type){
        message.error('Please click the submit button first!')
        return;
      }
      if(promptData.type === "textPrompt" || promptData.type==="relightening"){
        setCurrent(current +2);
        return;
      }
      else{
        setCurrent(current + 1);
        return;
      }
    }
    if(current === 2){
      if(!imageId){
        message.error('Please upload an image!')
        return;
      }
    }
    setCurrent(current + 1);
  }

  const cancel = () => {
    setCurrent(0);
    setIsUploaded(false);
    setimageId(null);
    setVideoId(null);
    setPromptData({type:"", prompt:"", BG:""});
  };

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  const contentStyle: React.CSSProperties = {
    lineHeight: '260px',
    textAlign: 'center',
    color: token.colorTextTertiary,
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };
  return (
    <>
      <Steps
        current={current}
        items={items}
      />
      <div style={contentStyle}>{steps[current].content}</div>
      <div style={{ marginTop: 24 }}>
        {current < steps.length -1 && (
          <Button type="primary" onClick={next}>
            Next
          </Button>
        )}
        {current === steps.length -1 && (
          <Button type="primary" onClick={handleDoneClick}>
            Done
          </Button>
        )}
        {current > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={cancel}>
            Cancel
          </Button>
        )}
      </div>
    </>
  );
};
  
export default UploadPage;