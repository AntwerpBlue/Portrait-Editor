import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, Form, Input, Select } from 'antd';
import type { UploadFile } from 'antd';

const { Option } = Select;

type FieldType = {
  promptType?: string;
  textPrompt?: string;
  imagePrompt?: string;
  relighteningPrompt?: string;
};



const SelectPrompt: React.FC = () => {
    const [selectedOption, setSelectedOption] = useState('');
    const handleSelectChange = (value: string) => {
        setSelectedOption(value);
    }

    return(
    <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600, marginTop: 16, marginLeft: 'auto', marginRight: 'auto'}}
        initialValues={{ remember: true }}
        autoComplete="off"
    >
        <Form.Item<FieldType>
        label="Prompt Type"
        name="promptType"
        rules={[{ required: true, message: 'Please input your username!' }]}
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
            <Input placeholder="Enter a text prompt"/>
            </Form.Item>
        )}
        {selectedOption === 'imagePrompt' &&(
            <Form.Item label="Image Prompt">
                <Upload
                    action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                    /////////////////CHANGE TO REAL API!!!!!/////////////////////
                    listType="picture"
                >
                <Button type="primary" icon={<UploadOutlined />} >
                    Upload
                </Button>
                </Upload>
            </Form.Item>
        )}
        {selectedOption === 'relightening' &&(
            <Form.Item label="Relightening">
            <Input placeholder='Enter a relightening prompt'/>
            </Form.Item>
        )}


        <Form.Item label={null}>
        <Button type="primary" htmlType="submit">
            Submit
        </Button>
        </Form.Item>
    </Form>
)};

export default SelectPrompt;