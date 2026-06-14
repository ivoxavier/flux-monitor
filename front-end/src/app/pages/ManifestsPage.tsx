import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Tag, Button, Space, Upload, Modal, Form, Input, Select, Popconfirm, message, theme, Row, Col, Typography } from 'antd';
import { UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined, FileExcelOutlined, FilePdfOutlined, SearchOutlined, CloseOutlined, MailOutlined, BellOutlined, FolderOpenOutlined, DesktopOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { getTranslation } from '../../config/i18n';

const { Text } = Typography;

export default function ManifestsPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedManifest, setSelectedManifest] = useState<any>(null);
  const [manifestos, setManifestos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const { token } = theme.useToken();
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const t = getTranslation().manifestsPage;

  const cardElevationStyle = {
    boxShadow: token.boxShadowSecondary,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  const carregarManifestos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/manifests?name=${searchText}&status=all`);
      if (!response.ok) throw new Error(t.messages.errLoadList);
      const data = await response.json();
      setManifestos(data);
    } catch (err: any) {
      message.error(err.message || t.messages.errLoadList);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, searchText, t.messages.errLoadList]);

  useEffect(() => {
    carregarManifestos();
  }, [carregarManifestos]);

  
  const downloadTemplateJson = () => {
    const template = {
      name: "File Import Process Manifest",
      flow: "File Import Workflow",
      fileType: "XML",
      status: "enabled",
      frequency: "15 min",
      maxExecutionTime: "5 min",
      fileClass: "Invoices",
      systemType: "Talend",
      schedulerMachine: "srv-talend-prod-01",
      directoryIn: "/opt/edi/sap/inbound",
      directoryOut: "/opt/edi/sap/archive",
      alertChannels: ["Email", "Dashboard"],
      recipients: ["operations@company.com", "support@company.com"]
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "manifest-template.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    action: `${baseUrl}/api/manifests/upload`,
    accept: '.json',
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} uploaded successfully.`);
        carregarManifestos();
      } else if (info.file.status === 'error') {
        const errorResponse = info.file.response || t.messages.errSubmit;
        message.error(`Upload failed: ${errorResponse}`);
      }
    },
    beforeUpload: (file) => {
      const isJson = file.type === 'application/json' || file.name.endsWith('.json');
      if (!isJson) {
        message.error(t.messages.errUploadType);
        return Upload.LIST_IGNORE;
      }
      return true;
    },
  };

  const handleView = (record: any) => {
    setSelectedManifest(record);
    setShowDetailPanel(true);
  };

  const handleEdit = (record: any) => {
    form.setFieldsValue({
      nome: record.name,
      fluxo: record.flow,
      tipo: record.fileType,
      estado: record.status,
      configAlertas: record.alertChannels,
      destinatarios: record.recipients,
      frequencia: record.frequency,
      tempoMaximo: record.maxExecutionTime,
      classeFicheiro: record.fileClass,
      dirIn: record.dirIn,
      dirOut: record.dirOut,
      tipoSistema: record.systemType,
      schedulerMachine: record.schedulerMachine,
    });
    setSelectedManifest(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (key: string) => {
    try {
      const response = await fetch(`${baseUrl}/api/manifests/${key}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(t.messages.errSubmit);
      message.success(t.messages.successDelete);
      if (selectedManifest?.key === key) setShowDetailPanel(false);
      carregarManifestos();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const isEditing = !!selectedManifest?.key;
        const url = isEditing ? `${baseUrl}/api/manifests/${selectedManifest.key}` : `${baseUrl}/api/manifests`;
        const method = isEditing ? 'PUT' : 'POST';

        const payload = {
          name: values.nome,
          flow: values.fluxo,
          fileType: values.tipo,
          status: values.estado,
          alertChannels: values.configAlertas || [],
          recipients: values.destinatarios || [],
          frequency: values.frequencia,
          maxExecutionTime: values.tempoMaximo,
          fileClass: values.classeFicheiro,
          directoryIn: values.dirIn,
          directoryOut: values.dirOut,
          systemType: values.tipoSistema,
          schedulerMachine: values.schedulerMachine,
        };

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(t.messages.errSubmit);

        message.success(isEditing ? t.messages.successUpdate : t.messages.successCreate);
        setIsModalVisible(false);
        form.resetFields();
        setSelectedManifest(null);
        carregarManifestos();
      } catch (err: any) {
        message.error(err.message);
      }
    });
  };

  const getFileIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'XML': return <FileTextOutlined style={{ color: '#ff7a45' }} />;
      case 'JSON': return <FilePdfOutlined style={{ color: '#1890ff' }} />;
      case 'CSV': return <FileExcelOutlined style={{ color: '#52c41a' }} />;
      default: return <FileTextOutlined />;
    }
  };

  const columns = [
    {
      title: t.table.type,
      dataIndex: 'fileType',
      key: 'fileType',
      width: 65,
      render: (type: string) => getFileIcon(type),
    },
    { title: t.table.name, dataIndex: 'name', key: 'name' },
    { title: t.table.flow, dataIndex: 'flow', key: 'flow', responsive: showDetailPanel ? ['md'] : undefined },
    {
      title: t.table.status,
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => (
        <Tag color={status === 'enabled' ? 'success' : 'default'}>
          {status === 'enabled' ? 'ATIVO' : 'INATIVO'}
        </Tag>
      ),
    },
    {
      title: t.table.actions,
      key: 'acoes',
      width: 130,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title={t.confirmDelete} onConfirm={() => handleDelete(record.key)} okText={t.yes} cancelText={t.no}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={showDetailPanel ? 14 : 24} style={{ transition: 'all 0.3s' }}>
          <Card
            title={t.cardTitle}
            style={cardElevationStyle}
            extra={
              <Space size="middle">
                {/* 🟢 ADICIONADO O BOTÃO DE DOWNLOAD CONFORME SOLICITADO */}
                <Button 
                  type="link" 
                  icon={<DownloadOutlined />} 
                  onClick={downloadTemplateJson}
                  style={{ fontSize: '13px' }}
                >
                  {t.modal.downloadTemplate}
                </Button>
                <Upload {...uploadProps} showUploadList={false}>
                  <Button icon={<UploadOutlined />}>{t.btnUploadManifest}</Button>
                </Upload>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedManifest(null); form.resetFields(); setIsModalVisible(true); }}>
                  {t.btnNewManifest}
                </Button>
              </Space>
            }
          >
            <div style={{ marginBottom: 16, maxWidth: 320 }}>
              <Input.Search placeholder={t.searchPlaceholder} allowClear enterButton={<SearchOutlined />} onChange={(e) => setSearchText(e.target.value)} onSearch={() => carregarManifestos()} />
            </div>
            <Table columns={columns} dataSource={manifestos} loading={loading} pagination={{ pageSize: 10 }} rowClassName={(record) => selectedManifest && record.key === selectedManifest.key && showDetailPanel ? 'ant-table-row-selected' : ''} />
          </Card>
        </Col>

        {showDetailPanel && selectedManifest && (
          <Col span={10} style={{ transition: 'all 0.3s' }}>
            <Card
              title={t.detailTitle}
              style={cardElevationStyle}
              extra={<Button type="text" icon={<CloseOutlined />} onClick={() => { setShowDetailPanel(false); setSelectedManifest(null); }} />}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px' }}>{t.labels.fileName}</span>
                  <strong style={{ fontSize: '16px', color: token.colorTextHeading }}>{selectedManifest.name}</strong>
                </div>
                
                <Row gutter={[16, 14]}>
                  <Col span={12}>
                    <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px' }}>{t.labels.fileType}</span>
                    <Space>{getFileIcon(selectedManifest.fileType)} <strong>{selectedManifest.fileType}</strong></Space>
                  </Col>
                  <Col span={12}>
                    <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px' }}>{t.labels.status}</span>
                    <Tag color={selectedManifest.status === 'enabled' ? 'success' : 'default'} style={{ marginTop: 2 }}>{selectedManifest.status === 'enabled' ? 'ATIVO' : 'INATIVO'}</Tag>
                  </Col>
                </Row>

                <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: '12px' }}>
                  <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px', marginBottom: 6 }}><BellOutlined /> {t.labels.alertChannels}</span>
                  <Space wrap size={4}>
                    {selectedManifest.alertChannels?.map((canal: string) => (
                      <Tag color="cyan" key={canal}>{canal}</Tag>
                    )) || <Text type="secondary">{t.noChannels}</Text>}
                  </Space>
                </div>

                <div>
                  <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px', marginBottom: 4 }}><MailOutlined /> {t.labels.recipients}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedManifest.recipients?.map((email: string) => (
                      <Text key={email} copyable={{ text: email }} style={{ fontSize: '13px', fontFamily: 'monospace' }}>{email}</Text>
                    )) || <Text type="secondary">{t.noEmails}</Text>}
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: '12px' }}>
                  <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px' }}>{t.labels.fileClass}</span>
                  <Tag color="cyan" style={{ fontWeight: 500 }}>{selectedManifest.fileClass || 'N/A'}</Tag>
                </div>

                <div>
                  <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px' }}>{t.labels.associatedFlow}</span>
                  <span style={{ color: token.colorText, fontWeight: 500 }}>{selectedManifest.flow}</span>
                </div>

                <Row gutter={[16, 14]}>
                  <Col span={12}>
                    <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px' }}>{t.labels.systemType}</span>
                    <Tag color="blue">{selectedManifest.systemType || 'N/A'}</Tag>
                  </Col>
                  <Col span={12}>
                    <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px' }}>{t.labels.schedulerMachine}</span>
                    <span style={{ color: token.colorText, fontFamily: 'monospace', fontSize: '13px' }}>{selectedManifest.schedulerMachine || 'N/A'}</span>
                  </Col>
                </Row>

                <div style={{ background: token.colorFillAlter, padding: '8px 12px', borderRadius: token.borderRadiusSM }}>
                  <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '11px' }}>{t.labels.dirIn}</span>
                  <span style={{ color: token.colorText, fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}>{selectedManifest.dirIn || 'N/A'}</span>
                </div>

                <div style={{ background: token.colorFillAlter, padding: '8px 12px', borderRadius: token.borderRadiusSM }}>
                  <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '11px' }}>{t.labels.dirOut}</span>
                  <span style={{ color: token.colorText, fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}>{selectedManifest.dirOut || 'N/A'}</span>
                </div>

                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'end' }}>
                  <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(selectedManifest)}>Editar Dados</Button>
                </div>
              </div>
            </Card>
          </Col>
        )}
      </Row>

      <Modal
        title={selectedManifest ? t.modal.titleEdit : t.modal.titleCreate}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
        width={650}
        okText={t.yes}
        cancelText={t.no}
      >
        <Form form={form} layout="vertical" initialValues={{ estado: 'enabled', tipo: 'XML', tipoSistema: 'Talend' }}>
          
          {/* SECÇÃO 1: Dados Identificadores */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nome" label={t.labels.fileName} rules={[{ required: true, message: t.modal.reqName }]}>
                <Input placeholder="Ex: Manifesto SAP Faturas" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fluxo" label={t.labels.associatedFlow} rules={[{ required: true, message: t.modal.reqFlow }]}>
                <Input placeholder="Ex: Importação Faturas SAP" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tipo" label={t.labels.fileType} rules={[{ required: true, message: t.modal.reqType }]}>
                <Select placeholder={t.modal.placeholderType}>
                  <Select.Option value="XML">XML</Select.Option>
                  <Select.Option value="JSON">JSON</Select.Option>
                  <Select.Option value="CSV">CSV</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="estado" label={t.labels.status} rules={[{ required: true, message: t.modal.reqStatus }]}>
                <Select placeholder={t.modal.placeholderStatus}>
                  <Select.Option value="enabled">Ativo</Select.Option>
                  <Select.Option value="disabled">Inativo</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="classeFicheiro" label={t.labels.fileClass}>
                <Input placeholder="Ex: Faturas, Encomendas, Stocks" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="frequencia" label={t.labels.frequency} rules={[{ required: true, message: t.modal.reqFrequency }]}>
                <Input placeholder="Ex: 15 min, 1 hora" />
              </Form.Item>
            </Col>
          </Row>

          <Card 
            title="Infraestrutura e Diretórios EDI" 
            size="small" 
            style={{ marginBottom: 20, background: token.colorFillAlter, border: 'none' }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="tipoSistema" label={t.labels.systemType}>
                  <Select placeholder="Escolha o Motor">
                    <Select.Option value="Talend">Talend</Select.Option>
                    <Select.Option value="C#">C# / .NET</Select.Option>
                    <Select.Option value="Altova">Altova MapForce</Select.Option>
                    <Select.Option value="n8n">n8n Automation</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="schedulerMachine" label={t.labels.schedulerMachine}>
                  <Input prefix={<DesktopOutlined />} placeholder="Ex: srv-talend-prod-01" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="dirIn" label={t.labels.dirIn}>
              <Input prefix={<FolderOpenOutlined />} placeholder="Ex: /opt/edi/sap/inbound ou C:\EDI\In" />
            </Form.Item>

            <Form.Item name="dirOut" label={t.labels.dirOut}>
              <Input prefix={<FolderOpenOutlined />} placeholder="Ex: /opt/edi/sap/archive ou C:\EDI\Out" />
            </Form.Item>
          </Card>

          {/* SECÇÃO 3: Políticas de Alerta */}
          <Card title={t.modal.cardAlertTitle} size="small" style={{ marginBottom: 20, background: token.colorFillAlter, border: 'none' }}>
            <Form.Item name="configAlertas" label={t.labels.alertChannels} extra={t.modal.alertExtra}>
              <Select mode="multiple" placeholder={t.modal.placeholderChannels} style={{ width: '100%' }}>
                <Select.Option value="Email">Email</Select.Option>
                <Select.Option value="Webhook Teams">Webhook Teams</Select.Option>
                <Select.Option value="Painel Web">Painel Web (Monitorização)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="destinatarios" label={t.labels.recipients} extra={t.modal.recipientsExtra}>
              <Select mode="tags" tokenSeparators={[',']} placeholder="exemplo@empresa.com" style={{ width: '100%' }} suffixIcon={<MailOutlined />} />
            </Form.Item>
          </Card>

          <Form.Item name="tempoMaximo" label={t.labels.maxExecutionTime} rules={[{ required: true, message: t.modal.reqMaxTime }]}>
            <Input placeholder="Ex: 5 min, 20 min" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}