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
        <div className="modal-title-inline">
          <SettingOutlined className="modal-title-icon" />
          {t('header.settings')}
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={720}
      destroyOnHidden
      centered
      className="app-modal app-modal-settings"
      closeIcon={
        <CloseOutlined className="modal-close-icon" />
      }
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.3)' },
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
