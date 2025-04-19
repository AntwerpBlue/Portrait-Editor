import React, {useState} from 'react'
import { Button, message, Form, Input } from 'antd';



interface SubmitRequestProps{
    onEmailChange:(email:string)=>void
}

const SubmitRequest: React.FC<SubmitRequestProps> = ({onEmailChange }) => { 
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
            <Input placeholder='Please input your email' onChange={(e)=>onEmailChange(e.target.value)} />
            </Form.Item>

            <Form.Item label={null}>
            </Form.Item>
        </Form>
    )
}

export default SubmitRequest
