import { useState, useEffect, useCallback } from 'react';
import { Card, Descriptions, Table, Tag, Tabs, Badge, Progress, Space, Statistic, Row, Col, theme, Spin, message, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SyncOutlined, LineChartOutlined, FileTextOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useParams } from 'react-router-dom';

export default function FlowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = theme.useToken();

  const [loading, setLoading] = useState(true);
  const [flowData, setFlowData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedExecutionLogs, setSelectedExecutionLogs] = useState<string>("Select an execution from the history table to inspect its runtime stack trace logs.");

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const cardElevationStyle = {
    boxShadow: token.boxShadowSecondary,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };


  const loadPipelineDetails = useCallback(async () => {
    setLoading(true);
    try {
      const resDetail = await fetch(`${baseUrl}/api/manifests/${id}/detail`);
      if (!resDetail.ok) throw new Error("Could not retrieve pipeline configuration parameters.");
      const dataDetail = await resDetail.json();
      setFlowData(dataDetail);

      const resHistory = await fetch(`${baseUrl}/api/manifests/${id}/execution-history`);
      if (!resHistory.ok) throw new Error("Could not retrieve pipeline execution runtime logs.");
      const dataHistory = await resHistory.json();
      setHistory(dataHistory);


      if (dataHistory.length > 0) {
        setSelectedExecutionLogs(dataHistory[0].errorLog || "Execution completed successfully with no exceptions.");
      }
    } catch (err: any) {
      message.error(err.message || "An error occurred while calling the orchestration API data streams.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, id]);

  useEffect(() => {
    loadPipelineDetails();
  }, [loadPipelineDetails]);

  const historicoColumns = [
    {
      title: 'Execution Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: 'Lifecycle Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = {
          success: { color: 'success', icon: <CheckCircleOutlined />, text: 'Success' },
          running: { color: 'processing', icon: <SyncOutlined spin />, text: 'Running' },
          failed: { color: 'error', icon: <CloseCircleOutlined />, text: 'Failed' },
        };
        const mapped = config[status as keyof typeof config] || { color: 'default', icon: <ClockCircleOutlined />, text: status };
        return <Tag color={mapped.color} icon={mapped.icon}>{mapped.text}</Tag>;
      },
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Processed Files Count',
      dataIndex: 'processedFiles',
      key: 'processedFiles',
    },
    {
      title: 'Inspection',
      key: 'inspect',
      render: (_: any, record: any) => (
        <Button 
          size="small" 
          icon={<FileTextOutlined />} 
          onClick={() => setSelectedExecutionLogs(record.errorLog)}
        >
          Inspect Logs
        </Button>
      ),
    },
  ];

  // Inverte a cronologia do array para renderizar o gráfico do passado em direção ao presente
  const chartData = [...history]
    .reverse()
    .map(h => ({
      time: h.timestamp.includes(' ') ? h.timestamp.split(' ')[1] : h.timestamp, 
      duration: h.durationRaw,
      files: h.processedFiles
    }));

  const tabItems = [
    {
      key: 'historico',
      label: (
        <span>
          <ClockCircleOutlined />
          Execution History
        </span>
      ),
      children: (
        <Table
          columns={historicoColumns}
          dataSource={history}
          pagination={{ pageSize: 5 }}
        />
      ),
    },
    {
      key: 'logs',
      label: (
        <span>
          <FileTextOutlined />
          Runtime Diagnostics Log
        </span>
      ),
      children: (
        <Card style={cardElevationStyle}>
          <pre
            style={{
              background: token.colorFillAlter, 
              color: token.colorText,
              padding: 16,
              borderRadius: token.borderRadiusSM,
              overflow: 'auto',
              maxHeight: 400,
              fontSize: 12,
              fontFamily: 'monospace',
              border: `1px solid ${token.colorBorderSecondary}`,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            {selectedExecutionLogs}
          </pre>
        </Card>
      ),
    },
    {
      key: 'estatisticas',
      label: (
        <span>
          <LineChartOutlined />
          Performance Metrics Analytics
        </span>
      ),
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card style={cardElevationStyle}>
                <Statistic
                  title="Average Runtime Duration"
                  value={flowData?.avgDuration || 'N/A'}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardElevationStyle}>
                <Statistic
                  title="Pipeline Success Rate"
                  value={flowData?.successRate || 0}
                  suffix="%"
                  valueStyle={{ color: token.colorSuccessText }}
                  prefix={<CheckCircleOutlined />}
                />
                <Progress percent={flowData?.successRate || 0} strokeColor={token.colorSuccess} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardElevationStyle}>
                <Statistic
                  title="Total Executions Today"
                  value={flowData?.totalExecutionsToday || 0}
                  prefix={<SyncOutlined />}
                />
              </Card>
            </Col>
          </Row>
          <Card title="SLA Trend Timeline (Last 30 cycles)" style={cardElevationStyle}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" label={{ value: 'Duration (s)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Files Count', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="duration"
                  stroke={token.colorPrimary}
                  name="Duration (Seconds)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="files"
                  stroke={token.colorSuccess}
                  name="Processed File Volumetrics"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', marginTop: '10%' }}>
        <Spin size="large" tip="Mapping pipeline database orchestration streams..." />
      </div>
    );
  }

  const isOperational = flowData?.status === 'operational';

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Card Principal de Detalhes */}
        <Card
          style={cardElevationStyle}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '18px', fontWeight: 600 }}>{flowData?.name}</span>
              <Badge
                status={isOperational ? 'success' : 'error'}
                text={isOperational ? 'Operational Cluster' : 'Service Disrupted'}
              />
            </div>
          }
        >
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Source Integration System">{flowData?.source}</Descriptions.Item>
            <Descriptions.Item label="Destination Target Subsystem">{flowData?.destination}</Descriptions.Item>
            <Descriptions.Item label="EDI Context / File Spec Type">{flowData?.ediType}</Descriptions.Item>
            <Descriptions.Item label="Target Calendar Frequency">{flowData?.frequency}</Descriptions.Item>
            <Descriptions.Item label="Configured SLA Threshold Bounds">{flowData?.slaDefined}</Descriptions.Item>
            <Descriptions.Item label="Calculated Historical Mean Time">{flowData?.avgDuration}</Descriptions.Item>
            <Descriptions.Item label="Last Integration Heartbeat">
              <Tag color="success" icon={<CheckCircleOutlined />}>
                {flowData?.lastExecutionTime}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Next Expected Heartbeat Run">
              <Tag color="processing" icon={<ClockCircleOutlined />}>
                {flowData?.nextExecutionTime}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {}
        <Card style={cardElevationStyle}>
          <Tabs items={tabItems} defaultActiveKey="historico" />
        </Card>
      </Space>
    </div>
  );
}