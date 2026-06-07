import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Switch, theme } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  AlertOutlined,
  UserOutlined,
  LogoutOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  onThemeChange: (checked: boolean) => void;
}

export default function AppLayout({ children, isDarkMode, onThemeChange }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/manifests',
      icon: <FileTextOutlined />,
      label: 'Manifestos EDI',
    },
    {
      key: '/monitoring',
      icon: <AlertOutlined />,
      label: 'Monitorização',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Utilizadores',
    },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Terminar Sessão',
      onClick: () => navigate('/'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: isDarkMode ? token.colorBgContainer : '#001529',
        }}
        theme={isDarkMode ? 'dark' : 'dark'}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 18 : 20,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'EDI' : 'EDI Monitor'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 500 }}>
            Sistema de Monitorização EDI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <BulbOutlined style={{ fontSize: 16 }} />
            <Switch
              checked={isDarkMode}
              onChange={onThemeChange}
              checkedChildren="Dark"
              unCheckedChildren="Light"
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar
                style={{ cursor: 'pointer', background: token.colorPrimary }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
