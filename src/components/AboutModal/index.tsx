import React from 'react'
import { Modal, Typography, Space, Divider, Tag, Button } from 'antd'
import { GithubOutlined, HeartOutlined } from '@ant-design/icons'
import { useI18n } from '@/i18n'

const { Title, Text } = Typography

interface AboutModalProps {
  visible: boolean
  onClose: () => void
}

const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose }) => {
  const { t } = useI18n()

  const features = [
    t('about.visualTableEditing'),
    t('about.realtimeMarkdownSync'),
    t('about.multipleImportExportFormats'),
    t('about.richStylingOptions'),
    t('about.keyboardShortcutsSupport'),
    t('about.undoRedoFunctionality'),
    t('about.multiLanguageSupport'),
    t('about.darkLightTheme')
  ]

  const supportedFormats = {
    import: ['Markdown (.md)', 'CSV (.csv)', 'Excel (.xlsx)', 'JSON (.json)'],
    export: ['Markdown (.md)', 'CSV (.csv)', 'Excel (.xlsx)', 'HTML (.html)', 'PNG (.png)', 'SVG (.svg)']
  }

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="orangely" onClick={() => window.open('https://orangely.xyz', '_blank')}>
          Orangely
        </Button>,
        <Button key="orangely-app" onClick={() => window.open('https://mditor.orangely.xyz', '_blank')}>
          mditor.orangely.xyz
        </Button>,
        <Button key="github" icon={<GithubOutlined />} onClick={() => window.open('https://github.com/mingzhangyang/mditor', '_blank')}>
          {t('about.viewOnGithub')}
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          {t('common.close')}
        </Button>
      ]}
      width={600}
      centered
    >
      <div style={{ padding: '20px 0' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8, color: 'var(--primary-color)' }}>
            📊 {t('about.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            {t('about.subtitle')}
          </Text>
          <div style={{ marginTop: 12 }}>
            <Tag color="blue">v1.0.0</Tag>
            <Tag color="green">React 18</Tag>
            <Tag color="orange">TypeScript</Tag>
            <a href="https://orangely.xyz" target="_blank" rel="noreferrer" style={{ marginLeft: 4 }}>
              <Tag color="purple">Orangely</Tag>
            </a>
            <a href="https://mditor.orangely.xyz" target="_blank" rel="noreferrer" style={{ marginLeft: 4 }}>
              <Tag color="geekblue">mditor.orangely.xyz</Tag>
            </a>
          </div>
        </div>

        <Divider />

        {/* Key Features */}
        <div style={{ marginBottom: 24 }}>
          <Title level={4}>🚀 {t('about.features')}</Title>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
            {features.map((feature, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: 'var(--success-color)', marginRight: 8 }}>✓</span>
                <Text>{feature}</Text>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Formats */}
        <div style={{ marginBottom: 24 }}>
          <Title level={4}>📁 {t('about.supportedFormats')}</Title>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <Text strong>{t('about.importFormats')}:</Text>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {supportedFormats.import.map((format, index) => (
                  <li key={index}><Text type="secondary">{format}</Text></li>
                ))}
              </ul>
            </div>
            <div>
              <Text strong>{t('about.exportFormats')}:</Text>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {supportedFormats.export.map((format, index) => (
                  <li key={index}><Text type="secondary">{format}</Text></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div style={{ marginBottom: 24 }}>
          <Title level={4}>⌨️ {t('about.keyboardShortcuts')}</Title>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: 13 }}>
            <div><Text code>Ctrl+O</Text> <Text type="secondary">{t('about.openFile')}</Text></div>
            <div><Text code>Ctrl+S</Text> <Text type="secondary">{t('about.saveFile')}</Text></div>
            <div><Text code>Ctrl+Z</Text> <Text type="secondary">{t('about.undo')}</Text></div>
            <div><Text code>Ctrl+Shift+Z</Text> <Text type="secondary">{t('about.redo')}</Text></div>
            <div><Text code>F11</Text> <Text type="secondary">{t('about.toggleSidebar')}</Text></div>
            <div><Text code>Tab</Text> <Text type="secondary">{t('about.navigateCells')}</Text></div>
          </div>
        </div>

        <Divider />

        {/* Footer */}
        <div style={{ textAlign: 'center' }}>
          <Space>
            <Text type="secondary">{t('about.madeWith')}</Text>
            <HeartOutlined style={{ color: '#ff4d4f' }} />
            <Text type="secondary">{t('about.byTheCommunity')}</Text>
          </Space>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('about.openSource')} • {t('about.mitLicense')} • {t('about.builtWith')}
            </Text>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default AboutModal