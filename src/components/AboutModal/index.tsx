import React from 'react'
import { Modal, Typography, Space, Divider, Tag, Button } from 'antd'
import {
  AppstoreOutlined,
  CheckCircleFilled,
  CodeOutlined,
  ExportOutlined,
  GithubOutlined,
  HeartFilled,
  LinkOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
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
      className="app-modal app-modal-about"
      footer={[
        <Button key="orangely" onClick={() => window.open('https://orangely.xyz', '_blank')} className="modal-footer-button">
          Orangely
        </Button>,
        <Button key="orangely-app" onClick={() => window.open('https://mditor.orangely.xyz', '_blank')} className="modal-footer-button">
          mditor.orangely.xyz
        </Button>,
        <Button
          key="github"
          icon={<GithubOutlined />}
          onClick={() => window.open('https://github.com/mingzhangyang/mditor', '_blank')}
          className="modal-footer-button"
        >
          {t('about.viewOnGithub')}
        </Button>,
        <Button key="close" type="primary" onClick={onClose} className="header-save-button">
          {t('common.close')}
        </Button>
      ]}
      width={600}
      centered
    >
      <div className="app-modal-body">
        <div className="app-modal-hero">
          <div className="app-modal-hero-mark" aria-hidden="true">
            <AppstoreOutlined />
          </div>
          <Title level={2} className="app-modal-title">
            {t('about.title')}
          </Title>
          <Text type="secondary" className="app-modal-subtitle">
            {t('about.subtitle')}
          </Text>
          <div className="app-modal-tag-row">
            <Tag bordered={false} className="app-brand-tag">v1.0.0</Tag>
            <Tag bordered={false} className="app-tag-neutral">React 18</Tag>
            <Tag bordered={false} className="app-tag-neutral">TypeScript</Tag>
            <a href="https://orangely.xyz" target="_blank" rel="noreferrer">
              <Tag bordered={false} className="app-tag-neutral">Orangely</Tag>
            </a>
            <a href="https://mditor.orangely.xyz" target="_blank" rel="noreferrer">
              <Tag bordered={false} className="app-tag-neutral">mditor.orangely.xyz</Tag>
            </a>
          </div>
        </div>

        <Divider />

        {/* Key Features */}
        <div className="app-modal-section">
          <Title level={4} className="app-modal-section-title">
            <ThunderboltOutlined /> {t('about.features')}
          </Title>
          <div className="feature-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-chip">
                <CheckCircleFilled />
                <Text>{feature}</Text>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Formats */}
        <div className="app-modal-section">
          <Title level={4} className="app-modal-section-title">
            <ExportOutlined /> {t('about.supportedFormats')}
          </Title>
          <div className="info-grid">
            <div className="info-card">
              <Text strong>{t('about.importFormats')}:</Text>
              <ul className="modal-list">
                {supportedFormats.import.map((format, index) => (
                  <li key={index}><Text type="secondary">{format}</Text></li>
                ))}
              </ul>
            </div>
            <div className="info-card">
              <Text strong>{t('about.exportFormats')}:</Text>
              <ul className="modal-list">
                {supportedFormats.export.map((format, index) => (
                  <li key={index}><Text type="secondary">{format}</Text></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="app-modal-section">
          <Title level={4} className="app-modal-section-title">
            <CodeOutlined /> {t('about.keyboardShortcuts')}
          </Title>
          <div className="shortcut-grid shortcut-grid-compact">
            <div className="shortcut-card"><Text code>Ctrl+O</Text><Text type="secondary">{t('about.openFile')}</Text></div>
            <div className="shortcut-card"><Text code>Ctrl+S</Text><Text type="secondary">{t('about.saveFile')}</Text></div>
            <div className="shortcut-card"><Text code>Ctrl+Z</Text><Text type="secondary">{t('about.undo')}</Text></div>
            <div className="shortcut-card"><Text code>Ctrl+Shift+Z</Text><Text type="secondary">{t('about.redo')}</Text></div>
            <div className="shortcut-card"><Text code>F11</Text><Text type="secondary">{t('about.toggleSidebar')}</Text></div>
            <div className="shortcut-card"><Text code>Tab</Text><Text type="secondary">{t('about.navigateCells')}</Text></div>
          </div>
        </div>

        <Divider />

        {/* Footer */}
        <div className="app-modal-footer-note">
          <Space>
            <Text type="secondary">{t('about.madeWith')}</Text>
            <HeartFilled style={{ color: 'var(--error-color)' }} />
            <Text type="secondary">{t('about.byTheCommunity')}</Text>
          </Space>
          <div className="modal-footer-links">
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('about.openSource')} • {t('about.mitLicense')} • {t('about.builtWith')}
            </Text>
            <LinkOutlined />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default AboutModal
