import React, { useEffect } from 'react'
import { Layout, App as AntApp } from 'antd'
import { useTableStore } from '@/store'
import { useI18n } from '@/i18n'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import MainEditor from '@/components/MainEditor'
import SettingsModal from '@/components/SettingsModal'
import { ImportExportManager } from '@/utils/importExport'

const { Content, Sider } = Layout

const App: React.FC = () => {
  const { message } = AntApp.useApp()
  const { t, setLanguage } = useI18n()
  const {
    sidebarVisible,
    setSidebarVisible,
    settingsModalVisible,
    setSettingsModalVisible,
    setTableData,
    setMarkdownContent,
    saveToHistory,
    settings,
  } = useTableStore()

  // 初始化应用
  useEffect(() => {
    // 同步语言设置
    if (settings.language) {
      setLanguage(settings.language as any)
    }
    
    // Set default table data
    const defaultData = {
      headers: ['A', 'B', 'C'],
      rows: [
        ['a1', 'b1', 'c1'],
        ['a2', 'b2', 'c2'],
        ['a3', 'b3', 'c3'],
      ],
      alignments: ['left', 'center', 'right'] as ('left' | 'center' | 'right')[],
    }
    
    setTableData(defaultData)
    
    // 生成初始 Markdown 内容
    const markdownContent = ImportExportManager.exportToMarkdown(defaultData)
    setMarkdownContent(markdownContent)
    
    // 添加到历史记录
    saveToHistory()
  }, [settings.language, setLanguage])

  // 处理文件拖拽
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault()
      
      const files = Array.from(e.dataTransfer?.files || [])
      if (files.length === 0) return

      const file = files[0]
      
      try {
        const result = await ImportExportManager.import(file)
        if (result.success && result.data) {
          setTableData(result.data)
          const markdownContent = ImportExportManager.exportToMarkdown(result.data)
          setMarkdownContent(markdownContent)
          
          saveToHistory()
          
          message.success(`${t('files.importSuccess')}: ${file.name}`)
        } else {
          message.error(result.error || t('files.importFailed'))
        }
      } catch (error) {
        console.error('Import file error:', error)
        message.error(t('files.importError'))
      }
    }

    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
  }, [setTableData, setMarkdownContent, saveToHistory])

  // 处理键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S: 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        // 触发保存操作
        message.info('保存功能待实现')
      }
      
      // Ctrl/Cmd + Z: 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        // 触发撤销操作
        message.info('撤销功能待实现')
      }
      
      // Ctrl/Cmd + Shift + Z: 重做
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        // 触发重做操作
        message.info('重做功能待实现')
      }
      
      // F11: 切换侧边栏
      if (e.key === 'F11') {
        e.preventDefault()
        setSidebarVisible(!sidebarVisible)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [sidebarVisible, setSidebarVisible])

  return (
    <Layout className="app-container">
      <Header />
      <Layout className="app-content">
        {sidebarVisible && (
          <Sider 
            width={300} 
            className="app-sidebar"
            theme="light"
            collapsible={false}
          >
            <Sidebar />
          </Sider>
        )}
        <Content className="app-main">
          <MainEditor />
        </Content>
      </Layout>
      
      {/* 设置弹窗 */}
      <SettingsModal 
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
      />
    </Layout>
  )
}

export default App