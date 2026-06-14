// src/pages/SettingsPage.tsx
import { useState, useEffect } from 'react';
import { Card, Tabs, Form, Switch, InputNumber, Button, Space, Typography, message, theme, Modal, Descriptions, Badge, Timeline, Input } from 'antd';
import { SettingOutlined, UserOutlined, SaveOutlined, InfoCircleOutlined, CloudDownloadOutlined, GithubOutlined, GlobalOutlined, ShopOutlined, AlertOutlined } from '@ant-design/icons';
import UsersPage from './UsersPage';
import { BRAND_CONFIG } from '../../config/brand'; 
import { getTranslation } from '../../config/i18n';

const { Title, Text, Paragraph } = Typography;

export default function SettingsPage() {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [actionsEnabled, setActionsEnabled] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  
  const t = getTranslation().settings;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/settings`);
        if (!response.ok) throw new Error(t.errLoad);
        const data = await response.json();
        
        form.setFieldsValue(data);
        setActionsEnabled(data.enableGlobalErrorActions);
      } catch (err: any) {
        message.error(err.message || t.errServer);
      }
    };
    fetchSettings();
  }, [form, baseUrl, t.errLoad, t.errServer]);

  const handleSaveSettings = async (values: any) => {
    setPageLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error(t.errSave);
      
      message.success(t.successSave);
    } catch (err: any) {
      message.error(err.message || t.errGenericSave);
    } finally {
      setPageLoading(false);
    }
  };

  const handleValuesChange = (changedValues: any) => {
    if (changedValues.enableGlobalErrorActions !== undefined) {
      setActionsEnabled(changedValues.enableGlobalErrorActions);
    }
  };

  const handleCheckUpdates = () => {
    setCheckingUpdate(true);
    message.loading({ content: t.about.checkingLoading, key: 'updatable' });
    
    setTimeout(() => {
      setCheckingUpdate(false);
      message.success({ content: t.about.updateFound, key: 'updatable', duration: 2 });
      setIsModalOpen(true);
    }, 1500);
  };

  const cardElevationStyle = {
    boxShadow: token.boxShadowSecondary,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  const tabItems = [
    {
      key: 'flux-monitor',
      label: (
        <span>
          <SettingOutlined />
          {t.tabs.fluxMonitor}
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
            enableGlobalErrorActions: true,
            sendEmailOnFailure: true,
            triggerWebhookOnFailure: false,
          }}
          style={{ maxWidth: 500, marginTop: 16 }}
        >
          {}
          <Title level={5} style={{ marginBottom: 16 }}>{t.labels.whiteLabelTitle}</Title>
          <Card size="small" style={{ marginBottom: 24, background: token.colorFillAlter }}>
            <Form.Item
              name="clientCompany"
              label={t.labels.companyName}
              rules={[{ required: true, message: t.labels.companyRequired }]}
            >
              <Input 
                prefix={<ShopOutlined style={{ color: token.colorTextDescription }} />} 
                placeholder={t.labels.companyPlaceholder} 
              />
            </Form.Item>
          </Card>

          {}
          <Title level={5} style={{ marginBottom: 16 }}>
            <Space><AlertOutlined style={{ color: token.colorWarning }} /> {t.labels.errorActionsTitle}</Space>
          </Title>
          <Card size="small" style={{ marginBottom: 24, background: token.colorFillAlter }}>
            <Form.Item
              name="enableGlobalErrorActions"
              label={t.labels.enableGlobalErrors}
              valuePropName="checked"
              extra={t.labels.enableGlobalErrorsExtra}
            >
              <Switch checkedChildren={t.labels.switchActive} unCheckedChildren={t.labels.switchInactive} danger />
            </Form.Item>

            {}
            <div style={{ 
              opacity: actionsEnabled ? 1 : 0.5, 
              transition: 'opacity 0.3s', 
              borderTop: `1px solid ${token.colorBorderSecondary}`, 
              paddingTop: '16px',
              marginTop: '8px'
            }}>
              <Form.Item
                name="sendEmailOnFailure"
                label={t.labels.sendEmail}
                valuePropName="checked"
              >
                <Switch checkedChildren={t.labels.switchYes} unCheckedChildren={t.labels.switchNo} disabled={!actionsEnabled} />
              </Form.Item>

              <Form.Item
                name="triggerWebhookOnFailure"
                label={t.labels.triggerWebhook}
                valuePropName="checked"
                style={{ marginBottom: 8 }}
              >
                <Switch checkedChildren={t.labels.switchYes} unCheckedChildren={t.labels.switchNo} disabled={!actionsEnabled} />
              </Form.Item>
            </div>
          </Card>

          {}
          <Title level={5} style={{ marginBottom: 16 }}>{t.labels.housekeepingTitle}</Title>
          
          <Card size="small" style={{ marginBottom: 16, background: token.colorFillAlter }}>
            <Form.Item
              name="cleanLogs"
              label={t.labels.cleanLogs}
              valuePropName="checked"
            >
              <Switch checkedChildren={t.labels.switchActive} unCheckedChildren={t.labels.switchInactive} />
            </Form.Item>
            <Form.Item
              name="logsRetentionDays"
              label={t.labels.logsRetention}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Card>

          <Card size="small" style={{ marginBottom: 24, background: token.colorFillAlter }}>
            <Form.Item
              name="cleanManifests"
              label={t.labels.cleanManifests}
              valuePropName="checked"
            >
              <Switch checkedChildren={t.labels.switchActive} unCheckedChildren={t.labels.switchInactive} />
            </Form.Item>
            <Form.Item
              name="manifestsRetentionDays"
              label={t.labels.manifestsRetention}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Card>

          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} htmlType="submit" loading={pageLoading}>
              {t.labels.saveBtn}
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
          {t.tabs.users}
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
          {t.tabs.about}
        </span>
      ),
      children: (
        <div style={{ marginTop: 16, maxWidth: 800 }}>
          <Title level={4} style={{ marginBottom: 16 }}>{t.about.title}</Title>
          <Paragraph style={{ color: token.colorTextDescription }}>
            {t.about.description}
          </Paragraph>

          <Card style={{ background: token.colorFillAlter, border: 'none', marginBottom: 24 }}>
            <Descriptions title={t.about.sysInfo} bordered column={1} size="small">
              <Descriptions.Item label={t.about.softwareName}>FluxMonitor Dashboard</Descriptions.Item>
              <Descriptions.Item label={t.about.currentVersion}>
                <Space>
                  <Text code>v2.0.4-stable</Text>
                  <Badge status="success" text={t.about.statusUpdated} />
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label={t.about.environment}>{t.about.envProd}</Descriptions.Item>
              <Descriptions.Item label={t.about.repo}>
                <Space>
                  <GithubOutlined />
                  <a href="https://github.com/empresa/flux-monitor" target="_blank" rel="noreferrer">
                    github.com/empresa/flux-monitor
                  </a>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label={t.about.support}>
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
            {t.about.checkUpdatesBtn}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card style={cardElevationStyle} title={t.pageTitle}>
        <Tabs defaultActiveKey="flux-monitor" items={tabItems} />
      </Card>

      <Modal
        title={
          <Space>
            <CloudDownloadOutlined style={{ color: token.colorPrimary }} />
            <span>{t.modal.title}</span>
          </Space>
        }
        open={isModalOpen}
        onOk={() => {
          setIsModalOpen(false);
          message.success(t.modal.downloadStarted);
        }}
        onCancel={() => setIsModalOpen(false)}
        okText={t.modal.okText}
        cancelText={t.modal.cancelText}
        centered
      >
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <Text strong>{t.modal.changelogTitle}</Text>
        </div>
        
        <Timeline
          items={[
            { color: 'green', children: <div>{t.modal.items.improvement}</div> },
            { color: 'green', children: <div>{t.modal.items.feature}</div> },
            { color: 'blue', children: <div>{t.modal.items.interface}</div> },
            { color: 'red', children: <div>{t.modal.items.fix}</div> },
          ]}
        />
        <Paragraph type="secondary" style={{ marginTop: 16, fontSize: '12px' }}>
          {t.modal.warningText}
        </Paragraph>
      </Modal>
    </div>
  );
}