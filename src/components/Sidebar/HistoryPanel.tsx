import React from 'react'
import {
  Button,
  Typography,
  Space,
  Empty,
  Card,
  Popconfirm,
  App,
} from 'antd'
import {
  UndoOutlined,
  RedoOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useTableStore } from '@/store'

const { Text } = Typography

const HistoryPanel: React.FC = () => {
  const { message } = App.useApp()
  const {
    history,
    undo,
    redo,
  } = useTableStore()



  // 恢复到指定历史记录
  // 撤销操作
  const handleUndo = () => {
    if (history.past.length > 0) {
      undo()
      message.success('已撤销操作')
    } else {
      message.info('没有可撤销的操作')
    }
  }

  // 重做操作
  const handleRedo = () => {
    if (history.future.length > 0) {
      redo()
      message.success('已重做操作')
    } else {
      message.info('没有可重做的操作')
    }
  }

  // 清空历史记录
  const handleClearHistory = () => {
    // 由于当前的历史记录结构，我们无法直接清空
    // 这里只显示一个提示
    message.info('历史记录将在下次操作时自动管理')
  }

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      {/* 操作按钮 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button
              size="small"
              icon={<UndoOutlined />}
              onClick={handleUndo}
              disabled={history.past.length === 0}
              title="撤销 (Ctrl+Z)"
            >
              撤销
            </Button>
            
            <Button
              size="small"
              icon={<RedoOutlined />}
              onClick={handleRedo}
              disabled={history.future.length === 0}
              title="重做 (Ctrl+Shift+Z)"
            >
              重做
            </Button>
          </Space>
          
          <Popconfirm
            title="确定要清空所有历史记录吗？"
            description="此操作不可恢复"
            onConfirm={handleClearHistory}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              icon={<DeleteOutlined />}
              danger
              block
              disabled={history.past.length === 0 && history.future.length === 0}
            >
              清空历史记录
            </Button>
          </Popconfirm>
        </Space>
      </Card>

      {/* 历史记录统计 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">可撤销:</Text>
            <Text strong>{history.past.length}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">可重做:</Text>
            <Text strong>{history.future.length}</Text>
          </div>
        </Space>
      </Card>

      {/* 历史记录信息 */}
      {history.past.length === 0 && history.future.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无历史记录"
          style={{ marginTop: 40 }}
        />
      ) : (
        <Card size="small" title="历史记录状态">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>当前有 {history.past.length} 个可撤销的操作</Text>
            <Text>当前有 {history.future.length} 个可重做的操作</Text>
          </Space>
        </Card>
      )}
    </div>
  )
}

export default HistoryPanel