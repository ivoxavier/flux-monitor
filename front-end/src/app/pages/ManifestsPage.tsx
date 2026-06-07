import { useState } from 'react';
import { Card, Table, Button, Space, Upload, Tag, Modal, Form, Input, Select, InputNumber, Popconfirm, message } from 'antd';
import { UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

export default function ManifestsPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedManifest, setSelectedManifest] = useState<any>(null);
  const [form] = Form.useForm();

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
    },
  ];

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
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} carregado com sucesso.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} falhou ao carregar.`);
      }
    },
  };

  const handleView = (record: any) => {
    setSelectedManifest(record);
    setViewModalVisible(true);
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
      console.log('Form values:', values);
      message.success('Manifesto guardado com sucesso!');
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case 'XML':
        return <FileTextOutlined style={{ color: '#ff7a45' }} />;
      case 'JSON':
        return <FilePdfOutlined style={{ color: '#1890ff' }} />;
      case 'CSV':
        return <FileExcelOutlined style={{ color: '#52c41a' }} />;
      default:
        return <FileTextOutlined />;
    }
  };

  const columns = [
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 80,
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
    },
    {
      title: 'Frequência Esperada',
      dataIndex: 'frequencia',
      key: 'frequencia',
    },
    {
      title: 'Tempo Máximo',
      dataIndex: 'tempoMaximo',
      key: 'tempoMaximo',
    },
    {
      title: 'Última Atualização',
      dataIndex: 'ultimaAtualizacao',
      key: 'ultimaAtualizacao',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => (
        <Tag color={estado === 'ativo' ? 'success' : 'default'}>
          {estado.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Tem a certeza que deseja eliminar este manifesto?"
            onConfirm={() => handleDelete(record.key)}
            okText="Sim"
            cancelText="Não"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Gestão de Manifestos EDI"
        extra={
          <Space>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Upload Manifesto</Button>
            </Upload>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedManifest(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Novo Manifesto
            </Button>
          </Space>
        }
      >
        <Table columns={columns} dataSource={manifestos} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={selectedManifest ? 'Editar Manifesto' : 'Novo Manifesto'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nome"
            label="Nome do Manifesto"
            rules={[{ required: true, message: 'Por favor insira o nome!' }]}
          >
            <Input placeholder="Ex: Manifesto SAP Faturas" />
          </Form.Item>
          <Form.Item
            name="fluxo"
            label="Fluxo Associado"
            rules={[{ required: true, message: 'Por favor selecione o fluxo!' }]}
          >
            <Select placeholder="Selecione o fluxo">
              <Select.Option value="importacao-faturas">Importação Faturas SAP</Select.Option>
              <Select.Option value="exportacao-encomendas">Exportação Encomendas</Select.Option>
              <Select.Option value="sincronizacao-stock">Sincronização Stock</Select.Option>
              <Select.Option value="integracao-crm">Integração CRM</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="tipo"
            label="Tipo de Ficheiro"
            rules={[{ required: true, message: 'Por favor selecione o tipo!' }]}
          >
            <Select placeholder="Selecione o tipo">
              <Select.Option value="XML">XML</Select.Option>
              <Select.Option value="JSON">JSON</Select.Option>
              <Select.Option value="CSV">CSV</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="frequencia"
            label="Frequência Esperada (minutos)"
            rules={[{ required: true, message: 'Por favor insira a frequência!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Ex: 15" />
          </Form.Item>
          <Form.Item
            name="tempoMaximo"
            label="Tempo Máximo de Execução (minutos)"
            rules={[{ required: true, message: 'Por favor insira o tempo máximo!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Ex: 5" />
          </Form.Item>
          <Form.Item
            name="estado"
            label="Estado"
            rules={[{ required: true, message: 'Por favor selecione o estado!' }]}
          >
            <Select placeholder="Selecione o estado">
              <Select.Option value="ativo">Ativo</Select.Option>
              <Select.Option value="inativo">Inativo</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Visualizar Manifesto"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Fechar
          </Button>,
        ]}
        width={600}
      >
        {selectedManifest && (
          <div>
            <p><strong>Nome:</strong> {selectedManifest.nome}</p>
            <p><strong>Fluxo:</strong> {selectedManifest.fluxo}</p>
            <p><strong>Tipo:</strong> {selectedManifest.tipo}</p>
            <p><strong>Frequência:</strong> {selectedManifest.frequencia}</p>
            <p><strong>Tempo Máximo:</strong> {selectedManifest.tempoMaximo}</p>
            <p><strong>Última Atualização:</strong> {selectedManifest.ultimaAtualizacao}</p>
            <p><strong>Estado:</strong> <Tag color={selectedManifest.estado === 'ativo' ? 'success' : 'default'}>{selectedManifest.estado.toUpperCase()}</Tag></p>
          </div>
        )}
      </Modal>
    </div>
  );
}
