import { Form, Input, Button, Card, Typography, theme, Space, message } from 'antd';
import { UserOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BRAND_CONFIG } from '../../config/brand';
import { getTranslation } from '../../config/i18n';

const { Text, Link } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);


  const t = getTranslation().login;
  const tGlobal = getTranslation(); 

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || t.errorLogin);
      }

      const data = await response.json();

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('userGroup', data.userGroup);

      message.success(`${t.welcome}, ${data.username}!`);
      navigate('/dashboard');
    } catch (error: any) {
      const errorMsg = error.message === 'Failed to fetch' ? t.errorServer : error.message;
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: token.colorBgLayout,
        padding: 24,
      }}
    >
      <Card
        style={{
          width: 420,
          background: token.colorBgContainer,
          boxShadow: token.boxShadowSecondary,
          borderRadius: token.borderRadiusLG * 1.5,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
        bodyStyle={{ padding: '40px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Space direction="vertical" size="small" style={{ marginBottom: 12 }}>
            <div style={{ 
              display: 'inline-flex', 
              padding: 12, 
              background: token.colorFillAlter, 
              borderRadius: token.borderRadiusLG 
            }}>
              {BRAND_CONFIG.icon}
            </div>
          </Space>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ 
              fontSize: '24px', 
              fontWeight: 800, 
              letterSpacing: '-0.5px',
              color: token.colorTextHeading 
            }}>
              {BRAND_CONFIG.logoText}
            </span>
          </div>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
          autoComplete="off"
        >
          {}
          <Form.Item
            label={<Text strong style={{ fontSize: '13px' }}>{t.userLabel}</Text>}
            name="username"
            rules={[{ required: true, message: t.userRequired }]}
            style={{ marginBottom: 20 }}
          >
            <Input
              prefix={<UserOutlined style={{ color: token.colorTextDescription }} />}
              placeholder="ex: admin"
              size="large"
              style={{ borderRadius: token.borderRadiusSM }}
              disabled={loading}
            />
          </Form.Item>

          {}
          <Form.Item
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Text strong style={{ fontSize: '13px' }}>{t.passwordLabel}</Text>
                <Link style={{ fontSize: '12px', fontWeight: 500 }}>{t.forgotPassword}</Link>
              </div>
            }
            name="password"
            rules={[{ required: true, message: t.passwordRequired }]}
            style={{ marginBottom: 28 }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: token.colorTextDescription }} />}
              placeholder="••••••••"
              size="large"
              style={{ borderRadius: token.borderRadiusSM }}
              disabled={loading}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block
              icon={<ArrowRightOutlined />}
              loading={loading}
              style={{ 
                height: 44, 
                borderRadius: token.borderRadiusSM,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)'
              }}
            >
              {t.submitButton}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}