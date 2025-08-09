import React, { useState, useEffect } from 'react'
import { Button, Space, Tooltip } from 'antd'
import {
  TableOutlined,
  CodeOutlined,
  EyeOutlined,
  ColumnWidthOutlined,
  SplitCellsOutlined,
} from '@ant-design/icons'
import { useI18n } from '@/i18n'
import TableEditor from './TableEditor'
import MarkdownEditor from './MarkdownEditor'
import PreviewPane from './PreviewPane'
import Toolbar from './Toolbar'

type ViewMode = 'table' | 'markdown' | 'preview' | 'split'

const MainEditor: React.FC = () => {
  const { t } = useI18n()
  const [viewMode, setViewMode] = useState<ViewMode>('markdown')
  const [splitDirection, setSplitDirection] = useState<'horizontal' | 'vertical'>('horizontal')

  // 响应式处理
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768 && viewMode === 'split') {
        setViewMode('table')
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [viewMode])

  // 渲染视图模式切换按钮
  const renderViewModeButtons = () => (
    <Space size="small">
      <Tooltip title={t('view.tableEditor')}>
        <Button
          type={viewMode === 'table' ? 'primary' : 'default'}
          icon={<TableOutlined />}
          onClick={() => setViewMode('table')}
          size="small"
        >
          {t('view.table')}
        </Button>
      </Tooltip>
      
      <Tooltip title={t('view.markdownEditor')}>
        <Button
          type={viewMode === 'markdown' ? 'primary' : 'default'}
          icon={<CodeOutlined />}
          onClick={() => setViewMode('markdown')}
          size="small"
        >
          {t('view.markdown')}
        </Button>
      </Tooltip>
      
      <Tooltip title={t('view.previewPane')}>
        <Button
          type={viewMode === 'preview' ? 'primary' : 'default'}
          icon={<EyeOutlined />}
          onClick={() => setViewMode('preview')}
          size="small"
        >
          {t('view.preview')}
        </Button>
      </Tooltip>
      
      <Tooltip title={t('view.split')}>
        <Button
          type={viewMode === 'split' ? 'primary' : 'default'}
          icon={<SplitCellsOutlined />}
          onClick={() => setViewMode('split')}
          size="small"
        >
          {t('view.split')}
        </Button>
      </Tooltip>
      
      {viewMode === 'split' && (
        <Tooltip title={`切换为${splitDirection === 'horizontal' ? '垂直' : '水平'}分屏`}>
          <Button
            icon={<ColumnWidthOutlined style={{ transform: splitDirection === 'horizontal' ? 'rotate(90deg)' : 'none' }} />}
            onClick={() => setSplitDirection(splitDirection === 'horizontal' ? 'vertical' : 'horizontal')}
            size="small"
          />
        </Tooltip>
      )}
    </Space>
  )

  // 渲染单个编辑器面板
  const renderEditorPane = (type: 'table' | 'markdown' | 'preview', title: string) => (
    <div className="editor-pane">
      <div className="editor-header">
        {title}
      </div>
      <div className="editor-content">
        {type === 'table' && <TableEditor />}
        {type === 'markdown' && <MarkdownEditor />}
        {type === 'preview' && <PreviewPane />}
      </div>
    </div>
  )

  // 渲染编辑器内容
  const renderEditorContent = () => {
    switch (viewMode) {
      case 'table':
        return renderEditorPane('table', t('view.tableEditor'))
      
      case 'markdown':
        return renderEditorPane('markdown', t('view.markdownEditor'))
      
      case 'preview':
        return renderEditorPane('preview', t('view.previewPane'))
      
      case 'split':
        return (
          <div 
            className="editor-container"
            style={{
              flexDirection: splitDirection === 'horizontal' ? 'row' : 'column',
            }}
          >
            {renderEditorPane('table', t('view.tableEditor'))}
            {renderEditorPane('markdown', t('view.markdownEditor'))}
          </div>
        )
      
      default:
        return renderEditorPane('table', t('view.tableEditor'))
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <div style={{ 
        borderBottom: '1px solid var(--border-color)', 
        backgroundColor: 'var(--bg-color)',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <Toolbar />
        {renderViewModeButtons()}
      </div>

      {/* 编辑器内容 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {renderEditorContent()}
      </div>
    </div>
  )
}

export default MainEditor