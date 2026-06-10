import { Form, Input, Button, Card, Typography, theme, Space } from 'antd';
import { UserOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { BRAND_CONFIG } from '../../config/brand'; // Importa a tua marca central

const { Title, Text, Link } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const onFinish = (values: any) => {
    console.log('Login:', values);
    
    // Simulação: Guarda o grupo 'admin' por defeito ao entrar. 
    // Podes alterar para 'monitor' ou 'edi-developer' para testar os bloqueios de rotas.
    localStorage.setItem('userGroup', 'admin'); 
    
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: token.colorBgLayout, // Fundo off-white idêntico ao painel principal
        padding: 24,
      }}
    >
      <Card
        style={{
          width: 420,
          background: token.colorBgContainer,
          // Sistema de elevação premium e cantos arredondados consistentes
          boxShadow: token.boxShadowSecondary,
          borderRadius: token.borderRadiusLG * 1.5, // Cantos ligeiramente mais suaves para o login
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
        bodyStyle={{ padding: '40px 32px' }}
      >
        {/* Cabeçalho da Marca Integrado */}
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
            <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500 }}>
              {BRAND_CONFIG.clientCompany}
            </Text>
          </div>
        </div>

        {/* Formulário de Login */}
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
          autoComplete="off"
        >
          <Form.Item
            label={<Text strong style={{ fontSize: '13px' }}>Utilizador ou Email</Text>}
            name="username"
            rules={[{ required: true, message: 'Insira o seu utilizador!' }]}
            style={{ marginBottom: 20 }}
          >
            <Input
              prefix={<UserOutlined style={{ color: token.colorTextDescription }} />}
              placeholder="ex: admin"
              size="large"
              style={{ borderRadius: token.borderRadiusSM }}
            />
          </Form.Item>

          <Form.Item
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Text strong style={{ fontSize: '13px' }}>Password</Text>
                <Link style={{ fontSize: '12px', fontWeight: 500 }}>Esqueceu-se?</Link>
              </div>
            }
            name="password"
            rules={[{ required: true, message: 'Insira a sua password!' }]}
            style={{ marginBottom: 28 }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: token.colorTextDescription }} />}
              placeholder="••••••••"
              size="large"
              style={{ borderRadius: token.borderRadiusSM }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block
              icon={<ArrowRightOutlined />}
              style={{ 
                height: 44, 
                borderRadius: token.borderRadiusSM,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)'
              }}
            >
              Entrar na Plataforma
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}