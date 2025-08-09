import React from 'react'
import { Modal } from 'antd'
import { SettingOutlined, CloseOutlined } from '@ant-design/icons'
import SettingsPanel from '../Sidebar/SettingsPanel'
import { useI18n } from '@/i18n'

interface SettingsModalProps {
  visible: boolean
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const { t } = useI18n()
  
  return (
    <Modal
      title={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text-color)',
          padding: '4px 0'
        }}>
          <SettingOutlined style={{ 
            marginRight: 12, 
            fontSize: '20px',
            color: 'var(--primary-color)'
          }} />
          {t('header.settings')}
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={720}
      destroyOnClose
      centered
      closeIcon={
        <CloseOutlined style={{
          fontSize: '16px',
          color: 'var(--text-secondary)',
          padding: '8px',
          borderRadius: '6px',
          transition: 'all 0.2s ease',
        }} />
      }
      styles={{
        header: {
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '16px',
          marginBottom: '0',
          background: 'var(--surface-color)'
        },
        body: {
          maxHeight: '75vh',
          overflowY: 'auto',
          padding: '0',
          background: 'var(--surface-color)'
        },
        content: {
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px var(--shadow), 0 10px 10px -5px var(--shadow)',
          border: 'none',
          background: 'var(--bg-color)'
        }
      }}
    >
      <SettingsPanel />
    </Modal>
  )
}

export default SettingsModal