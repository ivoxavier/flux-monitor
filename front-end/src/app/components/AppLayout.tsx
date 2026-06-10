import { useState } from 'react';
import { Layout, Menu, Avatar, Switch, theme } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  AlertOutlined,
  UserOutlined,
  LogoutOutlined,
  BulbOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { BRAND_CONFIG } from '../../config/brand'; 
import { getLoggedUserGroup } from '../../utils/auth'; 

const { Sider, Content } = Layout;

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
  const userGroup = getLoggedUserGroup();

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    ...(userGroup !== 'monitor' 
      ? [{ key: '/manifests', icon: <FileTextOutlined />, label: 'Manifestos EDI' }] 
      : []
    ),
    { key: '/monitoring', icon: <AlertOutlined />, label: 'Monitorização' },
    ...(userGroup !== 'monitor' 
      ? [{ key: '/settings', icon: <SettingOutlined />, label: 'Configurações' }] 
      : []
    ),
  ];

  const logoutItem = [
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: token.colorError }} />, 
      label: 'Terminar Sessão',
    },
  ];

  const currentTheme = isDarkMode ? 'dark' : 'light';

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme={currentTheme}
        style={{
          background: token.colorBgContainer,
          borderRight: 'none', 
          boxShadow: isDarkMode 
            ? '0 4px 20px rgba(0, 0, 0, 0.4)' 
            : '0 8px 24px rgba(0, 0, 0, 0.05)', 
          zIndex: 10,
          position: 'relative',
          margin: '16px 0 16px 16px',
          borderRadius: `${token.borderRadiusLG}px`, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {}
        <div
          style={{
            height: 84,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 24px',
            gap: 12,
            color: isDarkMode ? token.colorText : token.colorTextHeading,
          }}
        >
          {}
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {BRAND_CONFIG.icon}
          </span>
          
          {}
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.3', overflow: 'hidden' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>
                {BRAND_CONFIG.logoText}
              </span>
              {}
              <span style={{ 
                fontSize: '12px', 
                fontWeight: 500, 
                color: token.colorTextDescription, 
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}>
                {BRAND_CONFIG.clientCompany}
              </span>
            </div>
          )}
        </div>

        {}
        <div style={{ flex: 1 }}>
          <Menu
            theme={currentTheme}
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0, background: token.colorBgContainer }}
          />
        </div>

        {}
        <div style={{ 
          paddingBottom: collapsed ? 16 : 24, 
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer 
        }}>
          
          {}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '16px 0 8px 0' : '16px 24px 8px 24px',
          }}>
            {!collapsed && (
              <span style={{ fontSize: '13px', color: token.colorTextDescription, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BulbOutlined style={{ fontSize: 14 }} /> Tema Escuro
              </span>
            )}
            <Switch
              checked={isDarkMode}
              onChange={onThemeChange}
              size={collapsed ? "small" : "default"}
              checkedChildren={collapsed ? undefined : "Dark"}
              unCheckedChildren={collapsed ? undefined : "Light"}
            />
          </div>

          {}
          {!collapsed && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              padding: '8px 24px 8px 24px' 
            }}>
              <Avatar style={{ background: token.colorPrimary }} icon={<UserOutlined />} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: token.colorText }}>Utilizador</span>
                <span style={{ fontSize: '11px', color: token.colorTextDescription, textTransform: 'uppercase' }}>
                  {userGroup}
                </span>
              </div>
            </div>
          )}

          {}
          <Menu
            theme={currentTheme}
            mode="inline"
            selectable={false}
            items={logoutItem}
            onClick={() => navigate('/')}
            style={{ borderRight: 0, background: token.colorBgContainer, marginTop: collapsed ? 8 : 0 }}
          />
        </div>
      </Sider>
      
      {}
      <Layout style={{ background: token.colorBgLayout }}>
        <Content style={{ margin: '16px 16px 16px 8px', background: 'transparent', overflow: 'initial' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}