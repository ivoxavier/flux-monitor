import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Select, DatePicker, Space, theme, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, SyncOutlined, FileTextOutlined, ApiOutlined, CalendarOutlined } from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getTranslation } from '../../config/i18n';

const { RangePicker } = DatePicker;

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboardDate, setDashboardDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [recentFlows, setRecentFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const { token } = theme.useToken();
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const t = getTranslation().dashboardPage;

  const cardElevationStyle = {
    boxShadow: token.boxShadowSecondary,
    borderRadius: token.borderRadiusLG,
    border: 'none',                
  };

  const flowTrendData = [
    { hour: '00:00', flows: 12 }, { hour: '04:00', flows: 8 }, { hour: '08:00', flows: 45 },
    { hour: '12:00', flows: 67 }, { hour: '16:00', flows: 52 }, { hour: '20:00', flows: 34 },
  ];
  const fileProcessingData = [
    { day: 'Mon', files: 240 }, { day: 'Tue', files: 310 }, { day: 'Wed', files: 289 },
    { day: 'Thu', files: 320 }, { day: 'Fri', files: 295 }, { day: 'Sat', files: 180 }, { day: 'Sun', files: 145 },
  ];
  const errorDistributionData = [
    { name: 'Timeout', value: 12 }, { name: 'Invalid Layout', value: 8 }, { name: 'Connectivity', value: 5 }, { name: 'Auth Failure', value: 3 },
  ];
  const COLORS = ['#ff4d4f', '#ff7a45', '#ffa940', '#ffc53d'];

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const formattedDate = dashboardDate ? dashboardDate.format('YYYY-MM-DD') : '';
      const response = await fetch(`${baseUrl}/api/executions?status=${filterStatus}&limit=10&date=${formattedDate}`);
      if (!response.ok) throw new Error(t.messages.errLoad);
      const data = await response.json();
      setRecentFlows(data);
    } catch (err: any) {
      message.error(err.message || t.messages.errLoad);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, filterStatus, dashboardDate, t.messages.errLoad]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const columns = [
    {
      title: t.table.flowName,
      dataIndex: 'manifestName',
      key: 'manifestName',
      fixed: 'left' as const,
      width: 240,
      render: (text: string, record: any) => (
        <a onClick={() => navigate(`/flow/${record.key}`)}>{text}</a>
      ),
    },

    { title: t.table.holding, dataIndex: 'holding', key: 'holding', width: 100 },
    { title: t.table.department, dataIndex: 'department', key: 'department', width: 140 },
    { title: t.table.section, dataIndex: 'section', key: 'section', width: 120 }, // Campo Secção injetado
    { title: t.table.client, dataIndex: 'client', key: 'client', width: 140 },
    { title: t.table.sourceSystem, dataIndex: 'sourceSystem', key: 'sourceSystem', width: 140 },
    { title: t.table.targetSystem, dataIndex: 'targetSystem', key: 'targetSystem', width: 150 },
    
    // Telemetry Columns
    { title: t.table.filesReceived, dataIndex: 'receivedFiles', key: 'receivedFiles', width: 130, render: (val: number) => val > 0 ? <strong style={{ color: token.colorInfo }}>{val}</strong> : '-' },
    { title: t.table.filesProcessed, dataIndex: 'processedFiles', key: 'processedFiles', width: 140, render: (val: number) => val > 0 ? <strong style={{ color: token.colorSuccess }}>{val}</strong> : '-' },
    { title: t.table.httpSent, dataIndex: 'httpSent', key: 'httpSent', width: 120, render: (val: number) => val > 0 ? <span style={{ color: '#722ed1', fontWeight: 500 }}>{val}</span> : '-' },
    { title: t.table.httpReceived, dataIndex: 'httpReceived', key: 'httpReceived', width: 120, render: (val: number) => val > 0 ? <span style={{ color: '#eb2f96', fontWeight: 500 }}>{val}</span> : '-' },
    
    { title: t.table.lastExecution, dataIndex: 'timestamp', key: 'timestamp', width: 170 },
    { title: t.table.time, dataIndex: 'duration', key: 'duration', width: 100, render: (seconds: number) => `${seconds.toFixed(1)}s` },
    {
      title: t.table.status,
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => {
        const isSuccess = status.toLowerCase() === 'success';
        return (
          <Tag color={isSuccess ? 'success' : 'error'} icon={isSuccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
            {isSuccess ? t.status.success : t.status.error}
          </Tag>
        );
      },
    },
    {
      title: t.table.sla,
      dataIndex: 'status',
      key: 'sla',
      width: 130,
      render: (status: string) => {
        const isSuccess = status.toLowerCase() === 'success';
        return (
          <Tag color={isSuccess ? 'success' : 'error'}>
            {isSuccess ? t.sla.fulfilled : t.sla.notFulfilled}
          </Tag>
        );
      },
    },
  ];

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* Header Grid Control */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
          background: token.colorBgContainer, padding: '12px 16px', borderRadius: token.borderRadiusLG, boxShadow: token.boxShadowTertiary
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: token.colorTextHeading }}>{t.title}</h2>
            <span style={{ color: token.colorTextDescription, fontSize: '13px' }}>
              {t.subtitle}: <strong>{dashboardDate ? dashboardDate.format('DD/MM/YYYY') : 'All Logs'}</strong>
            </span>
          </div>
          <Space size="middle">
            <span style={{ color: token.colorTextDescription }}><CalendarOutlined /> {t.filterDay}:</span>
            <DatePicker value={dashboardDate} onChange={(date) => setDashboardDate(date)} format="DD/MM/YYYY" allowClear={false} style={{ width: 160 }} />
          </Space>
        </div>

        {/* Analytic Metrics Widgets */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}><Card style={cardElevationStyle}><Statistic title={t.stats.executedToday} value={218} prefix={<SyncOutlined />} valueStyle={{ color: '#3f8600' }} suffix={<ArrowUpOutlined style={{ fontSize: 14 }} />} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card style={cardElevationStyle}><Statistic title={t.stats.processedFiles} value={1892} prefix={<FileTextOutlined />} valueStyle={{ color: '#1890ff' }} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card style={cardElevationStyle}><Statistic title={t.stats.httpSent} value={456} prefix={<ApiOutlined />} valueStyle={{ color: '#722ed1' }} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card style={cardElevationStyle}><Statistic title={t.stats.httpReceived} value={789} prefix={<ApiOutlined />} valueStyle={{ color: '#eb2f96' }} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card style={cardElevationStyle}><Statistic title={t.stats.flowsError} value={28} prefix={<CloseCircleOutlined />} valueStyle={{ color: '#cf1322' }} suffix={<ArrowDownOutlined style={{ fontSize: 14 }} />} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card style={cardElevationStyle}><Statistic title={t.stats.activeAlerts} value={12} prefix={<WarningOutlined />} valueStyle={{ color: '#faad14' }} /></Card></Col>
        </Row>

        {/* Charts Layout Context */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={t.charts.hourlyTrend} style={cardElevationStyle}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={flowTrendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="hour" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="flows" stroke="#1890ff" strokeWidth={2} /></LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={t.charts.dailyProcessing} style={cardElevationStyle}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fileProcessingData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Legend /><Bar dataKey="files" fill="#52c41a" /></BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Filtering Configuration Blocks */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={t.charts.errorDistribution} style={cardElevationStyle}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={errorDistributionData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                    {errorDistributionData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={t.charts.quickFilters} style={cardElevationStyle}>
              <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'flex-start', gap: 12 }}>
                <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 140 }}>
                  <Select.Option value="all">{t.placeholders.all}</Select.Option>
                  <Select.Option value="success">{t.status.success}</Select.Option>
                  <Select.Option value="failed">{t.status.error}</Select.Option>
                </Select>
              </Space>
              <p style={{ color: token.colorTextDescription }}>{t.charts.quickFiltersDesc}</p>
            </Card>
          </Col>
        </Row>

        {/* Primary Density Data Frame */}
        <Card title={t.tableTitle} style={cardElevationStyle}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space wrap>
              <RangePicker />
              <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 140 }}>
                <Select.Option value="all">{t.placeholders.all}</Select.Option>
                <Select.Option value="success">{t.status.success}</Select.Option>
                <Select.Option value="failed">{t.status.error}</Select.Option>
              </Select>
            </Space>
            {}
            <Table columns={columns} dataSource={recentFlows} loading={loading} pagination={{ pageSize: 5 }} scroll={{ x: 2250 }} />
          </Space>
        </Card>

      </Space>
    </div>
  );
}