import type { CellPosition, CellStyle, TableData, TableState } from '@/types'

export const cloneTableData = (tableData: TableData): TableData => ({
  headers: [...tableData.headers],
  rows: tableData.rows.map((row) => [...row]),
  alignments: [...tableData.alignments],
  ...(tableData.columnWidths ? { columnWidths: [...tableData.columnWidths] } : {}),
})

export const cloneCellStyles = (cellStyles: Map<string, CellStyle>): Map<string, CellStyle> =>
  new Map(Array.from(cellStyles.entries(), ([cellId, style]) => [cellId, { ...style }]))

export const cloneCellPositions = (positions: CellPosition[]): CellPosition[] =>
  positions.map(({ row, col }) => ({ row, col }))

export const cloneTableState = (tableState: TableState): TableState => ({
  data: cloneTableData(tableState.data),
  styles: cloneCellStyles(tableState.styles),
  selectedCells: cloneCellPositions(tableState.selectedCells),
  selectedRows: [...tableState.selectedRows],
  selectedColumns: [...tableState.selectedColumns],
  timestamp: tableState.timestamp,
})

const isSameStringArray = (left: string[], right: string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const isSameNumberArray = (left: number[], right: number[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const isSameCellPositions = (left: CellPosition[], right: CellPosition[]): boolean =>
  left.length === right.length &&
  left.every((position, index) => position.row === right[index]?.row && position.col === right[index]?.col)

export const isSameTableData = (left: TableData, right: TableData): boolean => {
  if (!isSameStringArray(left.headers, right.headers)) {
    return false
  }

  if (!isSameStringArray(left.alignments, right.alignments)) {
    return false
  }

  if (left.rows.length !== right.rows.length) {
    return false
  }

  if (!left.rows.every((row, index) => isSameStringArray(row, right.rows[index] ?? []))) {
    return false
  }

  const leftWidths = left.columnWidths ?? []
  const rightWidths = right.columnWidths ?? []
  return isSameNumberArray(leftWidths, rightWidths)
}

export const isSameCellStyles = (left: Map<string, CellStyle>, right: Map<string, CellStyle>): boolean => {
  if (left.size !== right.size) {
    return false
  }

  for (const [cellId, style] of left.entries()) {
    const otherStyle = right.get(cellId)
    if (!otherStyle) {
      return false
    }

    const styleKeys = Object.keys(style) as Array<keyof CellStyle>
    const otherStyleKeys = Object.keys(otherStyle) as Array<keyof CellStyle>
    if (styleKeys.length !== otherStyleKeys.length) {
      return false
    }

    if (!styleKeys.every((key) => style[key] === otherStyle[key])) {
      return false
    }
  }

  return true
}

export const isSameTableState = (left: TableState, right: TableState): boolean =>
  isSameTableData(left.data, right.data) &&
  isSameCellStyles(left.styles, right.styles) &&
  isSameCellPositions(left.selectedCells, right.selectedCells) &&
  isSameNumberArray(left.selectedRows, right.selectedRows) &&
  isSameNumberArray(left.selectedColumns, right.selectedColumns)
