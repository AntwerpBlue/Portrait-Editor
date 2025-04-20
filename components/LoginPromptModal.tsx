import { Modal, Button } from 'antd';
import { useRouter } from 'next/navigation';

export const LoginPromptModal = ({ open, onCancel }: { open: boolean; onCancel: () => void }) => {
  const router = useRouter();

  return (
    <Modal
      title="请先登录"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="login"
          type="primary"
          onClick={() => {
            onCancel();
            router.push('/login');
          }}
        >
          前往登录
        </Button>,
      ]}
    >
      <p>您需要登录后才能执行此操作</p>
    </Modal>
  );
};