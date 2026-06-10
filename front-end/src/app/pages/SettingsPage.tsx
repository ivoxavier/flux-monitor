// src/pages/SettingsPage.tsx
import { useState } from 'react';
import { Card, Tabs, Form, Switch, InputNumber, Button, Space, Typography, message, theme, Modal, Descriptions, Badge, Timeline, Input } from 'antd';
import { SettingOutlined, UserOutlined, SaveOutlined, InfoCircleOutlined, CloudDownloadOutlined, GithubOutlined, GlobalOutlined, ShopOutlined, AlertOutlined } from '@ant-design/icons';
import UsersPage from './UsersPage';
import { BRAND_CONFIG } from '../../config/brand'; 

const { Title, Text, Paragraph } = Typography;

export default function SettingsPage() {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  // Estado local para monitorizar o switch mestre de ações em tempo real (para efeitos de desativar os sub-items)
  const [actionsEnabled, setActionsEnabled] = useState(true);

  const cardElevationStyle = {
    boxShadow: token.boxShadowSecondary,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  const handleSaveSettings = (values: any) => {
    console.log('Todas as configurações gravadas:', values);
    message.success('Configurações gravadas com sucesso!');
  };

  const handleValuesChange = (changedValues: any) => {
    // Se o switch mestre mudar, atualiza o estado para controlar a interface
    if (changedValues.enableGlobalErrorActions !== undefined) {
      setActionsEnabled(changedValues.enableGlobalErrorActions);
    }
  };

  const handleCheckUpdates = () => {
    setCheckingUpdate(true);
    message.loading({ content: 'A verificar se existem novas versões...', key: 'updatable' });
    
    setTimeout(() => {
      setCheckingUpdate(false);
      message.success({ content: 'Nova atualização encontrada! (v2.1.0)', key: 'updatable', duration: 2 });
      setIsModalOpen(true);
    }, 1500);
  };

  const tabItems = [
    {
      key: 'flux-monitor',
      label: (
        <span>
          <SettingOutlined />
          Configurações Flux-Monitor
        </span>
      ),
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveSettings}
          onValuesChange={handleValuesChange}
          initialValues={{
            cleanLogs: true,
            logsRetentionDays: 30,
            cleanManifests: false,
            manifestsRetentionDays: 90,
            clientCompany: BRAND_CONFIG.clientCompany, 
            // Valores iniciais para a nova secção de tratamento de erros
            enableGlobalErrorActions: true,
            sendEmailOnFailure: true,
            triggerWebhookOnFailure: false,
          }}
          style={{ maxWidth: 500, marginTop: 16 }}
        >
          {/* BLOCO: Identidade e Customização */}
          <Title level={5} style={{ marginBottom: 16 }}>Identidade Visual (White-Label)</Title>
          <Card size="small" style={{ marginBottom: 24, background: token.colorFillAlter }}>
            <Form.Item
              name="clientCompany"
              label="Nome da Empresa / Cliente"
              rules={[{ required: true, message: 'Por favor insira o nome da empresa!' }]}
            >
              <Input 
                prefix={<ShopOutlined style={{ color: token.colorTextDescription }} />} 
                placeholder="Ex: Nome do Cliente S.A." 
              />
            </Form.Item>
          </Card>

          {/* NOVO BLOCO: Políticas Globais de Erro do Flux-Monitor */}
          <Title level={5} style={{ marginBottom: 16 }}>
            <Space><AlertOutlined style={{ color: token.colorWarning }} /> Ações Globais em Caso de Erro</Space>
          </Title>
          <Card size="small" style={{ marginBottom: 24, background: token.colorFillAlter }}>
            <Form.Item
              name="enableGlobalErrorActions"
              label="Executar Ações Automáticas de Erro (Geral)"
              valuePropName="checked"
              extra="Se desativado, o FluxMonitor não irá disparar nenhuma ação externa (emails, webhooks) para NENHUM fluxo que falhe."
            >
              <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" danger />
            </Form.Item>

            {/* Sub-ações dependentes do switch mestre */}
            <div style={{ 
              opacity: actionsEnabled ? 1 : 0.5, 
              transition: 'opacity 0.3s', 
              borderTop: `1px solid ${token.colorBorderSecondary}`, 
              paddingTop: '16px',
              marginTop: '8px'
            }}>
              <Form.Item
                name="sendEmailOnFailure"
                label="Enviar Notificação por Email"
                valuePropName="checked"
              >
                <Switch checkedChildren="Sim" unCheckedChildren="Não" disabled={!actionsEnabled} />
              </Form.Item>

              <Form.Item
                name="triggerWebhookOnFailure"
                label="Disparar Webhooks / Alertas de Integração"
                valuePropName="checked"
                style={{ marginBottom: 8 }}
              >
                <Switch checkedChildren="Sim" unCheckedChildren="Não" disabled={!actionsEnabled} />
              </Form.Item>
            </div>
          </Card>

          {/* Bloqueio de Manutenção e Jobs */}
          <Title level={5} style={{ marginBottom: 16 }}>Jobs de Housekeeping</Title>
          
          <Card size="small" style={{ marginBottom: 16, background: token.colorFillAlter }}>
            <Form.Item
              name="cleanLogs"
              label="Limpeza Automática de Logs"
              valuePropName="checked"
            >
              <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
            </Form.Item>
            <Form.Item
              name="logsRetentionDays"
              label="Tempo de Retenção de Logs (Dias)"
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Card>

          <Card size="small" style={{ marginBottom: 24, background: token.colorFillAlter }}>
            <Form.Item
              name="cleanManifests"
              label="Limpeza de Histórico de Manifestos"
              valuePropName="checked"
            >
              <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
            </Form.Item>
            <Form.Item
              name="manifestsRetentionDays"
              label="Tempo de Retenção de Manifestos (Dias)"
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Card>

          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
              Gravar Definições
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          Gestão de Utilizadores
        </span>
      ),
      children: (
        <div style={{ marginTop: 16 }}>
          <UsersPage />
        </div>
      ),
    },
    {
      key: 'about',
      label: (
        <span>
          <InfoCircleOutlined />
          Acerca
        </span>
      ),
      children: (
        <div style={{ marginTop: 16, maxWidth: 800 }}>
          <Title level={4} style={{ marginBottom: 16 }}>Sobre a Aplicação</Title>
          <Paragraph style={{ color: token.colorTextDescription }}>
            O <strong>FluxMonitor</strong> é uma plataforma centralizada de monitorização e gestão de fluxos de dados, ficheiros de integração EDI e conectores de sistemas periféricos operacionais.
          </Paragraph>

          <Card style={{ background: token.colorFillAlter, border: 'none', marginBottom: 24 }}>
            <Descriptions title="Informações do Sistema" bordered column={1} size="small">
              <Descriptions.Item label="Nome do Software">FluxMonitor Dashboard</Descriptions.Item>
              <Descriptions.Item label="Versão Atual">
                <Space>
                  <Text code>v2.0.4-stable</Text>
                  <Badge status="success" text="Atualizado" />
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Ambiente">Produção</Descriptions.Item>
              <Descriptions.Item label="Repositório Git">
                <Space>
                  <GithubOutlined />
                  <a href="https://github.com/empresa/flux-monitor" target="_blank" rel="noreferrer">
                    github.com/empresa/flux-monitor
                  </a>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Suporte Técnico">
                <Space>
                  <GlobalOutlined />
                  <Text copyable>suporte.edi@empresa.com</Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Button 
            type="primary" 
            icon={<CloudDownloadOutlined />} 
            loading={checkingUpdate}
            onClick={handleCheckUpdates}
          >
            Procurar Atualizações
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card style={cardElevationStyle} title="Configurações do Sistema">
        <Tabs defaultActiveKey="flux-monitor" items={tabItems} />
      </Card>

      <Modal
        title={
          <Space>
            <CloudDownloadOutlined style={{ color: token.colorPrimary }} />
            <span>Nova Atualização Disponível! (v2.1.0)</span>
          </Space>
        }
        open={isModalOpen}
        onOk={() => {
          setIsModalOpen(false);
          message.success('Download da nova versão iniciado em segundo plano.');
        }}
        onCancel={() => setIsModalOpen(false)}
        okText="Atualizar Agora"
        cancelText="Mais Tarde"
        centered
      >
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <Text strong>Changelog / Histórico de Alterações (v2.1.0):</Text>
        </div>
        
        <Timeline
          items={[
            {
              color: 'green',
              children: (
                <div>
                  <Text strong>[Melhoria]</Text> Otimização nos filtros de data e carregamento do Dashboard global.
                </div>
              ),
            },
            {
              color: 'green',
              children: (
                <div>
                  <Text strong>[Funcionalidade]</Text> Novo sistema de controlo de acessos por grupo (RBAC) para Perfis de Admin, Developer e Monitors.
                </div>
              ),
            },
            {
              color: 'blue',
              children: (
                <div>
                  <Text strong>[Interface]</Text> Atualização visual completa do Sider e do Header flutuante (Estilo Bento Grid).
                </div>
              ),
            },
            {
              color: 'red',
              children: (
                <div>
                  <Text strong>[Correção]</Text> Resolução de bugs no cálculo do tempo de retenção nos Jobs de Housekeeping.
                </div>
              ),
            },
          ]}
        />
        <Paragraph type="secondary" style={{ marginTop: 16, fontSize: '12px' }}>
          * Recomenda-se a aplicação deste patch fora do horário de pico operacional para evitar interrupções nos serviços de monitorização.
        </Paragraph>
      </Modal>
    </div>
  );
}