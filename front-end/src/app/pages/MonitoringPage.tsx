import { useState } from 'react';
import { Card, Table, Tag, Button, Space, Select, Badge, Descriptions, Modal, Timeline, theme, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, HistoryOutlined, ReloadOutlined, RobotOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function MonitoringPage() {
  const navigate = useNavigate();
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const { token } = theme.useToken();

  const cardElevationStyle = {
    boxShadow: token.boxShadowSecondary,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  // Mock de dados atualizado com o registo de ações automáticas disparadas pelo motor do sistema
  const alertas = [
    {
      key: '1',
      fluxo: 'Importação Faturas SAP',
      tipoAlerta: 'SLA Excedido',
      dataHora: '2026-06-07 14:15:00',
      severidade: 'critica',
      estado: 'ativo',
      responsavel: 'João Silva',
      descricao: 'Fluxo excedeu o tempo máximo de execução definido (5 min)',
      acoesAutomatizadas: ['Email Enviado'], // Lista de ações disparadas
    },
    {
      key: '2',
      fluxo: 'Sincronização Stock',
      tipoAlerta: 'Tempo de Resposta Alto',
      dataHora: '2026-06-07 13:45:30',
      severidade: 'aviso',
      estado: 'ativo',
      responsavel: 'Maria Santos',
      descricao: 'Tempo de processamento acima do esperado (12.4s vs 8s)',
      acoesAutomatizadas: [], // Nenhuma ação automática configurada
    },
    {
      key: '3',
      fluxo: 'Integração CRM',
      tipoAlerta: 'Falha na Execução',
      dataHora: '2026-06-07 13:20:15',
      severidade: 'critica',
      estado: 'resolvido',
      responsavel: 'Pedro Costa',
      descricao: 'Erro de autenticação ao conectar com o Salesforce',
      acoesAutomatizadas: ['Email Enviado', 'Webhook Teams'], // Múltiplas ações disparadas
    },
    {
      key: '4',
      fluxo: 'Exportação Encomendas',
      tipoAlerta: 'Ficheiro não Processado',
      dataHora: '2026-06-07 12:50:00',
      severidade: 'aviso',
      estado: 'ativo',
      responsavel: 'Ana Oliveira',
      descricao: '3 ficheiros na fila de espera há mais de 30 minutos',
      acoesAutomatizadas: ['Webhook Teams'],
    },
    {
      key: '5',
      fluxo: 'Atualização Clientes',
      tipoAlerta: 'Frequência não Cumprida',
      dataHora: '2026-06-07 11:30:00',
      severidade: 'alta',
      estado: 'resolvido',
      responsavel: 'Carlos Ferreira',
      descricao: 'Fluxo não executou dentro da frequência esperada (2h)',
      acoesAutomatizadas: ['Email Enviado'],
    },
  ];

  const getSeverityColor = (severidade: string) => {
    const colors = {
      critica: '#ff4d4f',
      alta: '#ff7a45',
      aviso: '#faad14',
      baixa: '#52c41a',
    };
    return colors[severidade as keyof typeof colors] || '#d9d9d9';
  };

  const getSeverityTag = (severidade: string) => {
    const config = {
      critica: { color: 'error', text: 'CRÍTICA' },
      alta: { color: 'error', text: 'ALTA' },
      aviso: { color: 'warning', text: 'AVISO' },
      baixa: { color: 'success', text: 'BAIXA' },
    };
    const { color, text } = config[severidade as keyof typeof config];
    return <Tag color={color}>{text}</Tag>;
  };

  const handleViewHistory = (record: any) => {
    setSelectedAlert(record);
    setHistoryModalVisible(true);
  };

  const columns = [
    {
      title: '',
      dataIndex: 'severidade',
      key: 'indicator',
      width: 10,
      render: (severidade: string) => (
        <div
          style={{
            width: 4,
            height: 40,
            background: getSeverityColor(severidade),
            borderRadius: 2,
          }}
        />
      ),
    },
    {
      title: 'Fluxo',
      dataIndex: 'fluxo',
      key: 'fluxo',
      render: (text: string, record: any) => (
        <a onClick={() => navigate(`/flow/${record.key}`)}>{text}</a>
      ),
    },
    {
      title: 'Tipo de Alerta',
      dataIndex: 'tipoAlerta',
      key: 'tipoAlerta',
    },
    {
      title: 'Data/Hora',
      dataIndex: 'dataHora',
      key: 'dataHora',
    },
    {
      title: 'Severidade',
      dataIndex: 'severidade',
      key: 'severidade',
      render: (severidade: string) => getSeverityTag(severidade),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => {
        const config = {
          ativo: { color: 'error', icon: <WarningOutlined />, text: 'Ativo' },
          resolvido: { color: 'success', icon: <CheckCircleOutlined />, text: 'Resolvido' },
        };
        const { color, icon, text } = config[estado as keyof typeof config];
        return <Tag color={color} icon={icon}>{text}</Tag>;
      },
    },
    // COLUNA NOVA: Exibe rapidamente o sumário das ações do robô/sistema na tabela
    {
      title: 'Ação Automática',
      dataIndex: 'acoesAutomatizadas',
      key: 'acoesAutomatizadas',
      render: (acoes: string[]) => {
        if (!acoes || acoes.length === 0) {
          return <Tag color="default">Nenhuma</Tag>;
        }
        return (
          <Space size={4} wrap>
            {acoes.map((acao) => (
              <Tag key={acao} color="purple" icon={<RobotOutlined />}>
                {acao}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Responsável',
      dataIndex: 'responsavel',
      key: 'responsavel',
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_: any, record: any) => (
        <Space>
          {record.estado === 'ativo' ? (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => console.log('Resolver:', record.key)}
            >
              Resolver
            </Button>
          ) : (
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => console.log('Reabrir:', record.key)}
            >
              Reabrir
            </Button>
          )}
          <Button
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => handleViewHistory(record)}
          >
            Histórico
          </Button>
        </Space>
      ),
    },
  ];

  const activeAlertsCount = alertas.filter(a => a.estado === 'ativo').length;
  const criticalAlertsCount = alertas.filter(a => a.severidade === 'critica' && a.estado === 'ativo').length;

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* Painel de Indicadores */}
        <div style={{ display: 'flex', gap: 16 }}>
          <Card style={{ flex: 1, ...cardElevationStyle }}>
            <Badge count={activeAlertsCount} showZero>
              <WarningOutlined style={{ fontSize: 32, color: '#faad14' }} />
            </Badge>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>{activeAlertsCount}</div>
              <div style={{ color: token.colorTextDescription }}>Alertas Ativos</div>
            </div>
          </Card>
          <Card style={{ flex: 1, ...cardElevationStyle }}>
            <Badge count={criticalAlertsCount} showZero>
              <CloseCircleOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
            </Badge>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>{criticalAlertsCount}</div>
              <div style={{ color: token.colorTextDescription }}>Alertas Críticos</div>
            </div>
          </Card>
          <Card style={{ flex: 1, ...cardElevationStyle }}>
            <Badge count={alertas.filter(a => a.estado === 'resolvido').length} showZero>
              <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
            </Badge>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                {alertas.filter(a => a.estado === 'resolvido').length}
              </div>
              <div style={{ color: token.colorTextDescription }}>Resolvidos Hoje</div>
            </div>
          </Card>
        </div>

        {/* Tabela de Dados */}
        <Card
          title="Monitorização e Alertas"
          style={cardElevationStyle}
          extra={
            <Space>
              <Select placeholder="Filtrar por Estado" style={{ width: 150 }}>
                <Select.Option value="todos">Todos</Select.Option>
                <Select.Option value="ativo">Ativos</Select.Option>
                <Select.Option value="resolvido">Resolvidos</Select.Option>
              </Select>
              <Select placeholder="Severidade" style={{ width: 150 }}>
                <Select.Option value="todos">Todos</Select.Option>
                <Select.Option value="critica">Crítica</Select.Option>
                <Select.Option value="alta">Alta</Select.Option>
                <Select.Option value="aviso">Aviso</Select.Option>
                <Select.Option value="baixa">Baixa</Select.Option>
              </Select>
            </Space>
          }
        >
          <Table columns={columns} dataSource={alertas} pagination={{ pageSize: 10 }} />
        </Card>
      </Space>

      {/* Painel do Histórico Expandido */}
      <Modal
        title="Histórico e Auditoria do Alerta"
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHistoryModalVisible(false)}>
            Fechar
          </Button>,
        ]}
        width={720}
      >
        {selectedAlert && (
          <>
            <Descriptions bordered column={2} size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label="Fluxo" span={2}>{selectedAlert.fluxo}</Descriptions.Item>
              <Descriptions.Item label="Tipo">{selectedAlert.tipoAlerta}</Descriptions.Item>
              <Descriptions.Item label="Severidade">{getSeverityTag(selectedAlert.severidade)}</Descriptions.Item>
              <Descriptions.Item label="Data/Hora">{selectedAlert.dataHora}</Descriptions.Item>
              <Descriptions.Item label="Responsável">{selectedAlert.responsavel}</Descriptions.Item>
              
              {/* CAMPO NOVO: Exibe as ações automatizadas no painel descritivo */}
              <Descriptions.Item label="Ações Autónomas" span={2}>
                {selectedAlert.acoesAutomatizadas && selectedAlert.acoesAutomatizadas.length > 0 ? (
                  <Space size={4}>
                    {selectedAlert.acoesAutomatizadas.map((acao: string) => (
                      <Tag color="purple" icon={<RobotOutlined />} key={acao}>{acao}</Tag>
                    ))}
                  </Space>
                ) : (
                  <span style={{ color: token.colorTextDescription }}>Nenhuma ação automática disparada</span>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Descrição" span={2}>{selectedAlert.descricao}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <h4>Timeline de Eventos de Infraestrutura</h4>
              <Timeline
                items={[
                  {
                    color: 'red',
                    children: `${selectedAlert.dataHora} - Alerta gerado automaticamente pelo motor FluxMonitor.`,
                  },
                  // ITEM DINÂMICO NA TIMELINE: Mostra o histórico detalhado da execução do robô
                  ...(selectedAlert.acoesAutomatizadas && selectedAlert.acoesAutomatizadas.length > 0
                    ? selectedAlert.acoesAutomatizadas.map((acao: string) => ({
                        color: 'purple',
                        children: `${selectedAlert.dataHora} - Ação automática executada com sucesso: [${acao}].`,
                      }))
                    : [])
                  ,
                  {
                    color: 'blue',
                    children: `${selectedAlert.dataHora} - Incidente atribuído ao operador ${selectedAlert.responsavel} para triagem manual.`,
                  },
                  {
                    color: 'gray',
                    children: `${selectedAlert.dataHora} - Logs sob análise técnica.`,
                  },
                  ...(selectedAlert.estado === 'resolvido'
                    ? [{
                        color: 'green',
                        children: `${selectedAlert.dataHora} - Marcado como resolvido. Fluxo normalizado.`,
                      }]
                    : []),
                ]}
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}