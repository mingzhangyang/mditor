import React, { useState } from 'react'
import { Layout, Button, Space, Dropdown, Typography, App } from 'antd'
import {
  MenuOutlined,
  SaveOutlined,
  FolderOpenOutlined,
  DownloadOutlined,
  UndoOutlined,
  RedoOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  GithubOutlined,
} from '@ant-design/icons'
import { useTableStore } from '@/store'
import { ImportExportManager } from '@/utils/importExport'
import { useI18n } from '@/i18n'
import AboutModal from '@/components/AboutModal'
import ShortcutsModal from '@/components/ShortcutsModal'
import type { MenuProps } from 'antd'

const { Header: AntHeader } = Layout
const { Title } = Typography

const Header: React.FC = () => {
  const { message } = App.useApp()
  const { t } = useI18n()
  const [aboutModalVisible, setAboutModalVisible] = useState(false)
  const [shortcutsModalVisible, setShortcutsModalVisible] = useState(false)
  const {
    tableData,
    cellStyles,
    settings,
    sidebarVisible,
    setSidebarVisible,
    setSettingsModalVisible,
    setTableData,
    setMarkdownContent,
    saveToHistory,
    history,
    undo,
    redo,
  } = useTableStore()

  // 处理文件导入
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.csv,.xlsx,.xls,.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const result = await ImportExportManager.import(file)
        if (result.success && result.data) {
          setTableData(result.data)
          const markdownContent = ImportExportManager.exportToMarkdown(result.data)
          setMarkdownContent(markdownContent)
          
          saveToHistory()
          
          message.success(`${t('export.exportSuccess')}: ${file.name}`)
        } else {
          message.error(result.error || t('export.exportError'))
        }
      } catch (error) {
        console.error('导入文件错误:', error)
        message.error(t('export.exportError'))
      }
    }
    input.click()
  }

  // 处理导出
  const handleExport = async (format: string) => {
    try {
      switch (format) {
        case 'markdown':
          await ImportExportManager.export(tableData, { format: 'markdown', filename: 'table.md', includeStyles: false })
          break
        case 'csv':
          await ImportExportManager.export(tableData, { format: 'csv', filename: 'table.csv', includeStyles: false })
          break
        case 'excel':
          await ImportExportManager.export(tableData, { format: 'excel', filename: 'table.xlsx', includeStyles: true }, cellStyles, settings)
          break
        case 'html':
          await ImportExportManager.export(tableData, { format: 'html', filename: 'table.html', includeStyles: true }, cellStyles, settings)
          break
        case 'png':
          await ImportExportManager.export(tableData, { format: 'png', filename: 'table.png', includeStyles: true }, cellStyles, settings)
          break
        case 'svg':
          await ImportExportManager.export(tableData, { format: 'svg', filename: 'table.svg', includeStyles: true }, cellStyles, settings)
          break
        default:
          message.error(t('export.unsupportedFormat'))
          return
      }
      message.success(t('export.exportSuccess'))
    } catch (error) {
      console.error('导出错误:', error)
      message.error(t('export.exportError'))
    }
  }

  // 撤销操作
  const handleUndo = () => {
    if (history.past.length > 0) {
      undo()
      message.success(t('history.undoSuccess'))
    } else {
      message.info(t('history.noUndoOperations'))
    }
  }

  // 重做操作
  const handleRedo = () => {
    if (history.future.length > 0) {
      redo()
      message.success(t('history.redoSuccess'))
    } else {
      message.info(t('history.noRedoOperations'))
    }
  }

  // 导出菜单项
  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'markdown',
      label: `${t('export.markdown')} (.md)`,
      onClick: () => handleExport('markdown'),
    },
    {
      key: 'csv',
      label: `${t('export.csv')} (.csv)`,
      onClick: () => handleExport('csv'),
    },
    {
      key: 'excel',
      label: `${t('export.excel')} (.xlsx)`,
      onClick: () => handleExport('excel'),
    },
    {
      type: 'divider',
    },
    {
      key: 'html',
      label: `${t('export.html')} (.html)`,
      onClick: () => handleExport('html'),
    },
    {
      key: 'png',
      label: `${t('export.png')} (.png)`,
      onClick: () => handleExport('png'),
    },
    {
      key: 'svg',
      label: `${t('export.svg')} (.svg)`,
      onClick: () => handleExport('svg'),
    },
  ]

  // 帮助菜单项
  const helpMenuItems: MenuProps['items'] = [
    {
      key: 'shortcuts',
      label: t('header.shortcuts'),
      onClick: () => {
        setShortcutsModalVisible(true)
      },
    },
    {
      key: 'guide',
      label: t('header.guide'),
      onClick: () => {
        // Open user guide in new tab or show guide modal
      window.open('https://github.com/mingzhangyang/mditor', '_blank')
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'github',
      label: (
        <span>
          <GithubOutlined /> GitHub
        </span>
      ),
      onClick: () => {
          window.open('https://github.com/mingzhangyang/mditor', '_blank')
        },
    },
    {
      key: 'about',
      label: t('header.about'),
      onClick: () => {
        setAboutModalVisible(true)
      },
    },
  ]

  return (
    <AntHeader className="app-header" style={{ padding: '0 16px', height: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
        {/* 左侧 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setSidebarVisible(!sidebarVisible)}
            title={t('header.toggleSidebar')}
          />
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            {t('header.title')}
          </Title>
        </div>

        {/* 中间工具栏 */}
        <Space size="small">
          <Button
            icon={<FolderOpenOutlined />}
            onClick={handleImport}
            title={t('header.importFile')}
          >
            {t('header.open')}
          </Button>
          
          <Dropdown menu={{ items: exportMenuItems }} placement="bottomLeft">
            <Button icon={<DownloadOutlined />} title={t('header.exportFile')}>
              {t('header.export')}
            </Button>
          </Dropdown>
          
          <div style={{ width: 1, height: 24, backgroundColor: '#e8e8e8', margin: '0 8px' }} />
          
          <Button
            icon={<UndoOutlined />}
            onClick={handleUndo}
            disabled={history.past.length === 0}
            title={t('header.undoAction')}
          />
          
          <Button
            icon={<RedoOutlined />}
            onClick={handleRedo}
            disabled={history.future.length === 0}
            title={t('header.redoAction')}
          />
          
          <div style={{ width: 1, height: 24, backgroundColor: '#e8e8e8', margin: '0 8px' }} />
          
          <Button
            icon={<SaveOutlined />}
            type="primary"
            onClick={() => handleExport('markdown')}
            title={t('header.saveMarkdown')}
          >
            {t('header.save')}
          </Button>
        </Space>

        {/* 右侧 */}
        <Space size="small">
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => {
              setSettingsModalVisible(true)
            }}
            title={t('header.settingsTooltip')}
          />
          
          <Dropdown menu={{ items: helpMenuItems }} placement="bottomRight">
            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              title={t('header.helpTooltip')}
            />
          </Dropdown>
        </Space>
      </div>
      
      {/* Modals */}
      <AboutModal 
        visible={aboutModalVisible} 
        onClose={() => setAboutModalVisible(false)} 
      />
      <ShortcutsModal 
        visible={shortcutsModalVisible} 
        onClose={() => setShortcutsModalVisible(false)} 
      />
    </AntHeader>
  )
}

export default Header