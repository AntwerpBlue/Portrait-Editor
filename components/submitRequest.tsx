import React, {useState} from 'react'
import type { FormProps } from 'antd';
import { Button, message, Form, Input } from 'antd';

const SubmitRequest: React.FC = () => {
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
            <Input />
            </Form.Item>

            <Form.Item label={null}>
            <Button type="primary" htmlType="submit" onClick={()=>{message.success('Thanks for your request!')}}>
                Submit
            </Button>
            </Form.Item>
        </Form>
    )
}

export default SubmitRequest
