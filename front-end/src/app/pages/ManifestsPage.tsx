import { useState } from 'react';
import { Card, Table, Button, Space, Upload, Tag, Modal, Form, Input, Select, InputNumber, Popconfirm, message, theme, Row, Col, Typography } from 'antd';
import { UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined, FileExcelOutlined, FilePdfOutlined, SearchOutlined, CloseOutlined, MailOutlined, BellOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Text } = Typography;

export default function ManifestsPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedManifest, setSelectedManifest] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const { token } = theme.useToken();

  const cardElevationStyle = {
    boxShadow: token.boxShadowSecondary,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  // Mock de dados enriquecido com os canais de alerta e destinatários padrão
  const manifestos = [
    {
      key: '1',
      nome: 'Manifesto SAP Faturas',
      fluxo: 'Importação Faturas SAP',
      frequencia: '15 min',
      tempoMaximo: '5 min',
      ultimaAtualizacao: '2026-06-05 10:30:00',
      estado: 'ativo',
      tipo: 'XML',
      classeFicheiro: 'Faturas',
      dirIn: '/opt/edi/sap/inbound',
      dirOut: '/opt/edi/sap/archive',
      tipoSistema: 'Talend',
      schedulerMachine: 'srv-talend-prod-01',
      configAlertas: ['Email', 'Painel Web'],
      destinatarios: ['equipa.sap@empresa.com', 'admin.edi@empresa.com'],
    },
    {
      key: '2',
      nome: 'Manifesto Encomendas WMS',
      fluxo: 'Exportação Encomendas',
      frequencia: '30 min',
      tempoMaximo: '10 min',
      ultimaAtualizacao: '2026-06-04 14:20:00',
      estado: 'ativo',
      tipo: 'JSON',
      classeFicheiro: 'Encomendas',
      dirIn: 'C:\\EDI\\WMS\\Outbound',
      dirOut: 'C:\\EDI\\WMS\\Success',
      tipoSistema: 'C#',
      schedulerMachine: 'srv-win-jobs-02',
      configAlertas: ['Painel Web'],
      destinatarios: ['logistica@empresa.com'],
    },
    {
      key: '3',
      nome: 'Manifesto Stock Sync',
      fluxo: 'Sincronização Stock',
      frequencia: '1 hora',
      tempoMaximo: '15 min',
      ultimaAtualizacao: '2026-06-03 09:15:00',
      estado: 'inativo',
      tipo: 'CSV',
      classeFicheiro: 'Stocks',
      dirIn: '/mnt/shares/stock/csv',
      dirOut: '/mnt/shares/stock/processed',
      tipoSistema: 'Altova',
      schedulerMachine: 'srv-altova-map-01',
      configAlertas: ['Email', 'Webhook Teams', 'Painel Web'],
      destinatarios: ['suporte.crm@empresa.com'],
    },
    {
      key: '4',
      nome: 'Manifesto CRM Integration',
      fluxo: 'Integração CRM',
      frequencia: '2 horas',
      tempoMaximo: '20 min',
      ultimaAtualizacao: '2026-06-06 16:45:00',
      estado: 'ativo',
      tipo: 'XML',
      classeFicheiro: 'Clientes',
      dirIn: '/var/edi/crm/input',
      dirOut: '/var/edi/crm/output',
      tipoSistema: 'Talend',
      schedulerMachine: 'srv-talend-prod-01',
      configAlertas: ['Email'],
      destinatarios: ['wms.ops@empresa.com'],
    },
  ];

  const filteredManifestos = manifestos.filter((item) =>
    item.nome.toLowerCase().includes(searchText.toLowerCase())
  );

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xml,.json,.csv',
    beforeUpload: (file) => {
      const isValidType = file.type === 'text/xml' || file.type === 'application/json' || file.type === 'text/csv';
      if (!isValidType) {
        message.error('Apenas são permitidos ficheiros XML, JSON ou CSV!');
      }
      return false;
    },
  };

  const handleView = (record: any) => {
    setSelectedManifest(record);
    setShowDetailPanel(true);
  };

  const handleEdit = (record: any) => {
    form.setFieldsValue(record);
    setSelectedManifest(record);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    message.success('Manifesto eliminado com sucesso!');
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log('Form values com Políticas de Alerta:', values);
      message.success('Manifesto e políticas guardados com sucesso!');
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case 'XML': return <FileTextOutlined style={{ color: '#ff7a45' }} />;
      case 'JSON': return <FilePdfOutlined style={{ color: '#1890ff' }} />;
      case 'CSV': return <FileExcelOutlined style={{ color: '#52c41a' }} />;
      default: return <FileTextOutlined />;
    }
  };

  const columns = [
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 65,
      render: (tipo: string) => getFileIcon(tipo),
    },
    {
      title: 'Nome do Manifesto',
      dataIndex: 'nome',
      key: 'nome',
    },
    {
      title: 'Fluxo Associado',
      dataIndex: 'fluxo',
      key: 'fluxo',
      responsive: showDetailPanel ? ['md'] : undefined,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 90,
      render: (estado: string) => (
        <Tag color={estado === 'ativo' ? 'success' : 'default'}>
          {estado.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'acoes',
      width: 130,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Tem a certeza?" onConfirm={() => handleDelete(record.key)} okText="Sim" cancelText="Não">
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
            title="Gestão de Manifestos EDI"
            style={cardElevationStyle}
            extra={
              <Space>
                <Upload {...uploadProps}><Button icon={<UploadOutlined />}>Upload Manifesto</Button></Upload>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedManifest(null); form.resetFields(); setIsModalVisible(true); }}>Novo Manifesto</Button>
              </Space>
            }
          >
            <div style={{ marginBottom: 16, maxWidth: 320 }}>
              <Input.Search placeholder="Filtrar por nome do EDI..." allowClear enterButton={<SearchOutlined />} onChange={(e) => setSearchText(e.target.value)} />
            </div>
            <Table columns={columns} dataSource={filteredManifestos} pagination={{ pageSize: 10 }} rowClassName={(record) => selectedManifest && record.key === selectedManifest.key && showDetailPanel ? 'ant-table-row-selected' : ''} />
          </Card>
        </Col>

        {showDetailPanel && selectedManifest && (
          <Col span={10} style={{ transition: 'all 0.3s' }}>
            <Card
              title="Detalhes do Manifesto"
              style={cardElevationStyle}
              extra={<Button type="text" icon={<CloseOutlined />} onClick={() => { setShowDetailPanel(false); setSelectedManifest(null); }} />}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px' }}>Nome do Manifesto</span>
                  <strong style={{ fontSize: '16px', color: token.colorTextHeading }}>{selectedManifest.nome}</strong>
                </div>
                
                <Row gutter={[16, 14]}>
                  <Col span={12}>
                    <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px' }}>Tipo de Ficheiro</span>
                    <Space>{getFileIcon(selectedManifest.tipo)} <strong>{selectedManifest.tipo}</strong></Space>
                  </Col>
                  <Col span={12}>
                    <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px' }}>Estado</span>
                    <Tag color={selectedManifest.estado === 'ativo' ? 'success' : 'default'} style={{ marginTop: 2 }}>{selectedManifest.estado.toUpperCase()}</Tag>
                  </Col>
                </Row>

                {/* VISUALIZAÇÃO: Nova secção de políticas de alerta no painel de detalhes */}
                <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: '12px' }}>
                  <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px', marginBottom: 6 }}><BellOutlined /> Canais de Alerta Ativos</span>
                  <Space wrap size={4}>
                    {selectedManifest.configAlertas?.map((canal: string) => (
                      <Tag color="cyan" key={canal}>{canal}</Tag>
                    )) || <Text type="secondary">Nenhum canal configurado</Text>}
                  </Space>
                </div>

                <div>
                  <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px', marginBottom: 4 }}><MailOutlined /> Destinatários de Notificação</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedManifest.destinatarios?.map((email: string) => (
                      <Text key={email} copyable={{ text: email }} style={{ fontSize: '13px', fontFamily: 'monospace' }}>{email}</Text>
                    )) || <Text type="secondary">Nenhum e-mail associado</Text>}
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: '12px' }}>
                  <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px' }}>Classe do Ficheiro</span>
                  <Tag color="cyan" style={{ fontWeight: 500 }}>{selectedManifest.classeFicheiro || 'Não Definida'}</Tag>
                </div>

                <div>
                  <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px' }}>Fluxo Associado</span>
                  <span style={{ color: token.colorText, fontWeight: 500 }}>{selectedManifest.fluxo}</span>
                </div>

                <Row gutter={[16, 14]}>
                  <Col span={12}>
                    <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px' }}>Tipo de Sistema</span>
                    <Tag color="blue">{selectedManifest.tipoSistema || 'N/A'}</Tag>
                  </Col>
                  <Col span={12}>
                    <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '12px' }}>Scheduler Machine</span>
                    <span style={{ color: token.colorText, fontFamily: 'monospace', fontSize: '13px' }}>{selectedManifest.schedulerMachine || 'N/A'}</span>
                  </Col>
                </Row>

                <div style={{ background: token.colorFillAlter, padding: '8px 12px', borderRadius: token.borderRadiusSM }}>
                  <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '11px' }}>DIR IN</span>
                  <span style={{ color: token.colorText, fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}>{selectedManifest.dirIn || 'N/A'}</span>
                </div>

                <div style={{ background: token.colorFillAlter, padding: '8px 12px', borderRadius: token.borderRadiusSM }}>
                  <span style={{ color: token.colorTextDescription, display: 'block', fontSize: '11px' }}>DIR OUT</span>
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

      {/* FORMULÁRIO: Adicionados os novos campos de monitorização por EDI */}
      <Modal
        title={selectedManifest ? 'Editar Manifesto' : 'Novo Manifesto'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nome" label="Nome do Manifesto" rules={[{ required: true, message: 'Insira o nome!' }]}>
                <Input placeholder="Ex: Manifesto SAP Faturas" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fluxo" label="Fluxo Associado" rules={[{ required: true, message: 'Selecione o fluxo!' }]}>
                <Select placeholder="Selecione o fluxo">
                  <Select.Option value="Importação Faturas SAP">Importação Faturas SAP</Select.Option>
                  <Select.Option value="Exportação Encomendas">Exportação Encomendas</Select.Option>
                  <Select.Option value="Sincronização Stock">Sincronização Stock</Select.Option>
                  <Select.Option value="Integração CRM">Integração CRM</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tipo" label="Tipo de Ficheiro" rules={[{ required: true, message: 'Selecione o tipo!' }]}>
                <Select placeholder="Selecione o tipo">
                  <Select.Option value="XML">XML</Select.Option>
                  <Select.Option value="JSON">JSON</Select.Option>
                  <Select.Option value="CSV">CSV</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="estado" label="Estado" rules={[{ required: true, message: 'Selecione o estado!' }]}>
                <Select placeholder="Selecione o estado">
                  <Select.Option value="ativo">Ativo</Select.Option>
                  <Select.Option value="inativo">Inativo</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* NOVA SECÇÃO: Configuração de Políticas de Alerta */}
          <Card title="Políticas de Notificação e Alerta" size="small" style={{ marginBottom: 20, background: token.colorFillAlter, border: 'none' }}>
            <Form.Item
              name="configAlertas"
              label="Canais de Alerta"
              extra="Escolha os canais que vão ser disparados caso este fluxo EDI específico falhe."
            >
              <Select mode="multiple" placeholder="Escolha os canais de comunicação" style={{ width: '100%' }}>
                <Select.Option value="Email">Email</Select.Option>
                <Select.Option value="Webhook Teams">Webhook Teams</Select.Option>
                <Select.Option value="Painel Web">Painel Web (Monitorização)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="destinatarios"
              label="Destinatários de Notificação (Emails)"
              extra="Insira os emails separados por vírgula ou prima enter após cada email."
            >
              <Select mode="tags" tokenSeparators={[',']} placeholder="exemplo@empresa.com" style={{ width: '100%' }} suffixIcon={<MailOutlined />} />
            </Form.Item>
          </Card>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="frequencia" label="Frequência Esperada" rules={[{ required: true, message: 'Insira a frequência!' }]}>
                <Input placeholder="Ex: 15 min" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tempoMaximo" label="Tempo Máximo de Execução" rules={[{ required: true, message: 'Insira o tempo máximo!' }]}>
                <Input placeholder="Ex: 5 min" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}