import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Tag, Button, Space, Select, Switch, Popconfirm, message, Avatar, Form, Input, Modal, theme } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined, UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { getTranslation } from '../../config/i18n';

export default function UsersPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [utilizadores, setUtilizadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  
  const [filterPerfil, setFilterPerfil] = useState('all');
  const [filterEstado, setFilterEstado] = useState('all');

  const { token } = theme.useToken();
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const t = getTranslation().usersPage;

  const cardElevationStyle = {
    boxShadow: token.boxShadowSecondary,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  
  const carregarUtilizadores = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/users?role=${filterPerfil}&status=${filterEstado}`);
      if (!response.ok) throw new Error(t.errLoadList);
      const data = await response.json();
      setUtilizadores(data);
    } catch (err: any) {
      message.error(err.message || t.errServerComm);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, filterPerfil, filterEstado, t.errLoadList, t.errServerComm]);

  useEffect(() => {
    carregarUtilizadores();
  }, [carregarUtilizadores]);

  const getPerfilTag = (role: string) => {
    const config = {
      admin: { color: 'red', text: t.roles.admin },
      operador: { color: 'blue', text: t.roles.operador },
      'edi-developer': { color: 'geekblue', text: t.roles['edi-developer'] },
      consulta: { color: 'default', text: t.roles.consulta },
    };
    const key = role as keyof typeof config;
    const item = config[key] || { color: 'default', text: role };
    return <Tag color={item.color}>{item.text}</Tag>;
  };

  
  const handleEdit = (record: any) => {
    form.setFieldsValue({
      nome: record.name,
      email: record.email,
      username: record.username,
      perfil: record.role,
      estado: record.status === 'enabled',
    });
    setSelectedUser(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (record: any) => {
    try {
      const response = await fetch(`${baseUrl}/api/users/${record.key}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(t.errAction);
      
      message.success(t.successStatusUpdate);
      carregarUtilizadores();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleResetPassword = async (record: any) => {
    try {
      const response = await fetch(`${baseUrl}/api/users/${record.key}/reset-password`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error(t.errResetPass);
      const data = await response.json();
      message.success(data.message || 'Password reset done!');
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const isEditing = !!selectedUser;
        const url = isEditing ? `${baseUrl}/api/users/${selectedUser.key}` : `${baseUrl}/api/users`;
        const method = isEditing ? 'PUT' : 'POST';

        const payload = {
          name: values.nome,
          email: values.email,
          username: values.username,
          password: values.password,
          role: values.perfil,
          isActive: !!values.estado,
        };

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(errMsg || t.errSubmit);
        }

        message.success(isEditing ? t.successUpdate : t.successCreate);
        setIsModalVisible(false);
        form.resetFields();
        setSelectedUser(null);
        carregarUtilizadores();
      } catch (err: any) {
        message.error(err.message);
      }
    });
  };


  const columns = [
    {
      title: '',
      dataIndex: 'name',
      key: 'avatar',
      width: 60,
      render: (name: string) => (
        <Avatar style={{ background: token.colorPrimary }}>
          {(name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
        </Avatar>
      ),
    },
    { title: t.table.name, dataIndex: 'name', key: 'name' },
    { title: t.table.email, dataIndex: 'email', key: 'email' },
    { title: t.table.username, dataIndex: 'username', key: 'username' },
    { title: t.table.role, dataIndex: 'role', key: 'role', render: (role: string) => getPerfilTag(role) },
    {
      title: t.table.status,
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'enabled' ? 'success' : 'default'}>
          {status === 'enabled' ? t.switchActive.toUpperCase() : t.switchInactive.toUpperCase()}
        </Tag>
      ),
    },
    { title: t.table.lastLogin, dataIndex: 'lastLogin', key: 'lastLogin' },
    {
      title: t.table.actions,
      key: 'acoes',
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title={t.popconfirmResetPass}
            onConfirm={() => handleResetPassword(record)}
            okText={t.yes} cancelText={t.no}
          >
            <Button type="text" icon={<KeyOutlined />} />
          </Popconfirm>
          <Popconfirm
            title={t.popconfirmToggleActive}
            onConfirm={() => handleDelete(record)}
            okText={t.yes} cancelText={t.no}
          >
            <Button type="text" danger={record.status === 'enabled'} icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={t.cardTitle}
        style={cardElevationStyle}
        extra={
          <Space>
            {}
            <Select value={filterPerfil} onChange={setFilterPerfil} style={{ width: 160 }}>
              <Select.Option value="all">{t.filters.allRoles}</Select.Option>
              <Select.Option value="admin">{t.roles.admin}</Select.Option>
              <Select.Option value="operador">{t.roles.operador}</Select.Option>
              <Select.Option value="consulta">{t.roles.consulta}</Select.Option>
            </Select>
            <Select value={filterEstado} onChange={setFilterEstado} style={{ width: 120 }}>
              <Select.Option value="all">{t.filters.allStatus}</Select.Option>
              <Select.Option value="enabled">{t.filters.active}</Select.Option>
              <Select.Option value="disabled">{t.filters.inactive}</Select.Option>
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
              {t.btnNewUser}
            </Button>
          </Space>
        }
      >
        <Table columns={columns} dataSource={utilizadores} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={selectedUser ? t.modal.titleEdit : t.modal.titleCreate}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedUser(null);
        }}
        width={600}
        okText={t.yes}
        cancelText={t.no}
      >
        {/* 🟢 Adicionado initialValues para garantir estabilidade no Switch de estado */}
        <Form form={form} layout="vertical" initialValues={{ estado: true, perfil: 'operador' }}>
          <Form.Item name="nome" label={t.modal.labelFullName} rules={[{ required: true, message: t.modal.reqFullName }]}>
            <Input prefix={<UserOutlined />} placeholder="Ex: João Silva" />
          </Form.Item>
          <Form.Item
            name="email"
            label={t.modal.labelEmail}
            rules={[
              { required: true, message: t.modal.reqEmail },
              { type: 'email', message: t.modal.valEmail },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="email@empresa.pt" />
          </Form.Item>
          <Form.Item name="username" label={t.modal.labelUsername} rules={[{ required: true, message: t.modal.reqUsername }]}>
            <Input prefix={<UserOutlined />} placeholder="username" />
          </Form.Item>
          {!selectedUser && (
            <>
              <Form.Item
                name="password"
                label={t.modal.labelPassword}
                rules={[
                  { required: true, message: t.modal.reqPassword },
                  { min: 6, message: t.modal.valPasswordMin },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label={t.modal.labelConfirmPassword}
                dependencies={['password']}
                rules={[
                  { required: true, message: t.modal.reqConfirmPassword },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error(t.modal.valConfirmPasswordMatch));
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
  label={t.modal.labelRole} 
  rules={[{ required: true, message: t.modal.reqRole }]}
>
  <Select placeholder={t.modal.placeholderRole}>
    <Select.Option value="admin">{t.roles.admin}</Select.Option>
    <Select.Option value="operador">{t.roles.operador}</Select.Option>
    <Select.Option value="consulta">{t.roles.consulta}</Select.Option>
  </Select>
</Form.Item>
          <Form.Item name="estado" label={t.modal.labelStatus} valuePropName="checked">
            <Switch checkedChildren={t.switchActive} unCheckedChildren={t.switchInactive} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}