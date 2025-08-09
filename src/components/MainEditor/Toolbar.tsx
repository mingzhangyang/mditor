import React from 'react'
import { Button, Space, Dropdown, Tooltip, App } from 'antd'
import {
  PlusOutlined,
  MinusOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  CopyOutlined,
  SnippetsOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import { useTableStore } from '@/store'
import { ImportExportManager } from '@/utils/importExport'
import type { MenuProps } from 'antd'

const Toolbar: React.FC = () => {
  const { message } = App.useApp()
  const {
    tableData,
    setTableData,
    setMarkdownContent,
    selectedCells,
    saveToHistory,
  } = useTableStore()

  // 添加行
  const addRow = () => {
    const newRow = new Array(tableData.headers.length).fill('')
    const newData = {
      ...tableData,
      rows: [...tableData.rows, newRow],
    }
    setTableData(newData)
    
    const markdownContent = ImportExportManager.exportToMarkdown(newData)
    setMarkdownContent(markdownContent)
    
    saveToHistory()
    
    message.success('已添加新行')
  }

  // 删除行
  const deleteRow = () => {
    if (tableData.rows.length <= 1) {
      message.warning('至少需要保留一行')
      return
    }

    if (selectedCells.length === 0) {
      message.warning('请先选择要删除的行')
      return
    }

    const rowsToDelete = [...new Set(selectedCells.map(cell => cell.row))]
    const newRows = tableData.rows.filter((_, index) => !rowsToDelete.includes(index))
    
    const newData = {
      ...tableData,
      rows: newRows,
    }
    setTableData(newData)
    
    const markdownContent = ImportExportManager.exportToMarkdown(newData)
    setMarkdownContent(markdownContent)
    
    saveToHistory()
    
    message.success(`已删除 ${rowsToDelete.length} 行`)
  }

  // 添加列
  const addColumn = () => {
    const newHeaders = [...tableData.headers, `列${tableData.headers.length + 1}`]
    const newRows = tableData.rows.map(row => [...row, ''])
    const newAlignments = [...tableData.alignments, 'left' as const]
    
    const newData = {
      headers: newHeaders,
      rows: newRows,
      alignments: newAlignments,
    }
    setTableData(newData)
    
    const markdownContent = ImportExportManager.exportToMarkdown(newData)
    setMarkdownContent(markdownContent)
    
    saveToHistory()
    
    message.success('已添加新列')
  }

  // 删除列
  const deleteColumn = () => {
    if (tableData.headers.length <= 1) {
      message.warning('至少需要保留一列')
      return
    }

    if (selectedCells.length === 0) {
      message.warning('请先选择要删除的列')
      return
    }

    const columnsToDelete = [...new Set(selectedCells.map(cell => cell.col))]
    const newHeaders = tableData.headers.filter((_, index) => !columnsToDelete.includes(index))
    const newRows = tableData.rows.map(row => row.filter((_, index) => !columnsToDelete.includes(index)))
    const newAlignments = tableData.alignments.filter((_, index) => !columnsToDelete.includes(index))
    
    const newData = {
      headers: newHeaders,
      rows: newRows,
      alignments: newAlignments,
    }
    setTableData(newData)
    
    const markdownContent = ImportExportManager.exportToMarkdown(newData)
    setMarkdownContent(markdownContent)
    
    saveToHistory()
    
    message.success(`已删除 ${columnsToDelete.length} 列`)
  }

  // 设置对齐方式
  const setAlignment = (alignment: 'left' | 'center' | 'right') => {
    if (selectedCells.length === 0) {
      message.warning('请先选择单元格')
      return
    }

    const columnsToAlign = [...new Set(selectedCells.map(cell => cell.col))]
    const newAlignments = [...tableData.alignments]
    
    columnsToAlign.forEach(col => {
      if (col < newAlignments.length) {
        newAlignments[col] = alignment
      }
    })
    
    const newData = {
      ...tableData,
      alignments: newAlignments,
    }
    setTableData(newData)
    
    const markdownContent = ImportExportManager.exportToMarkdown(newData)
    setMarkdownContent(markdownContent)
    
    saveToHistory()
    
    message.success(`已设置对齐方式: ${alignment}`)
  }

  // 复制选中的单元格
  const copySelectedCells = () => {
    if (selectedCells.length === 0) {
      message.warning('请先选择单元格')
      return
    }

    const cellData = selectedCells.map(cell => {
      if (cell.row === -1) {
        return tableData.headers[cell.col] || ''
      } else {
        return tableData.rows[cell.row]?.[cell.col] || ''
      }
    })

    const textData = cellData.join('\t')
    navigator.clipboard.writeText(textData).then(() => {
      message.success(`已复制 ${selectedCells.length} 个单元格`)
    }).catch(() => {
      message.error('复制失败')
    })
  }

  // 粘贴数据
  const pasteData = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length === 0) {
        message.warning('剪贴板中没有有效数据')
        return
      }

      // 简单的表格数据解析
      const rows = lines.map(line => line.split('\t'))
      const maxCols = Math.max(...rows.map(row => row.length))
      
      // 扩展现有表格以容纳新数据
      const newHeaders = [...tableData.headers]
      const newAlignments = [...tableData.alignments]
      
      while (newHeaders.length < maxCols) {
        newHeaders.push(`列${newHeaders.length + 1}`)
        newAlignments.push('left')
      }
      
      const newRows = [...tableData.rows, ...rows.map(row => {
        const paddedRow = [...row]
        while (paddedRow.length < maxCols) {
          paddedRow.push('')
        }
        return paddedRow
      })]
      
      const newData = {
        headers: newHeaders,
        rows: newRows,
        alignments: newAlignments,
      }
      setTableData(newData)
      
      const markdownContent = ImportExportManager.exportToMarkdown(newData)
      setMarkdownContent(markdownContent)
      
      saveToHistory()
      
      message.success(`已粘贴 ${rows.length} 行数据`)
    } catch (error) {
      message.error('粘贴失败')
    }
  }

  // 排序功能
  const sortColumn = (ascending: boolean) => {
    if (selectedCells.length === 0) {
      message.warning('请先选择要排序的列')
      return
    }

    const columnIndex = selectedCells[0].col
    const newRows = [...tableData.rows].sort((a, b) => {
      const aValue = a[columnIndex] || ''
      const bValue = b[columnIndex] || ''
      
      // 尝试数字排序
      const aNum = parseFloat(aValue)
      const bNum = parseFloat(bValue)
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return ascending ? aNum - bNum : bNum - aNum
      }
      
      // 字符串排序
      return ascending 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })
    
    const newData = {
      ...tableData,
      rows: newRows,
    }
    setTableData(newData)
    
    const markdownContent = ImportExportManager.exportToMarkdown(newData)
    setMarkdownContent(markdownContent)
    
    saveToHistory()
    
    message.success(`已${ascending ? '升序' : '降序'}排序`)
  }

  // 更多操作菜单
  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'clear-content',
      label: '清空内容',
      onClick: () => {
        const newRows = tableData.rows.map(row => row.map(() => ''))
        const newData = {
          ...tableData,
          rows: newRows,
        }
        setTableData(newData)
        
        const markdownContent = ImportExportManager.exportToMarkdown(newData)
        setMarkdownContent(markdownContent)
        
        saveToHistory()
        
        message.success('已清空表格内容')
      },
    },
    {
      key: 'reset-table',
      label: '重置表格',
      onClick: () => {
        const defaultData = {
          headers: ['列1', '列2', '列3'],
          rows: [['', '', '']],
          alignments: ['left', 'left', 'left'] as ('left' | 'center' | 'right')[],
        }
        setTableData(defaultData)
        
        const markdownContent = ImportExportManager.exportToMarkdown(defaultData)
        setMarkdownContent(markdownContent)
        
        saveToHistory()
        
        message.success('已重置表格')
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'transpose',
      label: '转置表格',
      onClick: () => {
        const newHeaders = ['列1', ...tableData.rows.map((_, index) => `列${index + 2}`)]
        const newRows = tableData.headers.map((header, headerIndex) => [
          header,
          ...tableData.rows.map(row => row[headerIndex] || '')
        ])
        const newAlignments = new Array(newHeaders.length).fill('left') as ('left' | 'center' | 'right')[]
        
        const newData = {
          headers: newHeaders,
          rows: newRows,
          alignments: newAlignments,
        }
        setTableData(newData)
        
        const markdownContent = ImportExportManager.exportToMarkdown(newData)
        setMarkdownContent(markdownContent)
        
        saveToHistory()
        
        message.success('已转置表格')
      },
    },
  ]

  return (
    <Space size="small" wrap>
      {/* 行列操作 */}
      <Space.Compact>
        <Tooltip title="添加行">
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={addRow}
          />
        </Tooltip>
        
        <Tooltip title="删除行">
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={deleteRow}
            disabled={selectedCells.length === 0}
          />
        </Tooltip>
      </Space.Compact>

      <Space.Compact>
        <Tooltip title="添加列">
          <Button
            size="small"
            icon={<PlusOutlined style={{ transform: 'rotate(90deg)' }} />}
            onClick={addColumn}
          />
        </Tooltip>
        
        <Tooltip title="删除列">
          <Button
            size="small"
            icon={<MinusOutlined style={{ transform: 'rotate(90deg)' }} />}
            onClick={deleteColumn}
            disabled={selectedCells.length === 0}
          />
        </Tooltip>
      </Space.Compact>

      {/* 对齐方式 */}
      <Space.Compact>
        <Tooltip title="左对齐">
          <Button
            size="small"
            icon={<AlignLeftOutlined />}
            onClick={() => setAlignment('left')}
            disabled={selectedCells.length === 0}
          />
        </Tooltip>
        
        <Tooltip title="居中对齐">
          <Button
            size="small"
            icon={<AlignCenterOutlined />}
            onClick={() => setAlignment('center')}
            disabled={selectedCells.length === 0}
          />
        </Tooltip>
        
        <Tooltip title="右对齐">
          <Button
            size="small"
            icon={<AlignRightOutlined />}
            onClick={() => setAlignment('right')}
            disabled={selectedCells.length === 0}
          />
        </Tooltip>
      </Space.Compact>

      {/* 复制粘贴 */}
      <Space.Compact>
        <Tooltip title="复制 (Ctrl+C)">
          <Button
            size="small"
            icon={<CopyOutlined />}
            onClick={copySelectedCells}
            disabled={selectedCells.length === 0}
          />
        </Tooltip>
        
        <Tooltip title="粘贴 (Ctrl+V)">
          <Button
            size="small"
            icon={<SnippetsOutlined />}
            onClick={pasteData}
          />
        </Tooltip>
      </Space.Compact>

      {/* 排序 */}
      <Space.Compact>
        <Tooltip title="升序排序">
          <Button
            size="small"
            icon={<SortAscendingOutlined />}
            onClick={() => sortColumn(true)}
            disabled={selectedCells.length === 0}
          />
        </Tooltip>
        
        <Tooltip title="降序排序">
          <Button
            size="small"
            icon={<SortDescendingOutlined />}
            onClick={() => sortColumn(false)}
            disabled={selectedCells.length === 0}
          />
        </Tooltip>
      </Space.Compact>

      {/* 更多操作 */}
      <Dropdown menu={{ items: moreMenuItems }} placement="bottomLeft">
        <Button size="small" icon={<MoreOutlined />} />
      </Dropdown>
    </Space>
  )
}

export default Toolbar