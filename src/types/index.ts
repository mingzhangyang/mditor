// 表格数据类型定义
export interface TableData {
  headers: string[];
  rows: string[][];
  alignments: ('left' | 'center' | 'right')[];
  columnWidths?: number[]; // 列宽数组，单位为像素
}

// 单元格样式类型定义
export interface CellStyle {
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | string | number;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  padding?: number;
  fontFamily?: string;
}

// 表格状态类型定义
export interface TableState {
  data: TableData;
  styles: Map<string, CellStyle>;
  selectedCells: CellPosition[];
  selectedRows: number[];
  selectedColumns: number[];
  timestamp?: number;
}

// 导出选项类型定义
export interface ExportOptions {
  format: 'markdown' | 'html' | 'csv' | 'excel' | 'png' | 'svg';
  includeStyles: boolean;
  filename?: string;
  imageOptions?: {
    width: number;
    height: number;
    quality?: number;
  };
}

// 导入结果类型定义
export interface ImportResult {
  success: boolean;
  data?: TableData;
  error?: string;
}

// 编辑器模式类型定义
export type EditorMode = 'markdown' | 'visual' | 'split' | 'preview';

// 工具栏操作类型定义
export type ToolbarAction = 
  | 'new'
  | 'open'
  | 'save'
  | 'export'
  | 'undo'
  | 'redo'
  | 'copy'
  | 'paste'
  | 'cut'
  | 'insertRow'
  | 'insertColumn'
  | 'deleteRow'
  | 'deleteColumn'
  | 'mergeCells'
  | 'splitCells'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight';

// 右键菜单项类型定义
export interface ContextMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  divider?: boolean;
}

// 表格操作历史类型定义
export interface TableHistory {
  past: TableState[];
  present: TableState;
  future: TableState[];
}

// 主题类型定义
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
}

// 应用设置类型定义
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  editorMode: EditorMode;
  autoSave: boolean;
  autoSaveInterval: number;
  showLineNumbers: boolean;
  wordWrap: boolean;
  fontSize: number;
  codeHighlight: boolean;
  enableSyntaxHighlight: boolean;
  language: string;
  defaultAlignment: 'left' | 'center' | 'right';
  showGridLines: boolean;
  alternateRowColors: boolean;
  resizableColumns: boolean;
  maxHistorySize: number;
  defaultExportFormat: 'markdown' | 'csv' | 'excel' | 'json' | 'html';
  exportWithStyles: boolean;
  compressExports: boolean;
  enableVirtualScrolling: boolean;
  lazyRendering: boolean;
  renderDelay: number;
}

// 文件信息类型定义
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: number;
  modifiedAt: number;
  data: TableData;
  description?: string;
}

// API 响应类型定义
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 拖拽相关类型定义
export interface DragItem {
  type: 'row' | 'column';
  index: number;
}

export interface DropResult {
  dragIndex: number;
  hoverIndex: number;
  type: 'row' | 'column';
}

// 选择区域类型定义
export interface SelectionRange {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

// 单元格位置类型定义
export interface CellPosition {
  row: number;
  col: number;
}

// 表格配置类型定义
export interface TableConfig {
  showHeader: boolean;
  showBorder: boolean;
  striped: boolean;
  hover: boolean;
  compact: boolean;
  responsive: boolean;
}