import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Input, Button, Tooltip, App } from 'antd'
import { EyeOutlined, EditOutlined, CopyOutlined, DownloadOutlined } from '@ant-design/icons'
import { useI18n } from '@/i18n'
import { useTableStore } from '@/store'
import { MarkdownTableParser } from '@/utils/markdown'
import { ImportExportManager } from '@/utils/importExport'

const { TextArea } = Input

interface MarkdownEditorProps {
  height?: number
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ height = 600 }) => {
  const { t } = useI18n()
  const { message } = App.useApp()
  const {
    markdownContent,
    setMarkdownContent,
    setTableData,
    saveToHistory,
    settings,
  } = useTableStore()

  const [localContent, setLocalContent] = useState(markdownContent)
  const [isPreview, setIsPreview] = useState(false)
  const [lineNumbers, setLineNumbers] = useState<number[]>([])
  const [currentLine, setCurrentLine] = useState(1)
  const [isModified, setIsModified] = useState(false)
  
  const textAreaRef = useRef<any>(null)
  const previewRef = useRef<HTMLDivElement>(null)


  // 同步外部内容变化
  useEffect(() => {
    if (markdownContent !== localContent) {
      setLocalContent(markdownContent)
      setIsModified(false)
    }
  }, [markdownContent, localContent])

  // 计算行号
  useEffect(() => {
    const lines = localContent.split('\n')
    setLineNumbers(lines.map((_, index) => index + 1))
  }, [localContent])

  // 处理内容变化
  const handleContentChange = useCallback((value: string) => {
    setLocalContent(value)
    setIsModified(value !== markdownContent)
    
    // 实时解析表格（防抖）
    const timeoutId = setTimeout(() => {
      try {
        if (MarkdownTableParser.validate(value)) {
        const tableData = MarkdownTableParser.parse(value)
          setTableData(tableData)
        }
      } catch (error) {
        console.warn('Markdown 解析失败:', error)
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [markdownContent, setTableData])

  // 应用更改
  const applyChanges = useCallback(() => {
    try {
      setMarkdownContent(localContent)
      
      if (MarkdownTableParser.validate(localContent)) {
        const tableData = MarkdownTableParser.parse(localContent)
        setTableData(tableData)
        
        saveToHistory()
        
        message.success('表格已更新')
      } else {
        message.warning('未检测到有效的 Markdown 表格')
      }
      
      setIsModified(false)
    } catch (error) {
      message.error('解析 Markdown 失败')
      console.error('Markdown 解析错误:', error)
    }
  }, [localContent, setMarkdownContent, setTableData, saveToHistory])

  // 重置更改
  const resetChanges = useCallback(() => {
    setLocalContent(markdownContent)
    setIsModified(false)
  }, [markdownContent])

  // 复制内容
  const copyContent = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(localContent)
      message.success('已复制到剪贴板')
    } catch (error) {
      message.error('复制失败')
    }
  }, [localContent])

  // 下载 Markdown 文件
  const downloadMarkdown = useCallback(() => {
    try {
      const blob = new Blob([localContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `table-${Date.now()}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      message.success('文件已下载')
    } catch (error) {
      message.error('下载失败')
    }
  }, [localContent])

  // 处理键盘快捷键
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          event.preventDefault()
          if (isModified) {
            applyChanges()
          }
          break
        case 'z':
          if (!event.shiftKey) {
            event.preventDefault()
            // 撤销功能由全局处理
          }
          break
        case 'y':
          event.preventDefault()
          // 重做功能由全局处理
          break
      }
    }
    
    if (event.key === 'Escape') {
      if (isModified) {
        resetChanges()
      }
    }
  }, [isModified, applyChanges, resetChanges])

  // 处理光标位置变化
  const handleSelectionChange = useCallback(() => {
    if (textAreaRef.current) {
      const textarea = textAreaRef.current.resizableTextArea?.textArea
      if (textarea) {
        const cursorPosition = textarea.selectionStart
        const textBeforeCursor = localContent.substring(0, cursorPosition)
        const lineNumber = textBeforeCursor.split('\n').length
        setCurrentLine(lineNumber)
      }
    }
  }, [localContent])

  // 渲染预览内容
  const renderPreview = useCallback(() => {
    if (!MarkdownTableParser.validate(localContent)) {
      return (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>未检测到有效的 Markdown 表格</p>
          <p>请确保表格格式正确</p>
        </div>
      )
    }

    try {
      const tableData = MarkdownTableParser.parse(localContent)
      return (
        <div style={{ padding: 20 }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            border: '1px solid var(--border-color)'
          }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-color)' }}>
                {tableData.headers.map((header, index) => (
                  <th
                    key={index}
                    style={{
                      border: '1px solid var(--border-color)',
                      padding: '8px 12px',
                      textAlign: tableData.alignments[index] || 'left',
                      fontWeight: 'bold',
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      style={{
                        border: '1px solid var(--border-color)',
                        padding: '8px 12px',
                        textAlign: tableData.alignments[colIndex] || 'left',
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    } catch (error) {
      return (
        <div style={{ padding: 20, textAlign: 'center', color: '#ff4d4f' }}>
          <p>{t('table.parseError')}</p>
          <p>{error instanceof Error ? error.message : t('table.unknownError')}</p>
        </div>
      )
    }
  }, [localContent])

  return (
    <div style={{ height, display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--surface-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            type={isPreview ? 'default' : 'primary'}
            icon={<EditOutlined />}
            size="small"
            onClick={() => setIsPreview(false)}
          >
            {t('table.edit')}
          </Button>
          <Button
            type={isPreview ? 'primary' : 'default'}
            icon={<EyeOutlined />}
            size="small"
            onClick={() => setIsPreview(true)}
          >
            {t('table.preview')}
          </Button>
          
          {settings.showLineNumbers && (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>
              {t('table.line')} {currentLine}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isModified && (
            <>
              <Button
                type="primary"
                size="small"
                onClick={applyChanges}
              >
                {t('table.applyChanges')}
              </Button>
              <Button
                size="small"
                onClick={resetChanges}
              >
                {t('table.reset')}
              </Button>
            </>
          )}
          
          <Tooltip title={t('table.copyContent')}>
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={copyContent}
            />
          </Tooltip>
          
          <Tooltip title={t('table.downloadMarkdown')}>
            <Button
              icon={<DownloadOutlined />}
              size="small"
              onClick={downloadMarkdown}
            />
          </Tooltip>
        </div>
      </div>

      {/* 编辑器内容 */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {isPreview ? (
          <div
            ref={previewRef}
            style={{
              height: '100%',
              overflow: 'auto',
              backgroundColor: 'var(--bg-color)',
            }}
          >
            {renderPreview()}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex' }}>
            {/* 行号 */}
            {settings.showLineNumbers && (
              <div style={{
                width: 50,
                backgroundColor: 'var(--surface-color)',
                borderRight: '1px solid var(--border-color)',
                padding: '8px 4px',
                fontSize: 12,
                lineHeight: '22px',
                color: 'var(--text-secondary)',
                textAlign: 'right',
                fontFamily: 'Monaco, Consolas, monospace',
                overflow: 'hidden',
              }}>
                {lineNumbers.map(num => (
                  <div
                    key={num}
                    style={{
                      backgroundColor: num === currentLine ? 'var(--hover-bg)' : 'transparent',
                      paddingRight: 8,
                    }}
                  >
                    {num}
                  </div>
                ))}
              </div>
            )}
            
            {/* 文本编辑器 */}
            <div style={{ flex: 1 }}>
              <TextArea
                ref={textAreaRef}
                value={localContent}
                onChange={(e) => handleContentChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onSelect={handleSelectionChange}
                onClick={handleSelectionChange}
                placeholder={t('table.placeholder')}
                style={{
                  height: '100%',
                  border: 'none',
                  resize: 'none',
                  fontFamily: settings.codeHighlight ? 'Monaco, Consolas, monospace' : 'inherit',
                  fontSize: settings.fontSize || 14,
                  lineHeight: '22px',
                  padding: 16,
                }}
                autoSize={false}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* 状态栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 16px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--surface-color)',
        fontSize: 12,
        color: 'var(--text-secondary)',
      }}>
        <div>
          {isModified && (
            <span style={{ color: 'var(--error-color)' }}>● {t('editor.unsavedChanges')}</span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: 16 }}>
          <span>{t('editor.characterCount')}: {localContent.length}</span>
          <span>{t('editor.lineCount')}: {lineNumbers.length}</span>
          {MarkdownTableParser.validate(localContent) && (
            <span style={{ color: 'var(--success-color)' }}>✓ {t('editor.validTable')}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default MarkdownEditor