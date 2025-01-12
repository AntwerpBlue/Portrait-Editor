import React, {useState} from 'react'
import { Button, message, Form, Input } from 'antd';
import type { Prompt } from '../pages/upload';
import axios from 'axios';

interface SubmitRequestProps{
    videoId:string|null,
    imageId:string|null,
    prompt:Prompt
}

const SubmitRequest: React.FC<SubmitRequestProps> = ({ videoId, imageId, prompt }) => { 
    const [email, setEmail] = useState('')

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append('videoId', videoId as string);
        formData.append('promptType', prompt.type);
        formData.append('promptContent', prompt.prompt);
        formData.append('email', email);
        if (imageId) {
            formData.append('imageId', imageId as string);
        }
        axios.post('http://localhost:5000/submit', formData)
            .then((response) => {
                message.success('Submit successfully!');
            })
            .catch((error) => {
                message.error('error', error.message);
            });
    }

    return(
        <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600, marginTop: 16, marginLeft: 'auto', marginRight: 'auto' }}
            initialValues={{ remember: true }}
            autoComplete="off"
        >
            <span style={{marginBottom: 16, fontSize: 16}}>The editing result will be sent to you through email.</span>
            <Form.Item
            label="email"
            name="email"
            rules={[{ required: true, message: 'Please input your email' }]}
            >
            <Input placeholder='Please input your email' onChange={handleEmailChange}/>
            </Form.Item>

            <Form.Item label={null}>
            <Button type="primary" htmlType="submit" onClick={handleSubmit}>
                Submit
            </Button>
            </Form.Item>
        </Form>
    )
}

export default SubmitRequest
