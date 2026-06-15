import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Tag, Button, Space, Select, Badge, Descriptions, Modal, Timeline, theme, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, HistoryOutlined, ReloadOutlined, RobotOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function MonitoringPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<any[]>([]); // 🟢 Estado real da API
  const [loading, setLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  
  // Filtros sincronizados com os parâmetros da tua API C#
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const { token } = theme.useToken();
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const cardElevationStyle = {
    boxShadow: token.boxShadowSecondary,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };


  const loadAlertsData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/alerts?status=${filterStatus}&severity=${filterSeverity}`);
      if (!response.ok) throw new Error("Failed to download operational alerts from core infrastructure.");
      const data = await response.json();
      setAlerts(data);
    } catch (err: any) {
      message.error(err.message || "An unexpected network error occurred while polling alerts.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, filterStatus, filterSeverity]);

  useEffect(() => {
    loadAlertsData();
  }, [loadAlertsData]);


  const handleResolveAlert = async (id: string) => {
    try {
      const response = await fetch(`${baseUrl}/api/alerts/${id}/resolve`, { method: 'PUT' });
      if (!response.ok) throw new Error("Could not update target operational alert status.");
      message.success("Operational incident successfully resolved.");
      loadAlertsData(); 
    } catch (err: any) {
      message.error(err.message);
    }
  };


  const handleReopenAlert = async (id: string) => {
    try {
      const response = await fetch(`${baseUrl}/api/alerts/${id}/reopen`, { method: 'PUT' });
      if (!response.ok) throw new Error("Could not restore alert status back to active state.");
      message.success("Alert context successfully re-opened for engineering analysis.");
      loadAlertsData();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleViewHistory = (record: any) => {
    setSelectedAlert(record);
    setHistoryModalVisible(true);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: '#ff4d4f',
      high: '#ff7a45',
      warning: '#faad14',
      low: '#52c41a',
    };
    return colors[severity as keyof typeof colors] || '#d9d9d9';
  };

  const getSeverityTag = (severity: string) => {
    const config = {
      critical: { color: 'error', text: 'CRITICAL' },
      high: { color: 'error', text: 'HIGH' },
      warning: { color: 'warning', text: 'WARNING' },
      low: { color: 'success', text: 'LOW' },
    };
    const mapped = config[severity as keyof typeof config] || { color: 'default', text: 'UNKNOWN' };
    return <Tag color={mapped.color}>{mapped.text}</Tag>;
  };

  const columns = [
    {
      title: '',
      dataIndex: 'severity',
      key: 'indicator',
      width: 10,
      render: (severity: string) => (
        <div
          style={{
            width: 4,
            height: 40,
            background: getSeverityColor(severity),
            borderRadius: 2,
          }}
        />
      ),
    },
    {
      title: 'Pipeline / Flow context',
      dataIndex: 'flowName',
      key: 'flowName',
      render: (text: string, record: any) => (
        <a onClick={() => navigate(`/flow/${record.key}`)}>{text}</a>
      ),
    },
    {
      title: 'Alert Target Type',
      dataIndex: 'alertType',
      key: 'alertType',
    },
    {
      title: 'Timestamp Trace',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: 'Severity SLA',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => getSeverityTag(severity),
    },
    {
      title: 'Lifecycle Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const isCurrent = status.toLowerCase() === 'active';
        return (
          <Tag color={isCurrent ? 'error' : 'success'} icon={isCurrent ? <WarningOutlined /> : <CheckCircleOutlined />}>
            {isCurrent ? 'Active' : 'Resolved'}
          </Tag>
        );
      },
    },
    {
      title: 'Triggered Automated Tasks',
      dataIndex: 'triggeredAutomatedActions',
      key: 'triggeredAutomatedActions',
      render: (actions: string[]) => {
        if (!actions || actions.length === 0) {
          return <Tag color="default">None</Tag>;
        }
        return (
          <Space size={4} wrap>
            {actions.map((action) => (
              <Tag key={action} color="purple" icon={<RobotOutlined />}>
                {action}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => {
        const isActive = record.status.toLowerCase() === 'active';
        return (
          <Space>
            {isActive ? (
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleResolveAlert(record.key)}
              >
                Resolve
              </Button>
            ) : (
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => handleReopenAlert(record.key)}
              >
                Reopen
              </Button>
            )}
            <Button
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record)}
            >
              Audit Trail
            </Button>
          </Space>
        );
      },
    },
  ];

  // 🟢 CORREÇÃO: Contadores agora calculados a partir dos dados reais mapeados da API
  const activeAlertsCount = alerts.filter(a => a.status.toLowerCase() === 'active').length;
  const criticalAlertsCount = alerts.filter(a => a.severity.toLowerCase() === 'critical' && a.status.toLowerCase() === 'active').length;
  const resolvedCount = alerts.filter(a => a.status.toLowerCase() === 'resolved').length;

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* Real Operational Counter Dashlets */}
        <div style={{ display: 'flex', gap: 16 }}>
          <Card style={{ flex: 1, ...cardElevationStyle }}>
            <Badge count={activeAlertsCount} showZero>
              <WarningOutlined style={{ fontSize: 32, color: '#faad14' }} />
            </Badge>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>{activeAlertsCount}</div>
              <div style={{ color: token.colorTextDescription }}>Active Incidents</div>
            </div>
          </Card>
          <Card style={{ flex: 1, ...cardElevationStyle }}>
            <Badge count={criticalAlertsCount} showZero>
              <CloseCircleOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
            </Badge>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>{criticalAlertsCount}</div>
              <div style={{ color: token.colorTextDescription }}>Critical Breaches</div>
            </div>
          </Card>
          <Card style={{ flex: 1, ...cardElevationStyle }}>
            <Badge count={resolvedCount} showZero>
              <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
            </Badge>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>{resolvedCount}</div>
              <div style={{ color: token.colorTextDescription }}>Resolved Incidents</div>
            </div>
          </Card>
        </div>

        {}
        <Card
          title="Infrastructure Systems Monitoring & Alerts"
          style={cardElevationStyle}
          extra={
            <Space>
              <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 150 }}>
                <Select.Option value="all">All Logs</Select.Option>
                <Select.Option value="active">Active State Only</Select.Option>
                <Select.Option value="resolved">Resolved Audits Only</Select.Option>
              </Select>
              <Select value={filterSeverity} onChange={setFilterSeverity} style={{ width: 150 }}>
                <Select.Option value="all">All Severities</Select.Option>
                <Select.Option value="critical">Critical</Select.Option>
                <Select.Option value="warning">Warning</Select.Option>
                <Select.Option value="low">Low Priority</Select.Option>
              </Select>
            </Space>
          }
        >
          {/* 🟢 CORREÇÃO: dataSource agora aponta estritamente para o array real 'alerts' e inclui o estado de loading do fetch */}
          <Table columns={columns} dataSource={alerts} loading={loading} pagination={{ pageSize: 10 }} />
        </Card>
      </Space>

      {/* Audit Trail Modal Panel */}
      <Modal
        title="Incident Historical Verification Logs"
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHistoryModalVisible(false)}>
            Close Inspection View
          </Button>,
        ]}
        width={720}
      >
        {selectedAlert && (
          <>
            <Descriptions bordered column={2} size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label="Target Flow" span={2}>{selectedAlert.flowName}</Descriptions.Item>
              <Descriptions.Item label="Incident Type">{selectedAlert.alertType}</Descriptions.Item>
              <Descriptions.Item label="Severity Level">{getSeverityTag(selectedAlert.severity)}</Descriptions.Item>
              <Descriptions.Item label="Timestamp Trace" span={2}>{selectedAlert.timestamp}</Descriptions.Item>
              
              <Descriptions.Item label="Autonomous Systems Executions" span={2}>
                {selectedAlert.triggeredAutomatedActions && selectedAlert.triggeredAutomatedActions.length > 0 ? (
                  <Space size={4}>
                    {selectedAlert.triggeredAutomatedActions.map((action: string) => (
                      <Tag color="purple" icon={<RobotOutlined />} key={action}>{action}</Tag>
                    ))}
                  </Space>
                ) : (
                  <span style={{ color: token.colorTextDescription }}>No automated webhook actions triggered for this incident context.</span>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Exception / Failure Stack Trace Log" span={2}>
                <pre style={{ 
                  margin: 0, padding: '8px', background: token.colorFillAlter, 
                  borderRadius: token.borderRadiusSM, fontFamily: 'monospace', fontSize: '12px',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all'
                }}>
                  {selectedAlert.description}
                </pre>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <h4>Infrastructure Automation Timeline</h4>
              <Timeline
                items={[
                  {
                    color: 'red',
                    children: `${selectedAlert.timestamp} - Automated core validation routine triggered an incident event entry.`,
                  },
                  ...(selectedAlert.triggeredAutomatedActions && selectedAlert.triggeredAutomatedActions.length > 0
                    ? selectedAlert.triggeredAutomatedActions.map((action: string) => ({
                        color: 'purple',
                        children: `${selectedAlert.timestamp} - Dispatched integration script notification callback successfully: [${action}].`,
                      }))
                    : [])
                  ,
                  {
                    color: 'gray',
                    children: `${selectedAlert.timestamp} - Raw stack trace logs exported into verification storage node context.`,
                  },
                  ...(selectedAlert.status.toLowerCase() === 'resolved'
                    ? [{
                        color: 'green',
                        children: `${selectedAlert.timestamp} - Operational state flagged as resolved. Core channel telemetry flow recovered.`,
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