import React, { useState } from 'react'
import {
  List,
  Button,
  Typography,
  Space,
  Tag,
  Empty,
  Card,
  Input,
  Upload,
  Popconfirm,
  Tooltip,
  Modal,
  App,
} from 'antd'
import {
  FileTextOutlined,
  SaveOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  PlusOutlined,
  CopyOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useTableStore } from '@/store'
import { ImportExportManager } from '@/utils/importExport'
import { useI18n } from '@/i18n'
import type { FileInfo } from '@/types'

const { Text } = Typography
const { Search } = Input
const { Dragger } = Upload

const FilePanel: React.FC = () => {
  const { message } = App.useApp()
  const { t } = useI18n()
  const {
    files,
    currentFile,
    addFile,
    removeFile,
    setCurrentFile,
    updateFile,
    tableData,
    cellStyles,
    settings,
    setTableData,
    setMarkdownContent,
    saveToHistory,
  } = useTableStore()

  const [searchText, setSearchText] = useState('')
  const [isNewFileModalVisible, setIsNewFileModalVisible] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [previewModalVisible, setPreviewModalVisible] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null)



  // 过滤文件列表
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchText.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchText.toLowerCase())
  )

  // 创建新文件
  const handleCreateNewFile = () => {
    if (!newFileName.trim()) {
      message.error(t('files.pleaseEnterFileName'))
      return
    }

    const newFile: FileInfo = {
      id: Date.now().toString(),
      name: newFileName.trim(),
      type: 'markdown',
      size: 0,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      data: {
        headers: ['列1', '列2', '列3'],
        rows: [['', '', '']],
        alignments: ['left', 'left', 'left'],
      },
      description: '新建的 Markdown 表格文件',
    }

    addFile(newFile)
    setCurrentFile(newFile.id)
    setTableData(newFile.data)
    
    const markdownContent = ImportExportManager.exportToMarkdown(newFile.data)
    setMarkdownContent(markdownContent)
    
    saveToHistory()

    setNewFileName('')
    setIsNewFileModalVisible(false)
    message.success(`${t('files.fileCreatedSuccess')}: ${newFile.name}`)
  }

  // 打开文件
  const handleOpenFile = (file: FileInfo) => {
    setCurrentFile(file.id)
    setTableData(file.data)
    
    const markdownContent = ImportExportManager.exportToMarkdown(file.data)
    setMarkdownContent(markdownContent)
    
    saveToHistory()

    message.success(`${t('files.fileOpenedSuccess')}: ${file.name}`)
  }

  // 保存当前文件
  const handleSaveCurrentFile = () => {
    if (!currentFile) {
      message.error(t('files.noOpenFile'))
      return
    }

    const file = files.find(f => f.id === currentFile)
    if (!file) {
      message.error(t('files.fileNotExist'))
      return
    }

    const updatedFile: FileInfo = {
      ...file,
      data: tableData,
      modifiedAt: Date.now(),
      size: JSON.stringify(tableData).length,
    }

    updateFile(updatedFile)
    message.success(`${t('files.fileSavedSuccess')}: ${file.name}`)
  }

  // 删除文件
  const handleDeleteFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (!file) return

    removeFile(fileId)
    
    if (currentFile === fileId) {
      setCurrentFile(null)
      // 重置为默认表格
      const defaultData = {
        headers: ['列1', '列2', '列3'],
        rows: [['', '', '']],
        alignments: ['left', 'left', 'left'] as ('left' | 'center' | 'right')[],
      }
      setTableData(defaultData)
      const markdownContent = ImportExportManager.exportToMarkdown(defaultData)
      setMarkdownContent(markdownContent)
    }

    message.success(`${t('files.fileDeletedSuccess')}: ${file.name}`)
  }

  // 复制文件
  const handleCopyFile = (file: FileInfo) => {
    const copiedFile: FileInfo = {
      ...file,
      id: Date.now().toString(),
      name: `${file.name} - 副本`,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    }

    addFile(copiedFile)
    message.success(`${t('files.fileCopiedSuccess')}: ${file.name}`)
  }

  // 预览文件
  const handlePreviewFile = (file: FileInfo) => {
    setPreviewFile(file)
    setPreviewModalVisible(true)
  }

  // 导出文件
  const handleExportFile = async (file: FileInfo, format: string) => {
    try {
      const fileName = `${file.name.replace(/\.[^/.]+$/, '')}.${format}`
      const exportOptions = {
        format: format as 'markdown' | 'html' | 'csv' | 'excel' | 'png' | 'svg',
        includeStyles: true,
        filename: fileName
      }
      await ImportExportManager.export(file.data, exportOptions, cellStyles, settings)
      message.success(`${t('files.exportSuccess')}: ${fileName}`)
    } catch (error) {
      message.error(t('files.exportFailed'))
    }
  }

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    try {
      const result = await ImportExportManager.import(file)
      if (result.success && result.data) {
        const newFile: FileInfo = {
          id: Date.now().toString(),
          name: file.name,
          type: file.name.endsWith('.md') ? 'markdown' : 'other',
          size: file.size,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          data: result.data,
          description: `从 ${file.name} 导入的表格`,
        }

        addFile(newFile)
        message.success(`${t('files.importSuccess')}: ${file.name}`)
      } else {
        message.error(result.error || t('files.importFailed'))
      }
    } catch (error) {
      message.error(t('files.importError'))
    }
    return false // 阻止默认上传行为
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      {/* 文件操作 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button
              size="small"
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => setIsNewFileModalVisible(true)}
            >
              {t('files.newFile')}
            </Button>
            
            <Button
              size="small"
              icon={<SaveOutlined />}
              onClick={handleSaveCurrentFile}
              disabled={!currentFile}
            >
              {t('files.save')}
            </Button>
          </Space>
          
          <Search
            placeholder={t('files.searchPlaceholder')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="small"
            allowClear
          />
        </Space>
      </Card>

      {/* 文件上传 */}
      <Card size="small" title={t('files.importFile')} style={{ marginBottom: 16 }}>
        <Dragger
          accept=".md,.csv,.xlsx,.xls,.json"
          beforeUpload={handleFileUpload}
          showUploadList={false}
          style={{ padding: '16px 8px' }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">{t('files.clickOrDragToUpload')}</p>
          <p className="ant-upload-hint">
            {t('files.supportedFormats')}
          </p>
        </Dragger>
      </Card>

      {/* 文件列表 */}
      <Card size="small" title={`${t('files.fileList')} (${filteredFiles.length})`}>
        {filteredFiles.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={searchText ? t('files.noMatchingFiles') : t('files.noFiles')}
            style={{ margin: '20px 0' }}
          />
        ) : (
          <List
            size="small"
            dataSource={filteredFiles}
            renderItem={(file: FileInfo) => {
              const isCurrent = currentFile === file.id
              
              return (
                <List.Item
                  style={{
                    padding: '8px 12px',
                    backgroundColor: isCurrent ? 'var(--hover-bg)' : 'var(--bg-color)',
                    border: isCurrent ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                    borderRadius: 6,
                    marginBottom: 8,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleOpenFile(file)}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Space size="small">
                        <FileTextOutlined style={{ color: isCurrent ? '#1890ff' : '#8c8c8c' }} />
                        <Text 
                          strong={isCurrent}
                          style={{ color: isCurrent ? '#1890ff' : '#262626' }}
                        >
                          {file.name}
                        </Text>
                        {isCurrent && (
                          <Tag color="blue">
                            {t('files.current')}
                          </Tag>
                        )}
                      </Space>
                      
                      <Space size="small">
                        <Tooltip title={t('files.preview')}>
                          <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePreviewFile(file)
                            }}
                          />
                        </Tooltip>
                        
                        <Tooltip title={t('files.copy')}>
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyFile(file)
                            }}
                          />
                        </Tooltip>
                        
                        <Tooltip title={t('files.export')}>
                          <Button
                            type="text"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleExportFile(file, 'markdown')
                            }}
                          />
                        </Tooltip>
                        
                        <Popconfirm
                          title={t('files.deleteConfirm')}
                          onConfirm={(e) => {
                            e?.stopPropagation()
                            handleDeleteFile(file.id)
                          }}
                          okText={t('files.ok')}
                          cancelText={t('files.cancel')}
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Popconfirm>
                      </Space>
                    </div>
                    
                    {file.description && (
                      <div style={{ marginBottom: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {file.description}
                        </Text>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Space size="small">
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {file.data.rows.length}{t('files.rows')} × {file.data.headers.length}{t('files.columns')}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatFileSize(file.size)}
                        </Text>
                      </Space>
                      
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatTime(file.modifiedAt)}
                      </Text>
                    </div>
                  </div>
                </List.Item>
              )
            }}
          />
        )}
      </Card>

      {/* 新建文件模态框 */}
      <Modal
        title={t('files.newFile')}
        open={isNewFileModalVisible}
        onOk={handleCreateNewFile}
        onCancel={() => {
          setIsNewFileModalVisible(false)
          setNewFileName('')
        }}
        okText={t('files.createFile')}
        cancelText={t('files.cancel')}
      >
        <Input
          placeholder={t('files.enterFileName')}
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          onPressEnter={handleCreateNewFile}
          suffix=".md"
        />
      </Modal>

      {/* 文件预览模态框 */}
      <Modal
        title={`${t('files.preview')}: ${previewFile?.name}`}
        open={previewModalVisible}
        onCancel={() => {
          setPreviewModalVisible(false)
          setPreviewFile(null)
        }}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            {t('files.close')}
          </Button>,
          <Button 
            key="open" 
            type="primary" 
            onClick={() => {
              if (previewFile) {
                handleOpenFile(previewFile)
                setPreviewModalVisible(false)
              }
            }}
          >
            {t('files.openFile')}
          </Button>,
        ]}
        width={800}
      >
        {previewFile && (
          <div>
            <Space direction="vertical" size="small" style={{ width: '100%', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">{t('files.fileSize')}:</Text>
                <Text>{formatFileSize(previewFile.size)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">{t('files.createTime')}:</Text>
                <Text>{formatTime(previewFile.createdAt)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">{t('files.modifyTime')}:</Text>
                <Text>{formatTime(previewFile.modifiedAt)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">{t('files.tableSize')}:</Text>
                <Text>{previewFile.data.rows.length}{t('files.rows')} × {previewFile.data.headers.length}{t('files.columns')}</Text>
              </div>
            </Space>
            
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 6, padding: 16, backgroundColor: 'var(--surface-color)' }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('files.markdownPreview')}:</Text>
              <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
                {ImportExportManager.exportToMarkdown(previewFile.data)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default FilePanel