import React from 'react';
import {App} from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <body>
      <App>
      <AntdRegistry>{children}</AntdRegistry></App>
    </body>
  </html>
);

export default RootLayout;