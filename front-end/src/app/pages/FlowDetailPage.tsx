import { Card, Descriptions, Table, Tag, Tabs, Badge, Progress, Space, Statistic, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SyncOutlined, LineChartOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useParams } from 'react-router-dom';

export default function FlowDetailPage() {
  const { id } = useParams();

  const flowData = {
    nome: 'Importação Faturas SAP',
    origem: 'SAP ERP',
    destino: 'Sistema Financeiro',
    tipoEDI: 'EDIFACT INVOIC',
    slaDefined: '5 minutos',
    ultimaExecucao: '2026-06-07 14:23:15',
    proximaExecucao: '2026-06-07 14:38:15',
    estado: 'sucesso',
    frequencia: '15 minutos',
    tempoMedio: '2.8s',
    taxaSucesso: 94.5,
  };

  const historico = [
    {
      key: '1',
      dataHora: '2026-06-07 14:23:15',
      estado: 'sucesso',
      duracao: '2.3s',
      ficheirosProcessados: 45,
    },
    {
      key: '2',
      dataHora: '2026-06-07 14:08:10',
      estado: 'sucesso',
      duracao: '2.5s',
      ficheirosProcessados: 38,
    },
    {
      key: '3',
      dataHora: '2026-06-07 13:53:05',
      estado: 'aviso',
      duracao: '4.8s',
      ficheirosProcessados: 52,
    },
    {
      key: '4',
      dataHora: '2026-06-07 13:38:00',
      estado: 'erro',
      duracao: '18.2s',
      ficheirosProcessados: 0,
    },
    {
      key: '5',
      dataHora: '2026-06-07 13:23:15',
      estado: 'sucesso',
      duracao: '2.1s',
      ficheirosProcessados: 41,
    },
  ];

  const performanceData = [
    { hora: '00:00', duracao: 2.1, ficheiros: 35 },
    { hora: '03:00', duracao: 2.3, ficheiros: 28 },
    { hora: '06:00', duracao: 2.5, ficheiros: 42 },
    { hora: '09:00', duracao: 3.2, ficheiros: 58 },
    { hora: '12:00', duracao: 2.8, ficheiros: 65 },
    { hora: '15:00', duracao: 2.4, ficheiros: 52 },
  ];

  const logs = `[2026-06-07 14:23:10] INFO: Iniciando fluxo de importação
[2026-06-07 14:23:11] INFO: Conectando ao SAP ERP
[2026-06-07 14:23:12] INFO: Autenticação bem-sucedida
[2026-06-07 14:23:12] INFO: Obtendo faturas do período
[2026-06-07 14:23:13] INFO: 45 faturas encontradas
[2026-06-07 14:23:13] INFO: Validando formato EDIFACT
[2026-06-07 14:23:14] INFO: Convertendo dados para formato interno
[2026-06-07 14:23:14] INFO: Enviando para Sistema Financeiro
[2026-06-07 14:23:15] INFO: Processamento concluído com sucesso
[2026-06-07 14:23:15] INFO: 45 ficheiros processados em 2.3s`;

  const historicoColumns = [
    {
      title: 'Data/Hora',
      dataIndex: 'dataHora',
      key: 'dataHora',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => {
        const config = {
          sucesso: { color: 'success', icon: <CheckCircleOutlined />, text: 'Sucesso' },
          aviso: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Aviso' },
          erro: { color: 'error', icon: <CloseCircleOutlined />, text: 'Erro' },
        };
        const { color, icon, text } = config[estado as keyof typeof config];
        return <Tag color={color} icon={icon}>{text}</Tag>;
      },
    },
    {
      title: 'Duração',
      dataIndex: 'duracao',
      key: 'duracao',
    },
    {
      title: 'Ficheiros Processados',
      dataIndex: 'ficheirosProcessados',
      key: 'ficheirosProcessados',
    },
  ];

  const tabItems = [
    {
      key: 'historico',
      label: (
        <span>
          <ClockCircleOutlined />
          Histórico de Execuções
        </span>
      ),
      children: (
        <Table
          columns={historicoColumns}
          dataSource={historico}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'logs',
      label: (
        <span>
          <SyncOutlined />
          Logs
        </span>
      ),
      children: (
        <Card>
          <pre
            style={{
              background: '#f5f5f5',
              padding: 16,
              borderRadius: 4,
              overflow: 'auto',
              maxHeight: 400,
              fontSize: 12,
              fontFamily: 'monospace',
            }}
          >
            {logs}
          </pre>
        </Card>
      ),
    },
    {
      key: 'estatisticas',
      label: (
        <span>
          <LineChartOutlined />
          Estatísticas
        </span>
      ),
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="Tempo Médio de Execução"
                  value={flowData.tempoMedio}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="Taxa de Sucesso"
                  value={flowData.taxaSucesso}
                  suffix="%"
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
                <Progress percent={flowData.taxaSucesso} strokeColor="#52c41a" />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="Execuções Hoje"
                  value={96}
                  prefix={<SyncOutlined />}
                />
              </Card>
            </Col>
          </Row>
          <Card title="Performance ao Longo do Dia" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="duracao"
                  stroke="#1890ff"
                  name="Duração (s)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ficheiros"
                  stroke="#52c41a"
                  name="Ficheiros"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{flowData.nome}</span>
              <Badge
                status={flowData.estado === 'sucesso' ? 'success' : 'error'}
                text={flowData.estado === 'sucesso' ? 'Operacional' : 'Com Problemas'}
              />
            </div>
          }
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Sistema Origem">{flowData.origem}</Descriptions.Item>
            <Descriptions.Item label="Sistema Destino">{flowData.destino}</Descriptions.Item>
            <Descriptions.Item label="Tipo EDI">{flowData.tipoEDI}</Descriptions.Item>
            <Descriptions.Item label="Frequência">{flowData.frequencia}</Descriptions.Item>
            <Descriptions.Item label="SLA Definido">{flowData.slaDefined}</Descriptions.Item>
            <Descriptions.Item label="Tempo Médio">{flowData.tempoMedio}</Descriptions.Item>
            <Descriptions.Item label="Última Execução">
              <Tag color="success" icon={<CheckCircleOutlined />}>
                {flowData.ultimaExecucao}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Próxima Execução">
              <Tag color="processing" icon={<ClockCircleOutlined />}>
                {flowData.proximaExecucao}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card>
          <Tabs items={tabItems} defaultActiveKey="historico" />
        </Card>
      </Space>
    </div>
  );
}
