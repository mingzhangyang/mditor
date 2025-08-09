import React from 'react'
import { Modal, Typography, Divider, Row, Col, Tag } from 'antd'

const { Title, Text } = Typography

interface ShortcutsModalProps {
  visible: boolean
  onClose: () => void
}

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ visible, onClose }) => {

  const shortcutCategories = [
    {
      title: '📁 File Operations',
      shortcuts: [
        { key: 'Ctrl+O', description: 'Open/Import file' },
        { key: 'Ctrl+S', description: 'Save as Markdown' },
        { key: 'Ctrl+Shift+S', description: 'Export menu' },
        { key: 'Ctrl+N', description: 'New table' }
      ]
    },
    {
      title: '✏️ Editing',
      shortcuts: [
        { key: 'Ctrl+Z', description: 'Undo last action' },
        { key: 'Ctrl+Shift+Z', description: 'Redo last action' },
        { key: 'Ctrl+Y', description: 'Redo (alternative)' },
        { key: 'Delete', description: 'Clear selected cells' },
        { key: 'Backspace', description: 'Clear cell and start editing' }
      ]
    },
    {
      title: '🧭 Navigation',
      shortcuts: [
        { key: 'Tab', description: 'Move to next cell' },
        { key: 'Shift+Tab', description: 'Move to previous cell' },
        { key: 'Enter', description: 'Move to cell below' },
        { key: 'Shift+Enter', description: 'Move to cell above' },
        { key: '↑↓←→', description: 'Navigate with arrow keys' },
        { key: 'Home', description: 'Go to first cell in row' },
        { key: 'End', description: 'Go to last cell in row' }
      ]
    },
    {
      title: '📋 Selection & Copy/Paste',
      shortcuts: [
        { key: 'Ctrl+A', description: 'Select all cells' },
        { key: 'Ctrl+Click', description: 'Multi-select cells' },
        { key: 'Shift+Click', description: 'Range select cells' },
        { key: 'Ctrl+C', description: 'Copy selected cells' },
        { key: 'Ctrl+V', description: 'Paste clipboard content' },
        { key: 'Ctrl+X', description: 'Cut selected cells' }
      ]
    },
    {
      title: '🏗️ Table Structure',
      shortcuts: [
        { key: 'Ctrl+Shift+R', description: 'Add row above' },
        { key: 'Ctrl+R', description: 'Add row below' },
        { key: 'Ctrl+Shift+C', description: 'Add column left' },
        { key: 'Ctrl+Alt+C', description: 'Add column right' },
        { key: 'Ctrl+Shift+D', description: 'Delete selected row' },
        { key: 'Ctrl+Alt+D', description: 'Delete selected column' }
      ]
    },
    {
      title: '🎨 Formatting',
      shortcuts: [
        { key: 'Ctrl+B', description: 'Toggle bold' },
        { key: 'Ctrl+I', description: 'Toggle italic' },
        { key: 'Ctrl+U', description: 'Toggle underline' },
        { key: 'Ctrl+Shift+L', description: 'Align left' },
        { key: 'Ctrl+Shift+E', description: 'Align center' },
        { key: 'Ctrl+Shift+R', description: 'Align right' }
      ]
    },
    {
      title: '🔧 Interface',
      shortcuts: [
        { key: 'F11', description: 'Toggle sidebar' },
        { key: 'Ctrl+,', description: 'Open settings' },
        { key: 'F1', description: 'Show help' },
        { key: 'Ctrl+/', description: 'Show shortcuts' },
        { key: 'Escape', description: 'Close modals/cancel editing' }
      ]
    },
    {
      title: '👁️ View',
      shortcuts: [
        { key: 'Ctrl+1', description: 'Table view' },
        { key: 'Ctrl+2', description: 'Markdown view' },
        { key: 'Ctrl+3', description: 'Preview view' },
        { key: 'Ctrl+4', description: 'Split view' },
        { key: 'Ctrl++', description: 'Zoom in' },
        { key: 'Ctrl+-', description: 'Zoom out' },
        { key: 'Ctrl+0', description: 'Reset zoom' }
      ]
    }
  ]

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>⌨️ Keyboard Shortcuts</Title>
          <Text type="secondary">Master these shortcuts to boost your productivity</Text>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      <div style={{ padding: '16px 0' }}>
        {shortcutCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} style={{ marginBottom: 32 }}>
            <Title level={4} style={{ marginBottom: 16, color: '#1890ff' }}>
              {category.title}
            </Title>
            <Row gutter={[16, 12]}>
              {category.shortcuts.map((shortcut, index) => (
                <Col span={12} key={index}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: '#fafafa',
                    borderRadius: 6,
                    border: '1px solid #f0f0f0'
                  }}>
                    <Text style={{ flex: 1 }}>{shortcut.description}</Text>
                    <Tag 
                      style={{ 
                        fontFamily: 'monospace', 
                        fontSize: 12,
                        marginLeft: 8,
                        backgroundColor: '#fff',
                        border: '1px solid #d9d9d9',
                        color: '#666'
                      }}
                    >
                      {shortcut.key}
                    </Tag>
                  </div>
                </Col>
              ))}
            </Row>
            {categoryIndex < shortcutCategories.length - 1 && <Divider />}
          </div>
        ))}
        
        <div style={{ 
          marginTop: 24, 
          padding: 16, 
          backgroundColor: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: 6 
        }}>
          <Text strong style={{ color: '#389e0d' }}>💡 Pro Tips:</Text>
          <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
            <li><Text>Hold <Tag>Shift</Tag> while using arrow keys to select ranges</Text></li>
            <li><Text>Use <Tag>Ctrl+Click</Tag> to select multiple non-adjacent cells</Text></li>
            <li><Text>Double-click any cell to start editing quickly</Text></li>
            <li><Text>Drag column borders to resize columns visually</Text></li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default ShortcutsModal