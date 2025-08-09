import React from 'react'
import {
  Card,
  Switch,
  Select,
  Slider,
  Space,
  Typography,
  Divider,
  Button,
  InputNumber,
  Radio,
  Tooltip,
  App,
} from 'antd'
import {
  SettingOutlined,
  MoonOutlined,
  SunOutlined,
  SaveOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
} from '@ant-design/icons'
import { useTableStore } from '@/store'
import { useI18n, languages } from '@/i18n'

const { Title, Text } = Typography
const { Option } = Select

const SettingsPanel: React.FC = () => {
  const { message } = App.useApp()
  const { t, language, setLanguage } = useI18n()
  const {
    settings,
    updateSettings,
    resetSettings,
  } = useTableStore()

  // 保存设置到本地存储
  const saveSettings = () => {
    try {
      localStorage.setItem('markdown-table-editor-settings', JSON.stringify(settings))
      message.success(t('settings.settingsSaved'))
    } catch (error) {
      message.error(t('settings.saveSettingsFailed'))
    }
  }

  // 从本地存储加载设置
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('markdown-table-editor-settings')
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        updateSettings(parsedSettings)
        message.success(t('settings.settingsLoaded'))
      } else {
        message.info(t('settings.noSavedSettings'))
      }
    } catch (error) {
      message.error(t('settings.loadSettingsFailed'))
    }
  }

  // 重置设置
  const handleResetSettings = () => {
    resetSettings()
    message.success(t('settings.settingsReset'))
  }

  // 导出设置
  const exportSettings = () => {
    try {
      const dataStr = JSON.stringify(settings, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'markdown-table-editor-settings.json'
      link.click()
      URL.revokeObjectURL(url)
      message.success(t('settings.settingsExported'))
    } catch (error) {
      message.error(t('settings.exportSettingsFailed'))
    }
  }

  // 导入设置
  const importSettings = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const importedSettings = JSON.parse(text)
        updateSettings(importedSettings)
        message.success(t('settings.settingsImported'))
      } catch (error) {
        message.error(t('settings.checkFileFormat'))
      }
    }
    input.click()
  }

  return (
    <div style={{ 
      padding: '24px', 
      height: '100%', 
      overflow: 'auto',
      background: 'var(--surface-color)'
    }}>
      {/* 外观设置 */}
      <Card 
        size="small" 
        title={
          <span style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-color)'
          }}>
            {t('settings.appearance')}
          </span>
        }
        style={{ 
          marginBottom: 20,
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 1px 3px 0 var(--shadow)',
          background: 'var(--bg-color)'
        }}
        styles={{
          header: {
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px'
          },
          body: {
            padding: '20px'
          }
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 0'
          }}>
            <Space>
              {settings.theme === 'dark' ? 
                <MoonOutlined style={{ color: '#6366f1', fontSize: '16px' }} /> : 
                <SunOutlined style={{ color: '#f59e0b', fontSize: '16px' }} />
              }
              <Text style={{ fontSize: '14px', fontWeight: 500 }}>{t('settings.darkMode')}</Text>
            </Space>
            <Switch
              checked={settings.theme === 'dark'}
              onChange={(checked) => updateSettings({ theme: checked ? 'dark' : 'light' })}
            />
          </div>
          
          <div>
            <Text type="secondary" style={{ 
              fontSize: '13px', 
              display: 'block', 
              marginBottom: 12,
              fontWeight: 500,
              color: 'var(--text-secondary)'
            }}>{t('settings.language')}</Text>
            <Select
              value={language}
              onChange={(value) => {
                setLanguage(value)
                updateSettings({ language: value })
              }}
              style={{ 
                width: '100%',
                borderRadius: '8px'
              }}
              size="middle"
            >
              {languages.map(lang => (
                <Option key={lang.value} value={lang.value}>{lang.label}</Option>
              ))}
            </Select>
          </div>
          
          <div>
            <Text type="secondary" style={{ 
              fontSize: '13px', 
              display: 'block', 
              marginBottom: 12,
              fontWeight: 500,
              color: 'var(--text-secondary)'
            }}>{t('settings.fontSize')}</Text>
            <Slider
              value={settings.fontSize}
              onChange={(value) => updateSettings({ fontSize: value })}
              min={12}
              max={20}
              step={1}
              marks={{
                12: '12px',
                14: '14px',
                16: '16px',
                18: '18px',
                20: '20px',
              }}
            />
          </div>
        </Space>
      </Card>

      {/* 编辑器设置 */}
      <Card 
        size="small" 
        title={
          <span style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-color)'
          }}>
            {t('settings.editor')}
          </span>
        }
        style={{ 
          marginBottom: 20,
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 1px 3px 0 var(--shadow)',
          background: 'var(--bg-color)'
        }}
        styles={{
          header: {
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px'
          },
          body: {
            padding: '20px'
          }
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 0'
          }}>
            <Text style={{ fontSize: '14px', fontWeight: 500 }}>{t('settings.autoSave')}</Text>
            <Switch
              checked={settings.autoSave}
              onChange={(checked) => updateSettings({ autoSave: checked })}
            />
          </div>
          
          {settings.autoSave && (
            <div>
              <Text type="secondary" style={{ 
                fontSize: '13px', 
                display: 'block', 
                marginBottom: 12,
                fontWeight: 500,
                color: 'var(--text-secondary)'
              }}>{t('settings.autoSaveInterval')}</Text>
              <InputNumber
                value={settings.autoSaveInterval}
                onChange={(value) => updateSettings({ autoSaveInterval: value || 30 })}
                min={10}
                max={300}
                step={10}
                style={{ 
                  width: '100%',
                  borderRadius: '8px'
                }}
                size="middle"
              />
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>{t('settings.showLineNumbers')}</Text>
            <Switch
              checked={settings.showLineNumbers}
              onChange={(checked) => updateSettings({ showLineNumbers: checked })}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>{t('settings.syntaxHighlight')}</Text>
            <Switch
              checked={settings.enableSyntaxHighlight}
              onChange={(checked) => updateSettings({ enableSyntaxHighlight: checked })}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>{t('settings.wordWrap')}</Text>
            <Switch
              checked={settings.wordWrap}
              onChange={(checked) => updateSettings({ wordWrap: checked })}
            />
          </div>
        </Space>
      </Card>

      {/* 表格设置 */}
      <Card 
        size="small" 
        title={
          <span style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-color)'
          }}>
            {t('settings.table')}
          </span>
        }
        style={{ 
          marginBottom: 20,
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 1px 3px 0 var(--shadow)',
          background: 'var(--bg-color)'
        }}
        styles={{
          header: {
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px'
          },
          body: {
            padding: '20px'
          }
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{t('settings.defaultAlignment')}</Text>
            <Radio.Group
              value={settings.defaultAlignment}
              onChange={(e) => updateSettings({ defaultAlignment: e.target.value })}
              size="small"
            >
              <Radio.Button value="left">{t('table.alignLeft')}</Radio.Button>
              <Radio.Button value="center">{t('table.alignCenter')}</Radio.Button>
              <Radio.Button value="right">{t('table.alignRight')}</Radio.Button>
            </Radio.Group>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>{t('settings.showGridLines')}</Text>
            <Switch
              checked={settings.showGridLines}
              onChange={(checked) => updateSettings({ showGridLines: checked })}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>{t('settings.alternateRowColors')}</Text>
            <Switch
              checked={settings.alternateRowColors}
              onChange={(checked) => updateSettings({ alternateRowColors: checked })}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>{t('settings.resizableColumns')}</Text>
            <Switch
              checked={settings.resizableColumns}
              onChange={(checked) => updateSettings({ resizableColumns: checked })}
            />
          </div>
          
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{t('settings.maxHistorySize')}</Text>
            <InputNumber
              value={settings.maxHistorySize}
              onChange={(value) => updateSettings({ maxHistorySize: value || 50 })}
              min={10}
              max={200}
              step={10}
              style={{ width: '100%' }}
              size="small"
            />
          </div>
        </Space>
      </Card>

      {/* 导入导出设置 */}
      <Card 
        size="small" 
        title={
          <span style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-color)'
          }}>
            {t('settings.importExport')}
          </span>
        }
        style={{ 
          marginBottom: 20,
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 1px 3px 0 var(--shadow)',
          background: 'var(--bg-color)'
        }}
        styles={{
          header: {
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px'
          },
          body: {
            padding: '20px'
          }
        }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{t('settings.defaultExportFormat')}</Text>
            <Select
              value={settings.defaultExportFormat}
              onChange={(value) => updateSettings({ defaultExportFormat: value })}
              style={{ width: '100%' }}
              size="small"
            >
              <Option value="markdown">Markdown</Option>
              <Option value="csv">CSV</Option>
              <Option value="excel">Excel</Option>
              <Option value="json">JSON</Option>
              <Option value="html">HTML</Option>
            </Select>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>{t('settings.exportWithStyles')}</Text>
            <Switch
              checked={settings.exportWithStyles}
              onChange={(checked) => updateSettings({ exportWithStyles: checked })}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>{t('settings.compressExports')}</Text>
            <Switch
              checked={settings.compressExports}
              onChange={(checked) => updateSettings({ compressExports: checked })}
            />
          </div>
        </Space>
      </Card>

      {/* 性能设置 */}
      <Card 
        size="small" 
        title={
          <span style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-color)'
          }}>
            {t('settings.performance')}
          </span>
        }
        style={{ 
          marginBottom: 20,
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 1px 3px 0 var(--shadow)',
          background: 'var(--bg-color)'
        }}
        styles={{
          header: {
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px'
          },
          body: {
            padding: '20px'
          }
        }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>{t('settings.enableVirtualScrolling')}</Text>
            <Tooltip title="大表格时提升性能">
              <Switch
                checked={settings.enableVirtualScrolling}
                onChange={(checked) => updateSettings({ enableVirtualScrolling: checked })}
              />
            </Tooltip>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>{t('settings.lazyRendering')}</Text>
            <Tooltip title="减少初始加载时间">
              <Switch
                checked={settings.lazyRendering}
                onChange={(checked) => updateSettings({ lazyRendering: checked })}
              />
            </Tooltip>
          </div>
          
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{t('settings.renderDelay')}</Text>
            <InputNumber
              value={settings.renderDelay}
              onChange={(value) => updateSettings({ renderDelay: value || 100 })}
              min={0}
              max={1000}
              step={50}
              style={{ width: '100%' }}
              size="small"
            />
          </div>
        </Space>
      </Card>

      {/* 设置管理 */}
      <Card 
        size="small" 
        title={
          <span style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-color)'
          }}>
            {t('settings.management')}
          </span>
        }
        style={{ 
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 1px 3px 0 var(--shadow)',
          background: 'var(--bg-color)'
        }}
        styles={{
          header: {
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px'
          },
          body: {
            padding: '20px'
          }
        }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button
              size="middle"
              icon={<SaveOutlined />}
              onClick={saveSettings}
              style={{
                borderRadius: '8px',
                fontWeight: 500,
                height: '36px'
              }}
            >
              {t('settings.saveSettings')}
            </Button>
            
            <Button
              size="middle"
              icon={<ReloadOutlined />}
              onClick={loadSettings}
              style={{
                borderRadius: '8px',
                fontWeight: 500,
                height: '36px'
              }}
            >
              {t('settings.loadSettings')}
            </Button>
          </Space>
          
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button
              size="middle"
              icon={<ExportOutlined />}
              onClick={exportSettings}
              style={{
                borderRadius: '8px',
                fontWeight: 500,
                height: '36px'
              }}
            >
              {t('settings.exportSettings')}
            </Button>
            
            <Button
              size="middle"
              icon={<ImportOutlined />}
              onClick={importSettings}
              style={{
                borderRadius: '8px',
                fontWeight: 500,
                height: '36px'
              }}
            >
              {t('settings.importSettings')}
            </Button>
          </Space>
          
          <Button
            size="middle"
            icon={<ReloadOutlined />}
            onClick={handleResetSettings}
            danger
            block
            style={{
              borderRadius: '8px',
              fontWeight: 500,
              height: '40px',
              marginTop: '8px'
            }}
          >
            {t('settings.resetToDefault')}
          </Button>
        </Space>
      </Card>
    </div>
  )
}

export default SettingsPanel