import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Input, App } from 'antd'
import { useTableStore } from '@/store'
import { ImportExportManager } from '@/utils/importExport'
import type { CellPosition } from '@/types'

const TableEditor: React.FC = () => {
  const { message } = App.useApp()
  const {
    tableData,
    setTableData,
    setMarkdownContent,
    selectedCells,
    setSelectedCells,
    cellStyles,
    saveToHistory,
    settings,
    updateColumnWidth,
  } = useTableStore()

  const [editingCell, setEditingCell] = useState<CellPosition | null>(null)
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; cell?: CellPosition }>({ visible: false, x: 0, y: 0 })
  const [dragStart, setDragStart] = useState<CellPosition | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [resizing, setResizing] = useState<{ columnIndex: number; startX: number; startWidth: number } | null>(null)
  
  const tableRef = useRef<HTMLTableElement>(null)

  // 处理单元格点击
  const handleCellClick = useCallback((row: number, col: number, event: React.MouseEvent) => {
    const cellPos = { row, col }
    
    if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd + 点击：多选
      const isSelected = selectedCells.some(cell => cell.row === row && cell.col === col)
      if (isSelected) {
        setSelectedCells(selectedCells.filter(cell => !(cell.row === row && cell.col === col)))
      } else {
        setSelectedCells([...selectedCells, cellPos])
      }
    } else if (event.shiftKey && selectedCells.length > 0) {
      // Shift + 点击：范围选择
      const lastSelected = selectedCells[selectedCells.length - 1]
      const minRow = Math.min(lastSelected.row, row)
      const maxRow = Math.max(lastSelected.row, row)
      const minCol = Math.min(lastSelected.col, col)
      const maxCol = Math.max(lastSelected.col, col)
      
      const rangeSelection: CellPosition[] = []
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          rangeSelection.push({ row: r, col: c })
        }
      }
      setSelectedCells(rangeSelection)
    } else {
      // 普通点击：单选
      setSelectedCells([cellPos])
    }
  }, [selectedCells, setSelectedCells])

  // 处理单元格双击
  const handleCellDoubleClick = useCallback((row: number, col: number) => {
    setEditingCell({ row, col })
  }, [])

  // 处理单元格值变化
  const handleCellChange = useCallback((row: number, col: number, value: string) => {
    const newData = { ...tableData }
    
    if (row === -1) {
      // 编辑表头
      newData.headers[col] = value
    } else {
      // 编辑数据行
      if (!newData.rows[row]) {
        newData.rows[row] = new Array(newData.headers.length).fill('')
      }
      newData.rows[row][col] = value
    }
    
    setTableData(newData)
    
    // 更新 Markdown 内容
    const markdownContent = ImportExportManager.exportToMarkdown(newData)
    setMarkdownContent(markdownContent)
    
    // 添加到历史记录（防抖）
    const timeoutId = setTimeout(() => {
      saveToHistory()
    }, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [tableData, setTableData, setMarkdownContent, saveToHistory])

  // 处理键盘事件
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (selectedCells.length === 0) return
    
    const currentCell = selectedCells[0]
    
    switch (event.key) {
      case 'Enter':
        event.preventDefault()
        if (editingCell) {
          setEditingCell(null)
        } else {
          setEditingCell(currentCell)
        }
        break
        
      case 'Escape':
        event.preventDefault()
        setEditingCell(null)
        setSelectedCells([])
        break
        
      case 'Delete':
      case 'Backspace':
        if (!editingCell) {
          event.preventDefault()
          selectedCells.forEach(cell => {
            handleCellChange(cell.row, cell.col, '')
          })
        }
        break
        
      case 'ArrowUp':
        event.preventDefault()
        if (currentCell.row > -1) {
          setSelectedCells([{ row: currentCell.row - 1, col: currentCell.col }])
        }
        break
        
      case 'ArrowDown':
        event.preventDefault()
        if (currentCell.row < tableData.rows.length - 1) {
          setSelectedCells([{ row: currentCell.row + 1, col: currentCell.col }])
        }
        break
        
      case 'ArrowLeft':
        event.preventDefault()
        if (currentCell.col > 0) {
          setSelectedCells([{ row: currentCell.row, col: currentCell.col - 1 }])
        }
        break
        
      case 'ArrowRight':
        event.preventDefault()
        if (currentCell.col < tableData.headers.length - 1) {
          setSelectedCells([{ row: currentCell.row, col: currentCell.col + 1 }])
        }
        break
        
      case 'Tab':
        event.preventDefault()
        if (event.shiftKey) {
          // Shift + Tab: 向左移动
          if (currentCell.col > 0) {
            setSelectedCells([{ row: currentCell.row, col: currentCell.col - 1 }])
          } else if (currentCell.row > -1) {
            setSelectedCells([{ row: currentCell.row - 1, col: tableData.headers.length - 1 }])
          }
        } else {
          // Tab: 向右移动
          if (currentCell.col < tableData.headers.length - 1) {
            setSelectedCells([{ row: currentCell.row, col: currentCell.col + 1 }])
          } else if (currentCell.row < tableData.rows.length - 1) {
            setSelectedCells([{ row: currentCell.row + 1, col: 0 }])
          }
        }
        break
    }
  }, [selectedCells, editingCell, tableData, setSelectedCells, handleCellChange])

  // 处理右键菜单
  const handleContextMenu = useCallback((event: React.MouseEvent, row: number, col: number) => {
    event.preventDefault()
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      cell: { row, col },
    })
  }, [])

  // 关闭右键菜单
  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0 })
  }, [])

  // 处理鼠标拖拽选择
  const handleMouseDown = useCallback((row: number, col: number, event: React.MouseEvent) => {
    if (event.button === 0) { // 左键
      setDragStart({ row, col })
      setIsSelecting(true)
    }
  }, [])

  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (isSelecting && dragStart) {
      const minRow = Math.min(dragStart.row, row)
      const maxRow = Math.max(dragStart.row, row)
      const minCol = Math.min(dragStart.col, col)
      const maxCol = Math.max(dragStart.col, col)
      
      const rangeSelection: CellPosition[] = []
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          rangeSelection.push({ row: r, col: c })
        }
      }
      setSelectedCells(rangeSelection)
    }
  }, [isSelecting, dragStart, setSelectedCells])

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false)
    setDragStart(null)
  }, [])

  // 处理列宽调整开始
  const handleResizeStart = useCallback((columnIndex: number, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    const currentWidth = tableData.columnWidths?.[columnIndex] || 150
    setResizing({
      columnIndex,
      startX: event.clientX,
      startWidth: currentWidth
    })
  }, [tableData.columnWidths])

  // 处理列宽调整中
  const handleResizeMove = useCallback((event: MouseEvent) => {
    if (!resizing) return
    
    const deltaX = event.clientX - resizing.startX
    const newWidth = Math.max(50, resizing.startWidth + deltaX)
    updateColumnWidth(resizing.columnIndex, newWidth)
  }, [resizing, updateColumnWidth])

  // 处理列宽调整结束
  const handleResizeEnd = useCallback(() => {
    if (resizing) {
      setResizing(null)
      saveToHistory()
    }
  }, [resizing, saveToHistory])

  // 监听全局鼠标事件
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsSelecting(false)
      setDragStart(null)
      handleResizeEnd()
    }
    
    const handleGlobalMouseMove = (event: MouseEvent) => {
      handleResizeMove(event)
    }
    
    const handleGlobalClick = () => {
      closeContextMenu()
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('click', handleGlobalClick)
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('click', handleGlobalClick)
    }
  }, [closeContextMenu, handleResizeMove, handleResizeEnd])

  // 检查单元格是否被选中
  const isCellSelected = useCallback((row: number, col: number) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col)
  }, [selectedCells])

  // 获取单元格样式
  const getCellStyle = useCallback((row: number, col: number) => {
    const cellKey = `${row}-${col}`
    const style = cellStyles.get(cellKey) || {}
    const columnWidth = tableData.columnWidths?.[col] || 150
    
    const baseStyle: React.CSSProperties = {
      border: '1px solid var(--border-color)',
      padding: '8px 12px',
      textAlign: tableData.alignments[col] || 'left',
      width: `${columnWidth}px`,
      minWidth: `${columnWidth}px`,
      maxWidth: `${columnWidth}px`,
      position: 'relative',
      backgroundColor: 'var(--bg-color)',
      ...style,
    }

    if (isCellSelected(row, col)) {
      // 选中状态：使用更粗的边框和阴影，但保持用户设置的背景色
      baseStyle.border = '2px solid var(--primary-color)'
      baseStyle.boxShadow = '0 0 0 1px var(--primary-color) inset'
      // 如果没有设置背景色，则使用主题色背景
      if (!style.backgroundColor || style.backgroundColor === 'var(--bg-color)') {
        baseStyle.backgroundColor = 'var(--hover-bg)'
      }
    }

    return baseStyle
  }, [cellStyles, tableData.alignments, tableData.columnWidths, isCellSelected])

  // 渲染单元格内容
  const renderCellContent = useCallback((row: number, col: number, value: string) => {
    const isEditing = editingCell?.row === row && editingCell?.col === col
    
    if (isEditing) {
      return (
        <Input
          value={value}
          onChange={(e) => handleCellChange(row, col, e.target.value)}
          onBlur={() => setEditingCell(null)}
          onPressEnter={() => setEditingCell(null)}
          autoFocus
          bordered={false}
          style={{ padding: 0, backgroundColor: 'transparent' }}
        />
      )
    }
    
    return (
      <div
        style={{
          minHeight: 20,
          cursor: 'text',
          wordBreak: 'break-word',
          whiteSpace: settings.wordWrap ? 'pre-wrap' : 'nowrap',
          overflow: 'hidden',
        }}
      >
        {value || ''}
      </div>
    )
  }, [editingCell, handleCellChange, settings.wordWrap])

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'auto',
        padding: 16,
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <table 
        ref={tableRef}
        style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          backgroundColor: 'var(--bg-color)',
        }}
      >
        {/* 表头 */}
        <thead>
          <tr>
            {tableData.headers.map((header, colIndex) => (
              <th
                key={colIndex}
                style={{
                  ...getCellStyle(-1, colIndex),
                  position: 'relative'
                }}
                onClick={(e) => handleCellClick(-1, colIndex, e)}
                onDoubleClick={() => handleCellDoubleClick(-1, colIndex)}
                onContextMenu={(e) => handleContextMenu(e, -1, colIndex)}
                onMouseDown={(e) => handleMouseDown(-1, colIndex, e)}
                onMouseEnter={() => handleMouseEnter(-1, colIndex)}
                onMouseUp={handleMouseUp}
              >
                {renderCellContent(-1, colIndex, header)}
                {settings.resizableColumns && (
                  <div
                    className="resize-handle"
                    onMouseDown={(e) => handleResizeStart(colIndex, e)}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      cursor: 'col-resize',
                      backgroundColor: 'transparent',
                      zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#007acc'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  />
                )}
              </th>
            ))}
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
                  onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
                  onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                  onContextMenu={(e) => handleContextMenu(e, rowIndex, colIndex)}
                  onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  onMouseUp={handleMouseUp}
                >
                  {renderCellContent(rowIndex, colIndex, cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 右键菜单 */}
      {contextMenu.visible && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="context-menu-item"
            onClick={() => {
              if (contextMenu.cell) {
                setEditingCell(contextMenu.cell)
              }
              closeContextMenu()
            }}
          >
            编辑单元格
          </div>
          <div 
            className="context-menu-item"
            onClick={() => {
              if (contextMenu.cell) {
                handleCellChange(contextMenu.cell.row, contextMenu.cell.col, '')
              }
              closeContextMenu()
            }}
          >
            清空内容
          </div>
          <div className="context-menu-divider" />
          <div 
            className="context-menu-item"
            onClick={() => {
              // 复制单元格
              if (contextMenu.cell) {
                const value = contextMenu.cell.row === -1 
                  ? tableData.headers[contextMenu.cell.col]
                  : tableData.rows[contextMenu.cell.row]?.[contextMenu.cell.col] || ''
                navigator.clipboard.writeText(value)
                message.success('已复制')
              }
              closeContextMenu()
            }}
          >
            复制
          </div>
          <div 
            className="context-menu-item"
            onClick={async () => {
              // 粘贴到单元格
              if (contextMenu.cell) {
                try {
                  const text = await navigator.clipboard.readText()
                  handleCellChange(contextMenu.cell.row, contextMenu.cell.col, text)
                  message.success('已粘贴')
                } catch (error) {
                  message.error('粘贴失败')
                }
              }
              closeContextMenu()
            }}
          >
            粘贴
          </div>
        </div>
      )}
    </div>
  )
}

export default TableEditor