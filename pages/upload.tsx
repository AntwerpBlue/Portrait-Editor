import React, {useState} from 'react'
import '@ant-design/v5-patch-for-react-19';
import { Steps, message, Button, theme } from 'antd';

import UploadVideo from '../components/uploadVideo'
import SelectPrompt from '../components/selectPrompt'
import UploadImage from '../components/uploadImage'
import SubmitRequest from '../components/submitRequest'

const UploadPage: React.FC = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const [videoData, setVideoData] =useState(null);
  const [promptData, setPromptData] =useState<{type:string, prompt:string}>({type:"", prompt:""});

  const handleData = (data: any) => {
    if(data.selectedOption === "textPrompt"){
      setPromptData({type: "textPrompt", prompt: data.textPrompt});
    }
    else if(data.selectedOption === "relightening"){
      setPromptData({type: "relightening", prompt: data.relighteningPrompt});
    }
    else if(data.selectedOption === "imagePrompt"){
      setPromptData({type: "imagePrompt", prompt: data.imagePrompt});
    }
  }

  const steps = [
    {
      title: 'Upload Video',
      content: (<UploadVideo onUpload={() => setIsUploaded(true)}/>),
    },
    {
      title: 'Select Editor',
      content: (<SelectPrompt onSelect={handleData}/>),
    },
    {
      title: 'Upload Image',
      content: (<UploadImage />)
    },
    {
      title: 'Submit',
      content: (<SubmitRequest/>),
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
      if(!videoData){
        message.error('Please upload an image!')
        return;
      }
    }
    setCurrent(current + 1);
  }

  const cancel = () => {
    setCurrent(current - 1);//////change to cancel all the inputs
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
          <Button type="primary" onClick={() => message.success('Processing complete!')}>
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