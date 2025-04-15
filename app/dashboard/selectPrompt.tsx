import React, { useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Button, Form, Input, Select } from 'antd';

const { Option } = Select;

const SelectPrompt: React.FC<{ onSelect: (data:any)=>void}> = ({onSelect}) => {
    const [selectedOption, setSelectedOption] = useState('');
    const handleSelectChange = (value: string) => {
        setSelectedOption(value);
    }

    const [textPrompt, setTextPrompt] = useState('');
    const handleTextPromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTextPrompt(e.target.value);
    };
  
    const [imagePrompt, setImagePrompt] = useState('');
    const handleImagePromptChange = (value:string) => {
        setImagePrompt(value);
    };

    const [relighteningBG, setRelighteningBG] = useState('');
    const [relighteningPrompt, setRelighteningPrompt] = useState('');
    const handleRelighteningBGChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRelighteningBG(e.target.value);
    }
    const handleRelighteningPromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRelighteningPrompt(e.target.value);
    };

    const handleSubmit=()=>{
        const data={
            selectedOption,
            textPrompt,
            imagePrompt,
            relighteningBG,
            relighteningPrompt
        };
        onSelect(data);
    }

    return(
    <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600, marginTop: 16, marginLeft: 'auto', marginRight: 'auto'}}
        initialValues={{ remember: true }}
        autoComplete="off"
        onFinish={handleSubmit}
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
            <Input placeholder="Enter a text prompt" onChange={handleTextPromptChange} required/>
            </Form.Item>
        )}
        {selectedOption === 'imagePrompt' &&(
            <Form.Item<String> label="Image Prompt" rules={[{required: true, message: 'Please select image prompt type!'}]}>
                <Select 
                    placeholder="Enter image prompt" 
                    onChange={handleImagePromptChange} 
                    allowClear>
                    <Option value="styleTransfer">Style Transfer</Option>
                    <Option value="virtualTryOn">Virtual Try-on</Option>
                </Select>
            </Form.Item>
        )}
        {selectedOption === 'relightening' &&(
            <Form.Item label="Relightening">
            <Input placeholder='Enter the discription of light' onChange={handleRelighteningPromptChange} required/>
            <Input placeholder='Enter the direction of light' onChange={handleRelighteningBGChange} required/>
            </Form.Item>
        )}
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" >
                Submit
            </Button>
        </Form.Item>
    </Form>
)};

export default SelectPrompt;