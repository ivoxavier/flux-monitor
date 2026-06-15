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
  const { token } = theme.useToken();
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const t = getTranslation().dashboardPage;

  // Estados de Filtros e Controlos Dinâmicos
  const [dashboardDate, setDashboardDate] = useState<dayjs.Dayjs>(dayjs());
  const [tableDateRange, setTableDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Estados de Dados Hidratados via API Real
  const [recentFlows, setRecentFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>({
    widgets: { executedToday: 0, processedFiles: 0, httpSent: 0, httpReceived: 0, flowsError: 0, activeAlerts: 0 },
    hourlyTrend: [],
    errorDistribution: []
  });

  const cardElevationStyle = {
    boxShadow: token.boxShadowSecondary,
    borderRadius: token.borderRadiusLG,
    border: 'none',                
  };

  const COLORS = ['#ff4d4f', '#ff7a45', '#ffa940', '#ffc53d'];

  // 1. Carregar Métricas e Gráficos Conforme o DatePicker Superior
  const loadAnalyticsData = useCallback(async () => {
    try {
      const formattedDate = dashboardDate.format('YYYY-MM-DD');
      const response = await fetch(`${baseUrl}/api/executions/analytics?date=${formattedDate}`);
      if (!response.ok) throw new Error("Could not pull engine performance analytics aggregates.");
      const data = await response.json();
      setAnalytics({
        widgets: data.widgets,
        hourlyTrend: data.hourlyTrend,
        errorDistribution: data.errorDistribution
      });
    } catch (err: any) {
      message.error(err.message);
    }
  }, [baseUrl, dashboardDate]);

  // 2. Carregar Lista de Linhas da Tabela (Considera Range de Datas e Status)
  const loadTableData = useCallback(async () => {
    setLoading(true);
    try {
      let queryUrl = `${baseUrl}/api/executions?status=${filterStatus}&limit=20`;
      
      if (tableDateRange) {
        queryUrl += `&startDate=${tableDateRange[0].format('YYYY-MM-DD')}&endDate=${tableDateRange[1].format('YYYY-MM-DD')}`;
      } else {
        queryUrl += `&date=${dashboardDate.format('YYYY-MM-DD')}`;
      }

      const response = await fetch(queryUrl);
      if (!response.ok) throw new Error(t.messages.errLoad);
      const data = await response.json();
      setRecentFlows(data);
    } catch (err: any) {
      message.error(err.message || t.messages.errLoad);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, filterStatus, dashboardDate, tableDateRange, t.messages.errLoad]);

  useEffect(() => {
    loadAnalyticsData();
    loadTableData();
  }, [loadAnalyticsData, loadTableData]);

  // Mock auxiliar fixo para volumetria semanal fixa (Requisitos Recharts)
  const fileProcessingData = [
    { day: 'Mon', files: 240 }, { day: 'Tue', files: 310 }, { day: 'Wed', files: 289 },
    { day: 'Thu', files: 320 }, { day: 'Fri', files: 295 }, { day: 'Sat', files: 180 }, { day: 'Sun', files: 145 },
  ];

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
    { title: t.table.section, dataIndex: 'section', key: 'section', width: 120 },
    { title: t.table.client, dataIndex: 'client', key: 'client', width: 140 },
    { title: t.table.sourceSystem, dataIndex: 'sourceSystem', key: 'sourceSystem', width: 140 },
    { title: t.table.targetSystem, dataIndex: 'targetSystem', key: 'targetSystem', width: 150 },
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
              {t.subtitle}: <strong>{dashboardDate.format('DD/MM/YYYY')}</strong>
            </span>
          </div>
          <Space size="middle">
            <span style={{ color: token.colorTextDescription }}><CalendarOutlined /> {t.filterDay}:</span>
            <DatePicker value={dashboardDate} onChange={(date) => date && setDashboardDate(date)} format="DD/MM/YYYY" allowClear={false} style={{ width: 160 }} />
          </Space>
        </div>

        {/* Analytic Metrics Widgets (Lendo da API real) */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}><Card style={cardElevationStyle}><Statistic title={t.stats.executedToday} value={analytics.widgets.executedToday} prefix={<SyncOutlined />} valueStyle={{ color: '#3f8600' }} suffix={<ArrowUpOutlined style={{ fontSize: 14 }} />} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card style={cardElevationStyle}><Statistic title={t.stats.processedFiles} value={analytics.widgets.processedFiles} prefix={<FileTextOutlined />} valueStyle={{ color: '#1890ff' }} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card style={cardElevationStyle}><Statistic title={t.stats.httpSent} value={analytics.widgets.httpSent} prefix={<ApiOutlined />} valueStyle={{ color: '#722ed1' }} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card style={cardElevationStyle}><Statistic title={t.stats.httpReceived} value={analytics.widgets.httpReceived} prefix={<ApiOutlined />} valueStyle={{ color: '#eb2f96' }} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card style={cardElevationStyle}><Statistic title={t.stats.flowsError} value={analytics.widgets.flowsError} prefix={<CloseCircleOutlined />} valueStyle={{ color: '#cf1322' }} suffix={<ArrowDownOutlined style={{ fontSize: 14 }} />} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card style={cardElevationStyle}><Statistic title={t.stats.activeAlerts} value={analytics.widgets.activeAlerts} prefix={<WarningOutlined />} valueStyle={{ color: '#faad14' }} /></Card></Col>
        </Row>

        {/* Charts Layout Context */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={t.charts.hourlyTrend} style={cardElevationStyle}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.hourlyTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="hour" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="flows" stroke={token.colorPrimary} strokeWidth={2} /></LineChart>
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
                  <Pie data={analytics.errorDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                    {analytics.errorDistribution.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
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
              {/* 🟢 RangePicker Conectado ao Estado tableDateRange */}
              <RangePicker 
                value={tableDateRange} 
                onChange={(dates) => setTableDateRange(dates ? [dates[0]!, dates[1]!] : null)} 
                format="DD/MM/YYYY"
              />
              <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 140 }}>
                <Select.Option value="all">{t.placeholders.all}</Select.Option>
                <Select.Option value="success">{t.status.success}</Select.Option>
                <Select.Option value="failed">{t.status.error}</Select.Option>
              </Select>
            </Space>
            <Table columns={columns} dataSource={recentFlows} loading={loading} pagination={{ pageSize: 5 }} scroll={{ x: 2250 }} />
          </Space>
        </Card>

      </Space>
    </div>
  );
}