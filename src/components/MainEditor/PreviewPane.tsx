import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button, Select, Slider, Switch, Tooltip, App } from 'antd'
import { 
  ZoomInOutlined, 
  ZoomOutOutlined, 
  DownloadOutlined, 
  PrinterOutlined,
  CopyOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons'
import { useI18n } from '@/i18n'
import { useTableStore } from '@/store'
import { ImportExportManager } from '@/utils/importExport'
import type { TableData } from '@/types'

const { Option } = Select

interface PreviewPaneProps {
  height?: number
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ height = 600 }) => {
  const { t } = useI18n()
  const { message } = App.useApp()
  const {
    tableData,
    cellStyles,
    markdownContent,
    settings,
  } = useTableStore()

  const [zoom, setZoom] = useState(100)
  const [previewMode, setPreviewMode] = useState<'table' | 'markdown' | 'html'>('table')
  const [showBorders, setShowBorders] = useState(true)
  const [showStripes, setShowStripes] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'pdf'>('png')
  
  const previewRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)


  // 处理全屏切换
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      previewRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 10, 200))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 10, 50))
  }, [])

  const resetZoom = useCallback(() => {
    setZoom(100)
  }, [])

  // 导出图片
  const exportAsImage = useCallback(async () => {
    if (!tableRef.current) {
      message.error('没有可导出的表格')
      return
    }

    try {
      if (exportFormat === 'svg') {
        const svgContent = await ImportExportManager.exportToSVG(tableData, cellStyles, settings)
        const blob = new Blob([svgContent], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `table-${Date.now()}.svg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        message.success('SVG 文件已下载')
      } else {
        const canvas = await ImportExportManager.exportToPNG(tableData, cellStyles, settings)
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `table-${Date.now()}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            message.success('PNG 文件已下载')
          }
        })
      }
    } catch (error) {
      message.error('导出失败')
      console.error('导出错误:', error)
    }
  }, [tableData, cellStyles, exportFormat])

  // 打印表格
  const printTable = useCallback(() => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const htmlContent = ImportExportManager.exportToHTML(tableData, cellStyles, settings)
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>表格打印</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            @media print {
              body { margin: 0; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }, [tableData, cellStyles, settings])

  // 复制表格 HTML
  const copyTableHTML = useCallback(async () => {
    try {
      const htmlContent = ImportExportManager.exportToHTML(tableData, cellStyles, settings)
      await navigator.clipboard.writeText(htmlContent)
      message.success('HTML 代码已复制到剪贴板')
    } catch (error) {
      message.error('复制失败')
    }
  }, [tableData, cellStyles, settings])

  // 获取单元格样式
  const getCellStyle = useCallback((row: number, col: number) => {
    const cellKey = `${row}-${col}`
    const style = cellStyles.get(cellKey) || {}
    const columnWidth = tableData.columnWidths?.[col] || 150
    
    const baseStyle: React.CSSProperties = {
      border: showBorders ? '1px solid #e8e8e8' : 'none',
      padding: '8px 12px',
      textAlign: tableData.alignments[col] || 'left',
      width: `${columnWidth}px`,
      minWidth: `${columnWidth}px`,
      maxWidth: `${columnWidth}px`,
      ...style,
    }

    // 斑马纹效果
    if (showStripes && row >= 0 && row % 2 === 1) {
      baseStyle.backgroundColor = baseStyle.backgroundColor || 'var(--surface-color)'
    }

    return baseStyle
  }, [cellStyles, tableData.alignments, tableData.columnWidths, showBorders, showStripes])

  // 渲染表格预览
  const renderTablePreview = useCallback(() => {
    return (
      <table 
        ref={tableRef}
        style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          backgroundColor: 'var(--bg-color)',
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top left',
        }}
      >
        {/* 表头 */}
        <thead>
          <tr>
            {tableData.headers.map((header, colIndex) => {
              const headerStyle = getCellStyle(-1, colIndex)
              return (
                <th
                  key={colIndex}
                  style={{
                    ...headerStyle,
                    // 只有在用户没有设置背景色时才使用默认的表头背景色
                    backgroundColor: headerStyle.backgroundColor && headerStyle.backgroundColor !== 'var(--bg-color)' 
                      ? headerStyle.backgroundColor 
                      : 'var(--surface-color)',
                    fontWeight: 'bold',
                  }}
                >
                  {header}
                </th>
              )
            })}
          </tr>
        </thead>
        
        {/* 表体 */}
        <tbody>
          {tableData.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  style={getCellStyle(rowIndex, colIndex)}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }, [tableData, getCellStyle, zoom])

  // 渲染 Markdown 预览
  const renderMarkdownPreview = useCallback(() => {
    return (
      <pre style={{
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: 14,
        lineHeight: 1.5,
        padding: 20,
        backgroundColor: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        borderRadius: 4,
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'top left',
      }}>
        {markdownContent}
      </pre>
    )
  }, [markdownContent, zoom])

  // 渲染 HTML 预览
  const renderHTMLPreview = useCallback(() => {
    const htmlContent = ImportExportManager.exportToHTML(tableData, cellStyles, settings)
    return (
      <pre style={{
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: 12,
        lineHeight: 1.4,
        padding: 20,
        backgroundColor: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        borderRadius: 4,
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'top left',
      }}>
        {htmlContent}
      </pre>
    )
  }, [tableData, cellStyles, zoom])

  return (
    <div 
      ref={previewRef}
      style={{ 
        height: isFullscreen ? '100vh' : height, 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'var(--bg-color)',
      }}
    >
      {/* 工具栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--surface-color)',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Select
            value={previewMode}
            onChange={setPreviewMode}
            size="small"
            style={{ width: 100 }}
          >
            <Option value="table">表格</Option>
            <Option value="markdown">Markdown</Option>
            <Option value="html">HTML</Option>
          </Select>
          
          {previewMode === 'table' && (
            <>
              <Switch
                checked={showBorders}
                onChange={setShowBorders}
                size="small"
              />
              <span style={{ fontSize: 12 }}>边框</span>
              
              <Switch
                checked={showStripes}
                onChange={setShowStripes}
                size="small"
              />
              <span style={{ fontSize: 12 }}>斑马纹</span>
            </>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* 缩放控制 */}
          <Tooltip title="缩小">
            <Button
              icon={<ZoomOutOutlined />}
              size="small"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
            />
          </Tooltip>
          
          <Slider
            value={zoom}
            onChange={setZoom}
            min={50}
            max={200}
            step={10}
            style={{ width: 80 }}
            tooltip={{ formatter: (value) => `${value}%` }}
          />
          
          <span 
            style={{ 
              fontSize: 12, 
              minWidth: 40, 
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={resetZoom}
          >
            {zoom}%
          </span>
          
          <Tooltip title="放大">
            <Button
              icon={<ZoomInOutlined />}
              size="small"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
            />
          </Tooltip>
          
          {/* 导出控制 */}
          {previewMode === 'table' && (
            <>
              <Select
                value={exportFormat}
                onChange={setExportFormat}
                size="small"
                style={{ width: 80 }}
              >
                <Option value="png">PNG</Option>
                <Option value="svg">SVG</Option>
              </Select>
              
              <Tooltip title="导出图片">
                <Button
                  icon={<DownloadOutlined />}
                  size="small"
                  onClick={exportAsImage}
                />
              </Tooltip>
              
              <Tooltip title="打印">
                <Button
                  icon={<PrinterOutlined />}
                  size="small"
                  onClick={printTable}
                />
              </Tooltip>
            </>
          )}
          
          <Tooltip title="复制 HTML">
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={copyTableHTML}
            />
          </Tooltip>
          
          <Tooltip title={isFullscreen ? "退出全屏" : "全屏"}>
            <Button
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              size="small"
              onClick={toggleFullscreen}
            />
          </Tooltip>
        </div>
      </div>

      {/* 预览内容 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: previewMode === 'table' ? 20 : 0,
        backgroundColor: previewMode === 'table' ? 'var(--bg-color)' : 'var(--surface-color)',
      }}>
        {previewMode === 'table' && renderTablePreview()}
        {previewMode === 'markdown' && renderMarkdownPreview()}
        {previewMode === 'html' && renderHTMLPreview()}
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
          {t('view.preview')}: {previewMode === 'table' ? t('view.table') : previewMode === 'markdown' ? t('view.markdownPreview') : t('view.htmlPreview')}
        </div>
        
        <div style={{ display: 'flex', gap: 16 }}>
          <span>{t('common.zoom')}: {zoom}%</span>
          <span>{t('sidebar.rows')}: {tableData.rows.length}</span>
          <span>{t('sidebar.columns')}: {tableData.headers.length}</span>
        </div>
      </div>
    </div>
  )
}

export default PreviewPane