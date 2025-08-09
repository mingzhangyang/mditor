import React, { useState } from 'react'
import {
  Card,
  ColorPicker,
  Select,
  Space,
  Typography,
  Button,
  Row,
  Col,
  InputNumber,
  Tooltip,
} from 'antd'
import {
  BgColorsOutlined,
  FontColorsOutlined,
  BorderOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useI18n } from '@/i18n'
import { useTableStore } from '@/store'
import type { CellStyle } from '@/types'
import type { Color } from 'antd/es/color-picker'

const { Text } = Typography
const { Option } = Select

const StylePanel: React.FC = () => {
  const { t } = useI18n()
  const {
    cellStyles,
    selectedCells,
    updateCellStyle,
    clearCellStyles,
  } = useTableStore()

  const [previewStyle, setPreviewStyle] = useState<CellStyle>({
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-color)',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    borderColor: 'var(--border-color)',
    borderWidth: 1,
    borderStyle: 'solid',
    padding: 8,
  })

  // 获取当前选中单元格的样式
  const getCurrentStyle = () => {
    if (selectedCells.length === 0) return previewStyle
    
    const firstCell = selectedCells[0]
    const cellKey = `${firstCell.row}-${firstCell.col}`
    return cellStyles.get(cellKey) || previewStyle
  }

  const currentStyle = getCurrentStyle()

  // 应用样式到选中的单元格
  const applyStyle = (styleUpdate: Partial<CellStyle>) => {
    if (selectedCells.length === 0) {
      setPreviewStyle(prev => ({ ...prev, ...styleUpdate }))
      return
    }

    selectedCells.forEach(cell => {
      updateCellStyle(cell.row, cell.col, styleUpdate)
    })
  }

  // 重置样式
  const resetStyles = () => {
    if (selectedCells.length === 0) {
      setPreviewStyle({
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        fontSize: 14,
        fontWeight: 'normal' as const,
        fontStyle: 'normal' as const,
        textDecoration: 'none' as const,
        textAlign: 'left' as const,
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        borderStyle: 'solid' as const,
        padding: 8,
      })
    } else {
      selectedCells.forEach(cell => {
        updateCellStyle(cell.row, cell.col, {})
      })
    }
  }

  // 预设颜色
  const presetColors = [
    '#ffffff', '#f5f5f5', '#d9d9d9', '#bfbfbf', '#8c8c8c', '#595959', '#262626', '#000000',
    '#fff2e8', '#ffbb96', '#ff7a45', '#fa541c', '#d4380d', '#ad2102', '#871400', '#612500',
    '#f6ffed', '#b7eb8f', '#73d13d', '#52c41a', '#389e0d', '#237804', '#135200', '#092b00',
    '#e6f7ff', '#91d5ff', '#40a9ff', '#1890ff', '#096dd9', '#0050b3', '#003a8c', '#002766',
    '#f9f0ff', '#d3adf7', '#b37feb', '#722ed1', '#531dab', '#391085', '#22075e', '#120338',
    '#fff0f6', '#ffadd2', '#ff85c0', '#f759ab', '#eb2f96', '#c41d7f', '#9e1068', '#780650',
  ]

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      {/* 选择状态提示 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text type="secondary">
            {selectedCells.length === 0 
              ? '请选择单元格以应用样式' 
              : `已选择 ${selectedCells.length} 个单元格`
            }
          </Text>
          {selectedCells.length > 0 && (
            <Button 
              size="small" 
              icon={<ReloadOutlined />} 
              onClick={resetStyles}
              block
            >
              {t('style.resetStyle')}
            </Button>
          )}
        </Space>
      </Card>

      {/* 背景颜色 */}
      <Card size="small" title={<><BgColorsOutlined /> {t('style.backgroundColor')}</>} style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <ColorPicker
            value={currentStyle.backgroundColor}
            onChange={(color: Color) => {
              applyStyle({ backgroundColor: color.toHexString() })
            }}
            presets={[
              {
                label: t('style.presetColors'),
                colors: presetColors,
              },
            ]}
            showText
            style={{ width: '100%' }}
          />
          
          {/* 快速颜色选择 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}>
            {presetColors.slice(0, 16).map(color => (
              <div
                key={color}
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: color,
                  border: '1px solid var(--border-color)',
                  borderRadius: 4,
                  cursor: 'pointer',
                  boxShadow: currentStyle.backgroundColor === color ? '0 0 0 2px var(--primary-color)' : 'none',
                }}
                onClick={() => applyStyle({ backgroundColor: color })}
              />
            ))}
          </div>
        </Space>
      </Card>

      {/* 文字颜色 */}
      <Card size="small" title={<><FontColorsOutlined /> {t('style.textColor')}</>} style={{ marginBottom: 16 }}>
        <ColorPicker
          value={currentStyle.color}
          onChange={(color: Color) => {
            applyStyle({ color: color.toHexString() })
          }}
          presets={[
            {
              label: t('style.presetColors'),
              colors: presetColors,
            },
          ]}
          showText
          style={{ width: '100%' }}
        />
      </Card>

      {/* 字体样式 */}
      <Card size="small" title={t('style.fontStyle')} style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Row gutter={8}>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('style.fontSize')}</Text>
              <InputNumber
                value={currentStyle.fontSize}
                onChange={(value) => applyStyle({ fontSize: value || 14 })}
                min={8}
                max={72}
                size="small"
                style={{ width: '100%' }}
                addonAfter="px"
              />
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('style.padding')}</Text>
              <InputNumber
                value={currentStyle.padding}
                onChange={(value) => applyStyle({ padding: value || 8 })}
                min={0}
                max={50}
                size="small"
                style={{ width: '100%' }}
                addonAfter="px"
              />
            </Col>
          </Row>
          
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{t('style.textStyle')}</Text>
            <Space>
              <Tooltip title={t('style.bold')}>
                <Button
                  size="small"
                  icon={<BoldOutlined />}
                  type={currentStyle.fontWeight === 'bold' ? 'primary' : 'default'}
                  onClick={() => {
                    const newWeight = currentStyle.fontWeight === 'bold' ? 'normal' : 'bold'
                    applyStyle({ fontWeight: newWeight })
                  }}
                />
              </Tooltip>
              
              <Tooltip title={t('style.italic')}>
                <Button
                  size="small"
                  icon={<ItalicOutlined />}
                  type={currentStyle.fontStyle === 'italic' ? 'primary' : 'default'}
                  onClick={() => {
                    const newStyle = currentStyle.fontStyle === 'italic' ? 'normal' : 'italic'
                    applyStyle({ fontStyle: newStyle })
                  }}
                />
              </Tooltip>
              
              <Tooltip title={t('style.underline')}>
                <Button
                  size="small"
                  icon={<UnderlineOutlined />}
                  type={currentStyle.textDecoration === 'underline' ? 'primary' : 'default'}
                  onClick={() => {
                    const newDecoration = currentStyle.textDecoration === 'underline' ? 'none' : 'underline'
                    applyStyle({ textDecoration: newDecoration })
                  }}
                />
              </Tooltip>
            </Space>
          </div>
        </Space>
      </Card>

      {/* 对齐方式 */}
      <Card size="small" title={t('style.alignment')} style={{ marginBottom: 16 }}>
        <Space>
          <Tooltip title={t('style.leftAlign')}>
            <Button
              size="small"
              icon={<AlignLeftOutlined />}
              type={currentStyle.textAlign === 'left' ? 'primary' : 'default'}
              onClick={() => {
                applyStyle({ textAlign: 'left' })
              }}
            />
          </Tooltip>
          
          <Tooltip title={t('style.centerAlign')}>
            <Button
              size="small"
              icon={<AlignCenterOutlined />}
              type={currentStyle.textAlign === 'center' ? 'primary' : 'default'}
              onClick={() => {
                applyStyle({ textAlign: 'center' })
              }}
            />
          </Tooltip>
          
          <Tooltip title={t('style.rightAlign')}>
            <Button
              size="small"
              icon={<AlignRightOutlined />}
              type={currentStyle.textAlign === 'right' ? 'primary' : 'default'}
              onClick={() => {
                applyStyle({ textAlign: 'right' })
              }}
            />
          </Tooltip>
        </Space>
      </Card>

      {/* 边框样式 */}
      <Card size="small" title={<><BorderOutlined /> {t('style.borderStyle')}</>} style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Row gutter={8}>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('style.borderColor')}</Text>
              <ColorPicker
                value={currentStyle.borderColor}
                onChange={(color: Color) => {
                  applyStyle({ borderColor: color.toHexString() })
                }}
                size="small"
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('style.borderWidth')}</Text>
              <InputNumber
                value={currentStyle.borderWidth}
                onChange={(value) => applyStyle({ borderWidth: value || 1 })}
                min={0}
                max={10}
                size="small"
                style={{ width: '100%' }}
                addonAfter="px"
              />
            </Col>
          </Row>
          
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{t('style.borderType')}</Text>
            <Select
              value={currentStyle.borderStyle}
              onChange={(value: 'solid' | 'dashed' | 'dotted' | 'double' | 'none') => {
                applyStyle({ borderStyle: value })
              }}
              size="small"
              style={{ width: '100%' }}
            >
              <Option value="solid">{t('style.solid')}</Option>
              <Option value="dashed">{t('style.dashed')}</Option>
              <Option value="dotted">{t('style.dotted')}</Option>
              <Option value="double">{t('style.double')}</Option>
              <Option value="none">{t('style.none')}</Option>
            </Select>
          </div>
        </Space>
      </Card>

      {/* 样式预览 */}
      <Card size="small" title={t('style.stylePreview')} style={{ marginBottom: 16 }}>
        <div
          style={{
            ...currentStyle,
            border: `${currentStyle.borderWidth}px ${currentStyle.borderStyle} ${currentStyle.borderColor}`,
            padding: `${currentStyle.padding}px`,
            minHeight: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: currentStyle.textAlign,
            borderRadius: 4,
          }}
        >
          示例文本
        </div>
      </Card>

      {/* 批量操作 */}
      <Card size="small" title="批量操作">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Button 
            size="small" 
            onClick={() => clearCellStyles()}
            block
            danger
          >
            清除所有样式
          </Button>
          
          <Button 
            size="small" 
            onClick={() => {
              // 应用默认表格样式
              const defaultStyle = {
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                fontSize: 14,
                borderColor: 'var(--border-color)',
                borderWidth: 1,
                borderStyle: 'solid' as const,
                padding: 8,
              }
              selectedCells.forEach(cell => {
                updateCellStyle(cell.row, cell.col, defaultStyle)
              })
            }}
            block
          >
            应用默认样式
          </Button>
        </Space>
      </Card>
    </div>
  )
}

export default StylePanel