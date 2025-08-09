import React from 'react'
import { Modal, Typography, Space, Divider, Tag, Button } from 'antd'
import { GithubOutlined, HeartOutlined } from '@ant-design/icons'
import { useI18n } from '@/i18n'

const { Title, Paragraph, Text } = Typography

interface AboutModalProps {
  visible: boolean
  onClose: () => void
}

const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose }) => {
  const { t } = useI18n()

  const features = [
    'Visual table editing with drag & drop',
    'Real-time Markdown synchronization',
    'Multiple import/export formats',
    'Rich styling and formatting options',
    'Keyboard shortcuts support',
    'Undo/Redo functionality',
    'Multi-language support',
    'Dark/Light theme'
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
        <Button key="github" icon={<GithubOutlined />} onClick={() => window.open('https://github.com', '_blank')}>
          View on GitHub
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
          <Title level={2} style={{ marginBottom: 8, color: '#1890ff' }}>
            📊 Markdown Table Editor
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            A powerful web application for visualizing and editing Markdown tables
          </Text>
          <div style={{ marginTop: 12 }}>
            <Tag color="blue">v1.0.0</Tag>
            <Tag color="green">React 18</Tag>
            <Tag color="orange">TypeScript</Tag>
          </div>
        </div>

        <Divider />

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <Title level={4}>✨ What is this?</Title>
          <Paragraph>
            This is a feature-rich web application designed to make working with Markdown tables 
            intuitive and efficient. Whether you're creating documentation, organizing data, or 
            preparing content for your projects, our editor provides a seamless visual interface 
            for table creation and editing.
          </Paragraph>
        </div>

        {/* Key Features */}
        <div style={{ marginBottom: 24 }}>
          <Title level={4}>🚀 Key Features</Title>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
            {features.map((feature, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#52c41a', marginRight: 8 }}>✓</span>
                <Text>{feature}</Text>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Formats */}
        <div style={{ marginBottom: 24 }}>
          <Title level={4}>📁 Supported Formats</Title>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <Text strong>Import:</Text>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {supportedFormats.import.map((format, index) => (
                  <li key={index}><Text type="secondary">{format}</Text></li>
                ))}
              </ul>
            </div>
            <div>
              <Text strong>Export:</Text>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {supportedFormats.export.map((format, index) => (
                  <li key={index}><Text type="secondary">{format}</Text></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div style={{ marginBottom: 24 }}>
          <Title level={4}>🎯 Quick Start</Title>
          <ol style={{ paddingLeft: 20 }}>
            <li><Text>Start editing the default table or import your own data</Text></li>
            <li><Text>Use the visual editor to modify cells, add/remove rows and columns</Text></li>
            <li><Text>Apply styling using the sidebar style panel</Text></li>
            <li><Text>Export your table in your preferred format</Text></li>
          </ol>
        </div>

        {/* Keyboard Shortcuts */}
        <div style={{ marginBottom: 24 }}>
          <Title level={4}>⌨️ Keyboard Shortcuts</Title>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: 13 }}>
            <div><Text code>Ctrl+O</Text> <Text type="secondary">Open file</Text></div>
            <div><Text code>Ctrl+S</Text> <Text type="secondary">Save as Markdown</Text></div>
            <div><Text code>Ctrl+Z</Text> <Text type="secondary">Undo</Text></div>
            <div><Text code>Ctrl+Shift+Z</Text> <Text type="secondary">Redo</Text></div>
            <div><Text code>F11</Text> <Text type="secondary">Toggle sidebar</Text></div>
            <div><Text code>Tab</Text> <Text type="secondary">Navigate cells</Text></div>
          </div>
        </div>

        <Divider />

        {/* Footer */}
        <div style={{ textAlign: 'center' }}>
          <Space>
            <Text type="secondary">Made with</Text>
            <HeartOutlined style={{ color: '#ff4d4f' }} />
            <Text type="secondary">by the community</Text>
          </Space>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Open source • MIT License • Built with React & Ant Design
            </Text>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default AboutModal