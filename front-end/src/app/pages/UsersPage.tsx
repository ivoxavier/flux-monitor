import { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, Switch, Popconfirm, message, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined, UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';

export default function UsersPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [form] = Form.useForm();

  const utilizadores = [
    {
      key: '1',
      nome: 'João Silva',
      email: 'joao.silva@empresa.pt',
      username: 'jsilva',
      perfil: 'administrador',
      estado: 'ativo',
      ultimoLogin: '2026-06-07 14:30:00',
    },
    {
      key: '2',
      nome: 'Maria Santos',
      email: 'maria.santos@empresa.pt',
      username: 'msantos',
      perfil: 'operador',
      estado: 'ativo',
      ultimoLogin: '2026-06-07 13:15:00',
    },
    {
      key: '3',
      nome: 'Pedro Costa',
      email: 'pedro.costa@empresa.pt',
      username: 'pcosta',
      perfil: 'operador',
      estado: 'ativo',
      ultimoLogin: '2026-06-07 09:20:00',
    },
    {
      key: '4',
      nome: 'Ana Oliveira',
      email: 'ana.oliveira@empresa.pt',
      username: 'aoliveira',
      perfil: 'consulta',
      estado: 'ativo',
      ultimoLogin: '2026-06-06 17:45:00',
    },
    {
      key: '5',
      nome: 'Carlos Ferreira',
      email: 'carlos.ferreira@empresa.pt',
      username: 'cferreira',
      perfil: 'operador',
      estado: 'inativo',
      ultimoLogin: '2026-05-30 11:10:00',
    },
  ];

  const getPerfilTag = (perfil: string) => {
    const config = {
      administrador: { color: 'red', text: 'Administrador' },
      operador: { color: 'blue', text: 'Operador' },
      consulta: { color: 'default', text: 'Consulta' },
    };
    const { color, text } = config[perfil as keyof typeof config];
    return <Tag color={color}>{text}</Tag>;
  };

  const handleEdit = (record: any) => {
    form.setFieldsValue({
      ...record,
      estado: record.estado === 'ativo',
    });
    setSelectedUser(record);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    message.success('Utilizador desativado com sucesso!');
  };

  const handleResetPassword = (record: any) => {
    message.success(`Password reposta para ${record.email}`);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log('Form values:', values);
      message.success(selectedUser ? 'Utilizador atualizado!' : 'Utilizador criado com sucesso!');
      setIsModalVisible(false);
      form.resetFields();
      setSelectedUser(null);
    });
  };

  const columns = [
    {
      title: '',
      dataIndex: 'nome',
      key: 'avatar',
      width: 60,
      render: (nome: string) => (
        <Avatar style={{ background: '#1890ff' }}>
          {nome.split(' ').map(n => n[0]).join('').toUpperCase()}
        </Avatar>
      ),
    },
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Perfil',
      dataIndex: 'perfil',
      key: 'perfil',
      render: (perfil: string) => getPerfilTag(perfil),
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
      title: 'Último Login',
      dataIndex: 'ultimoLogin',
      key: 'ultimoLogin',
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Repor password para este utilizador?"
            onConfirm={() => handleResetPassword(record)}
            okText="Sim"
            cancelText="Não"
          >
            <Button type="text" icon={<KeyOutlined />} />
          </Popconfirm>
          <Popconfirm
            title={`Tem a certeza que deseja ${record.estado === 'ativo' ? 'desativar' : 'reativar'} este utilizador?`}
            onConfirm={() => handleDelete(record.key)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="text"
              danger={record.estado === 'ativo'}
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Gestão de Utilizadores"
        extra={
          <Space>
            <Select placeholder="Filtrar por Perfil" style={{ width: 150 }}>
              <Select.Option value="todos">Todos</Select.Option>
              <Select.Option value="administrador">Administrador</Select.Option>
              <Select.Option value="operador">Operador</Select.Option>
              <Select.Option value="consulta">Consulta</Select.Option>
            </Select>
            <Select placeholder="Estado" style={{ width: 120 }}>
              <Select.Option value="todos">Todos</Select.Option>
              <Select.Option value="ativo">Ativos</Select.Option>
              <Select.Option value="inativo">Inativos</Select.Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedUser(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Novo Utilizador
            </Button>
          </Space>
        }
      >
        <Table columns={columns} dataSource={utilizadores} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={selectedUser ? 'Editar Utilizador' : 'Criar Utilizador'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedUser(null);
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nome"
            label="Nome Completo"
            rules={[{ required: true, message: 'Por favor insira o nome completo!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Ex: João Silva" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor insira o email!' },
              { type: 'email', message: 'Email inválido!' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="email@empresa.pt" />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Por favor insira o username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="username" />
          </Form.Item>
          {!selectedUser && (
            <>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Por favor insira a password!' },
                  { min: 6, message: 'Password deve ter no mínimo 6 caracteres!' },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Confirmar Password"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Por favor confirme a password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('As passwords não coincidem!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirmar Password" />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="perfil"
            label="Perfil"
            rules={[{ required: true, message: 'Por favor selecione o perfil!' }]}
          >
            <Select placeholder="Selecione o perfil">
              <Select.Option value="administrador">Administrador</Select.Option>
              <Select.Option value="operador">Operador</Select.Option>
              <Select.Option value="consulta">Consulta</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="estado" label="Estado" valuePropName="checked">
            <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
