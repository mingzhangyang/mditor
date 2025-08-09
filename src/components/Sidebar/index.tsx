import React from 'react'
import { Tabs, Card, Space, Typography, List, Button, Tag, Tooltip } from 'antd'
import {
  HistoryOutlined,
  BgColorsOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useTableStore } from '@/store'
import { useI18n } from '@/i18n'
import StylePanel from './StylePanel'
import HistoryPanel from './HistoryPanel'

import FilePanel from './FilePanel'

const { Title, Text } = Typography

const Sidebar: React.FC = () => {
  const { t } = useI18n()
  const { tableData, history, sidebarActiveTab, setSidebarActiveTab } = useTableStore()

  // 计算表格统计信息
  const stats = {
    rows: tableData.rows.length,
    columns: tableData.headers.length,
    cells: tableData.rows.length * tableData.headers.length,
    lastModified: history.past.length > 0 ? new Date(history.past[history.past.length - 1].timestamp || Date.now()).toLocaleString() : t('common.unknown') || '未知',
  }

  const tabItems = [
    {
      key: 'style',
      label: (
        <span>
          <BgColorsOutlined />
          {t('sidebar.style')}
        </span>
      ),
      children: <StylePanel />,
    },
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined />
          {t('sidebar.history')}
          {history.past.length > 0 && (
            <Tag style={{ marginLeft: 4 }}>
              {history.past.length}
            </Tag>
          )}
        </span>
      ),
      children: <HistoryPanel />,
    },
    {
      key: 'files',
      label: (
        <span>
          <FileTextOutlined />
          {t('sidebar.files')}
        </span>
      ),
      children: <FilePanel />,
    },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 表格信息概览 */}
      <Card 
        size="small" 
        style={{ margin: 16, marginBottom: 8 }}
        title={
          <Space>
            <FileTextOutlined />
            <span>{t('sidebar.tableInfo')}</span>
          </Space>
        }
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">{t('sidebar.rows')}:</Text>
            <Text strong>{stats.rows}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">{t('sidebar.columns')}:</Text>
            <Text strong>{stats.columns}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">{t('sidebar.cells')}:</Text>
            <Text strong>{stats.cells}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">{t('sidebar.lastModified')}:</Text>
            <Tooltip title={stats.lastModified}>
              <Text style={{ fontSize: 12, maxWidth: 120 }} ellipsis>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {stats.lastModified}
              </Text>
            </Tooltip>
          </div>
        </Space>
      </Card>

      {/* 标签页内容 */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Tabs
          activeKey={sidebarActiveTab}
          onChange={setSidebarActiveTab}
          items={tabItems}
          size="small"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          tabBarStyle={{ 
            margin: '0 16px',
            paddingTop: 8,
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  )
}

export default Sidebar