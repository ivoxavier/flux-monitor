import { useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Select, DatePicker, Space, theme } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  SyncOutlined,
  FileTextOutlined,
  ApiOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function DashboardPage() {
  const navigate = useNavigate();
  
  const [dashboardDate, setDashboardDate] = useState<dayjs.Dayjs | null>(dayjs());
  
  const { token } = theme.useToken();
  
  const cardElevationStyle = {
    boxShadow: token.boxShadowSecondary,
    borderRadius: token.borderRadiusLG,
    border: 'none',                
  };

  const flowTrendData = [
    { hora: '00:00', fluxos: 12 },
    { hora: '04:00', fluxos: 8 },
    { hora: '08:00', fluxos: 45 },
    { hora: '12:00', fluxos: 67 },
    { hora: '16:00', fluxos: 52 },
    { hora: '20:00', fluxos: 34 },
  ];

  const fileProcessingData = [
    { dia: 'Seg', ficheiros: 240 },
    { dia: 'Ter', ficheiros: 310 },
    { dia: 'Qua', ficheiros: 289 },
    { dia: 'Qui', ficheiros: 320 },
    { dia: 'Sex', ficheiros: 295 },
    { dia: 'Sáb', ficheiros: 180 },
    { dia: 'Dom', ficheiros: 145 },
  ];

  const errorDistributionData = [
    { name: 'Timeout', value: 12 },
    { name: 'Formato Inválido', value: 8 },
    { name: 'Conexão', value: 5 },
    { name: 'Autenticação', value: 3 },
  ];

  const COLORS = ['#ff4d4f', '#ff7a45', '#ffa940', '#ffc53d'];

  const recentFlows = [
    {
      key: '1',
      nome: 'Importação Faturas SAP',
      holding: '0',
      departamento: 'Financeiro',
      cliente: 'Continente',
      origem: 'SAP ERP',
      destino: 'Sistema Financeiro',
      ultimaExecucao: '2026-06-07 14:23:15',
      tempoProcessamento: '2.3s',
      estado: 'sucesso',
      slaCumprido: 'sim',
    },
    {
      key: '2',
      nome: 'Exportação Encomendas',
      holding: '0',
      departamento: 'Financeiro',
      cliente: 'Continente',
      origem: 'Portal Web',
      destino: 'WMS',
      ultimaExecucao: '2026-06-07 14:20:45',
      tempoProcessamento: '5.1s',
      estado: 'sucesso',
      slaCumprido: 'sim',
    },
    {
      key: '3',
      nome: 'Sincronização Stock',
      holding: '0',
      departamento: 'Financeiro',
      cliente: 'Continente',
      origem: 'WMS',
      destino: 'Portal Web',
      ultimaExecucao: '2026-06-07 14:18:30',
      tempoProcessamento: '12.4s',
      estado: 'aviso',
      slaCumprido: 'sim',
    },
    {
      key: '4',
      nome: 'Integração CRM',
      holding: '0',
      departamento: 'Financeiro',
      cliente: 'Continente',
      origem: 'Sistema Vendas',
      destino: 'Salesforce',
      ultimaExecucao: '2026-06-07 14:15:22',
      tempoProcessamento: '18.7s',
      estado: 'erro',
      slaCumprido: 'nao',
    },
    {
      key: '5',
      nome: 'Atualização Clientes',
      holding: '0',
      departamento: 'Financeiro',
      cliente: 'Continente',
      origem: 'ERP',
      destino: 'CRM',
      ultimaExecucao: '2026-06-07 14:10:11',
      tempoProcessamento: '3.8s',
      estado: 'sucesso',
      slaCumprido: 'sim',
    },
  ];

  const columns = [
    {
      title: 'Nome do Fluxo',
      dataIndex: 'nome',
      key: 'nome',
      render: (text: string, record: any) => (
        <a onClick={() => navigate(`/flow/${record.key}`)}>{text}</a>
      ),
    },
    {
      title: 'Holding',
      dataIndex: 'holding',
      key: 'holding',
    },
    {
      title: 'Departamento',
      dataIndex: 'departamento',
      key: 'departamento',
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
    },
    {
      title: 'Sistema Origem',
      dataIndex: 'origem',
      key: 'origem',
    },
    {
      title: 'Sistema Destino',
      dataIndex: 'destino',
      key: 'destino',
    },
    {
      title: 'Última Execução',
      dataIndex: 'ultimaExecucao',
      key: 'ultimaExecucao',
    },
    {
      title: 'Tempo',
      dataIndex: 'tempoProcessamento',
      key: 'tempoProcessamento',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => {
        const config = {
          sucesso: { color: 'success', icon: <CheckCircleOutlined />, text: 'Sucesso' },
          aviso: { color: 'warning', icon: <WarningOutlined />, text: 'Aviso' },
          erro: { color: 'error', icon: <CloseCircleOutlined />, text: 'Erro' },
        };
        const { color, icon, text } = config[estado as keyof typeof config];
        return <Tag color={color} icon={icon}>{text}</Tag>;
      },
    },
    {
      title: 'SLA',
      dataIndex: 'slaCumprido',
      key: 'slaCumprido',
      render: (sla: string) => (
        <Tag color={sla === 'sim' ? 'success' : 'error'}>
          {sla === 'sim' ? 'Cumprido' : 'Não Cumprido'}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          gap: 16,
          background: token.colorBgContainer,
          padding: '12px 16px',
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowTertiary
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: token.colorTextHeading }}>Painel de Controlo Operacional</h2>
            <span style={{ color: token.colorTextDescription, fontSize: '13px' }}>
              Visualizando dados operacionais do dia: <strong>{dashboardDate ? dashboardDate.format('DD/MM/YYYY') : 'Todos os dias'}</strong>
            </span>
          </div>
          <Space size="middle">
            <span style={{ color: token.colorTextDescription }}><CalendarOutlined /> Filtrar por Dia:</span>
            <DatePicker 
              value={dashboardDate} 
              onChange={(date) => setDashboardDate(date)} 
              format="DD/MM/YYYY"
              allowClear={false} 
              style={{ width: 160 }}
            />
          </Space>
        </div>

        {}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card style={cardElevationStyle}>
              <Statistic
                title="Fluxos Executados Hoje"
                value={218}
                prefix={<SyncOutlined />}
                valueStyle={{ color: '#3f8600' }}
                suffix={<ArrowUpOutlined style={{ fontSize: 14 }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card style={cardElevationStyle}>
              <Statistic
                title="Ficheiros Processados"
                value={1892}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card style={cardElevationStyle}>
              <Statistic
                title="Pedidos HTTP Enviados"
                value={456}
                prefix={<ApiOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card style={cardElevationStyle}>
              <Statistic
                title="Pedidos HTTP Recebidos"
                value={789}
                prefix={<ApiOutlined />}
                valueStyle={{ color: '#eb2f96' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card style={cardElevationStyle}>
              <Statistic
                title="Fluxos com Erro"
                value={28}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
                suffix={<ArrowDownOutlined style={{ fontSize: 14 }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card style={cardElevationStyle}>
              <Statistic
                title="Alertas Ativos"
                value={12}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Evolução dos Fluxos por Hora" style={cardElevationStyle}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={flowTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="fluxos" stroke="#1890ff" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Processamento de Ficheiros por Dia" style={cardElevationStyle}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fileProcessingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ficheiros" fill="#52c41a" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Distribuição de Erros por Tipo" style={cardElevationStyle}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={errorDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {errorDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Filtros Rápidos" style={cardElevationStyle}>
              <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'flex-start', gap: 12 }}>
                <Select placeholder="Estado" style={{ width: 120 }}>
                  <Select.Option value="todos">Todos</Select.Option>
                  <Select.Option value="sucesso">Sucesso</Select.Option>
                  <Select.Option value="aviso">Aviso</Select.Option>
                  <Select.Option value="erro">Erro</Select.Option>
                </Select>
                <Select placeholder="Sistema" style={{ width: 150 }}>
                  <Select.Option value="todos">Todos</Select.Option>
                  <Select.Option value="sap">SAP ERP</Select.Option>
                  <Select.Option value="wms">WMS</Select.Option>
                  <Select.Option value="crm">CRM</Select.Option>
                </Select>
              </Space>
              <p style={{ color: token.colorTextDescription }}>Utilize os filtros acima para refinar a pesquisa rápida nos gráficos.</p>
            </Card>
          </Col>
        </Row>

        {/* Card Principal da Tabela de Dados */}
        <Card title="Fluxos Recentes" style={cardElevationStyle}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space wrap>
              <RangePicker />
              <Select placeholder="Estado" style={{ width: 120 }}>
                <Select.Option value="todos">Todos</Select.Option>
                <Select.Option value="sucesso">Sucesso</Select.Option>
                <Select.Option value="aviso">Aviso</Select.Option>
                <Select.Option value="erro">Erro</Select.Option>
              </Select>
              <Select placeholder="Sistema" style={{ width: 150 }}>
                <Select.Option value="todos">Todos</Select.Option>
                <Select.Option value="sap">SAP ERP</Select.Option>
                <Select.Option value="wms">WMS</Select.Option>
                <Select.Option value="crm">CRM</Select.Option>
              </Select>
              <Select placeholder="Tipo de Fluxo" style={{ width: 150 }}>
                <Select.Option value="todos">Todos</Select.Option>
                <Select.Option value="import">Importação</Select.Option>
                <Select.Option value="export">Exportação</Select.Option>
                <Select.Option value="sync">Sincronização</Select.Option>
              </Select>
            </Space>
            <Table columns={columns} dataSource={recentFlows} pagination={{ pageSize: 5 }} scroll={{ x: 1800 }} />
          </Space>
        </Card>

      </Space>
    </div>
  );
}