import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, Form, Input, Select } from 'antd';
import {UploadFile} from 'antd';
import axios from 'axios'

const { Option } = Select;


const SelectPrompt: React.FC = () => {
    const [selectedOption, setSelectedOption] = useState('');
    const handleSelectChange = (value: string) => {
        setSelectedOption(value);
    }

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('type', selectedOption);
        if (selectedOption === 'textPrompt') {
            formData.append('data', textPrompt);
        } else if (selectedOption === 'imagePrompt') {
            const imagePromptData=localStorage.getItem('imagePrompt');
            if(imagePromptData){
                const blob = new Blob([imagePromptData], { type: 'image/png' });
                formData.append('data', blob);
            } else {
                console.log('imagePromptData is null');
            }
        } else if (selectedOption === 'relightening') {
            formData.append('data', relighteningPrompt);
        }

        try {
            const response = await axios.post('http://localhost:5000/prompt',formData);
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const [textPrompt, setTextPrompt] = useState('');
    const handleTextPromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTextPrompt(e.target.value);
    };
  
    const [imagePrompt, setImagePrompt] = useState<UploadFile[]>([]);
    const handleImagePromptChange = (info: any) => {
      setImagePrompt(info.fileList);
      const reader = new FileReader();
      reader.onload = (e) => {
          const fileContent = e.target?.result;
          localStorage.setItem('imagePrompt', fileContent as string);
      };
      reader.readAsDataURL(info.fileList[0]);
    };
  
    const [relighteningPrompt, setRelighteningPrompt] = useState('');
    const handleRelighteningPromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setRelighteningPrompt(e.target.value);
    };


    return(
    <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600, marginTop: 16, marginLeft: 'auto', marginRight: 'auto'}}
        initialValues={{ remember: true }}
        autoComplete="off"
    >
        <Form.Item<string>
        label="Prompt Type"
        name="promptType"
        rules={[{ required: true, message: 'Please select prompt type!' }]}
        >
        <Select
            placeholder="Select a prompt type"
            onChange={handleSelectChange}
            allowClear
            >
            <Option value="textPrompt">Text Prompt</Option>
            <Option value="imagePrompt">Image Prompt</Option>
            <Option value="relightening">Relightening</Option>
            </Select>
        </Form.Item>
        {selectedOption === 'textPrompt' &&(
            <Form.Item label="Text Prompt">
            <Input placeholder="Enter a text prompt" onChange={handleTextPromptChange}/>
            </Form.Item>
        )}
        {selectedOption === 'imagePrompt' &&(
            <Form.Item label="Image Prompt">
                <Upload
                    fileList={imagePrompt}
                    listType="picture"
                    onChange={handleImagePromptChange}
                >
                <Button type="primary" icon={<UploadOutlined />} >
                    Upload
                </Button>
                </Upload>
            </Form.Item>
        )}
        {selectedOption === 'relightening' &&(
            <Form.Item label="Relightening">
            <Input placeholder='Enter a relightening prompt' onChange={handleRelighteningPromptChange}/>
            </Form.Item>
        )}
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" onClick={handleSubmit}>
                Submit
            </Button>
        </Form.Item>
    </Form>
)};

export default SelectPrompt;