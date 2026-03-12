import React from 'react'
import { Modal, Typography, Divider, Row, Col, Tag } from 'antd'
import {
  AppstoreOutlined,
  BgColorsOutlined,
  EyeOutlined,
  FileTextOutlined,
  FormOutlined,
  SettingOutlined,
  TableOutlined,
} from '@ant-design/icons'
import { useI18n } from '@/i18n'

const { Title, Text } = Typography

interface ShortcutsModalProps {
  visible: boolean
  onClose: () => void
}

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ visible, onClose }) => {
  const { t } = useI18n()

  const shortcutCategories = [
    {
      title: t('shortcuts.fileOperations'),
      icon: <FileTextOutlined />,
      shortcuts: [
        { key: 'Ctrl+O', description: t('shortcuts.openImportFile') },
        { key: 'Ctrl+S', description: t('shortcuts.saveAsMarkdown') },
        { key: 'Ctrl+Shift+S', description: t('shortcuts.exportMenu') },
        { key: 'Ctrl+N', description: t('shortcuts.newTable') }
      ]
    },
    {
      title: t('shortcuts.editing'),
      icon: <FormOutlined />,
      shortcuts: [
        { key: 'Ctrl+Z', description: t('shortcuts.undoLastAction') },
        { key: 'Ctrl+Shift+Z', description: t('shortcuts.redoLastAction') },
        { key: 'Ctrl+Y', description: t('shortcuts.redoAlternative') },
        { key: 'Delete', description: t('shortcuts.clearSelectedCells') },
        { key: 'Backspace', description: t('shortcuts.clearCellAndStartEditing') }
      ]
    },
    {
      title: t('shortcuts.navigation'),
      icon: <AppstoreOutlined />,
      shortcuts: [
        { key: 'Tab', description: t('shortcuts.moveToNextCell') },
        { key: 'Shift+Tab', description: t('shortcuts.moveToPreviousCell') },
        { key: 'Enter', description: t('shortcuts.moveToCellBelow') },
        { key: 'Shift+Enter', description: t('shortcuts.moveToCellAbove') },
        { key: '↑↓←→', description: t('shortcuts.navigateWithArrowKeys') },
        { key: 'Home', description: t('shortcuts.goToFirstCellInRow') },
        { key: 'End', description: t('shortcuts.goToLastCellInRow') }
      ]
    },
    {
      title: t('shortcuts.selectionCopyPaste'),
      icon: <FileTextOutlined />,
      shortcuts: [
        { key: 'Ctrl+A', description: t('shortcuts.selectAllCells') },
        { key: 'Ctrl+Click', description: t('shortcuts.multiSelectCells') },
        { key: 'Shift+Click', description: t('shortcuts.rangeSelectCells') },
        { key: 'Ctrl+C', description: t('shortcuts.copySelectedCells') },
        { key: 'Ctrl+V', description: t('shortcuts.pasteFromClipboard') },
        { key: 'Ctrl+X', description: t('shortcuts.cutSelectedCells') }
      ]
    },
    {
      title: t('shortcuts.tableStructure'),
      icon: <TableOutlined />,
      shortcuts: [
        { key: 'Ctrl+Shift+R', description: t('shortcuts.addRowAbove') },
        { key: 'Ctrl+R', description: t('shortcuts.addRowBelow') },
        { key: 'Ctrl+Shift+C', description: t('shortcuts.addColumnLeft') },
        { key: 'Ctrl+Alt+C', description: t('shortcuts.addColumnRight') },
        { key: 'Ctrl+Shift+D', description: t('shortcuts.deleteSelectedRow') },
        { key: 'Ctrl+Alt+D', description: t('shortcuts.deleteSelectedColumn') }
      ]
    },
    {
      title: t('shortcuts.formatting'),
      icon: <BgColorsOutlined />,
      shortcuts: [
        { key: 'Ctrl+B', description: t('shortcuts.toggleBold') },
        { key: 'Ctrl+I', description: t('shortcuts.toggleItalic') },
        { key: 'Ctrl+U', description: t('shortcuts.toggleUnderline') },
        { key: 'Ctrl+Shift+L', description: t('shortcuts.alignLeft') },
        { key: 'Ctrl+Shift+E', description: t('shortcuts.alignCenter') },
        { key: 'Ctrl+Shift+R', description: t('shortcuts.alignRight') }
      ]
    },
    {
      title: t('shortcuts.interface'),
      icon: <SettingOutlined />,
      shortcuts: [
        { key: 'F11', description: t('shortcuts.toggleSidebar') },
        { key: 'Ctrl+,', description: t('shortcuts.openSettings') },
        { key: 'F1', description: t('shortcuts.showHelp') },
        { key: 'Ctrl+/', description: t('shortcuts.showShortcuts') },
        { key: 'Escape', description: t('shortcuts.closeModalsOrCancelEditing') }
      ]
    },
    {
      title: t('shortcuts.view'),
      icon: <EyeOutlined />,
      shortcuts: [
        { key: 'Ctrl+1', description: t('shortcuts.tableView') },
        { key: 'Ctrl+2', description: t('shortcuts.markdownView') },
        { key: 'Ctrl+3', description: t('shortcuts.previewView') },
        { key: 'Ctrl+4', description: t('shortcuts.splitView') },
        { key: 'Ctrl++', description: t('shortcuts.zoomIn') },
        { key: 'Ctrl+-', description: t('shortcuts.zoomOut') },
        { key: 'Ctrl+0', description: t('shortcuts.resetZoom') }
      ]
    }
  ]

  return (
    <Modal
      title={
        <div className="app-modal-hero app-modal-hero-compact">
          <div className="app-modal-hero-mark" aria-hidden="true">
            <AppstoreOutlined />
          </div>
          <Title level={3} className="app-modal-title">{t('shortcuts.title')}</Title>
          <Text type="secondary" className="app-modal-subtitle">{t('shortcuts.subtitle')}</Text>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      className="app-modal app-modal-shortcuts"
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto' },
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.3)' }
      }}
    >
      <div className="app-modal-body">
        {shortcutCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="app-modal-section">
            <Title level={4} className="app-modal-section-title">
              {category.icon} {category.title}
            </Title>
            <Row gutter={[16, 12]}>
              {category.shortcuts.map((shortcut, index) => (
                <Col span={12} key={index}>
                  <div className="shortcut-card">
                    <Text style={{ flex: 1 }}>{shortcut.description}</Text>
                    <Tag className="shortcut-key-tag">
                      {shortcut.key}
                    </Tag>
                  </div>
                </Col>
              ))}
            </Row>
            {categoryIndex < shortcutCategories.length - 1 && <Divider />}
          </div>
        ))}
        
        <div className="info-card">
          <Text strong style={{ color: 'var(--success-color)' }}>{t('shortcuts.proTips')}:</Text>
          <ul className="modal-list">
            <li><Text>{t('shortcuts.tip1')} <Tag>Shift</Tag> {t('shortcuts.tip1Suffix')}</Text></li>
            <li><Text>{t('shortcuts.tip2')} <Tag>Ctrl+Click</Tag> {t('shortcuts.tip2Suffix')}</Text></li>
            <li><Text>{t('shortcuts.tip3')}</Text></li>
            <li><Text>{t('shortcuts.tip4')}</Text></li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default ShortcutsModal
