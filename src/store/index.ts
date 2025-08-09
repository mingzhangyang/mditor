import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TableData, TableState, CellStyle, EditorMode, AppSettings, TableHistory, CellPosition, FileInfo } from '../types/index';
import { MarkdownTableParser } from '../utils/markdown';

interface AppState {
  // 表格数据
  tableData: TableData;
  
  // 单元格样式
  cellStyles: Map<string, CellStyle>;
  
  // 选择状态
  selectedCells: CellPosition[];
  selectedRows: number[];
  selectedColumns: number[];
  
  // 编辑器状态
  editorMode: EditorMode;
  markdownContent: string;
  
  // 历史记录
  history: TableHistory;
  
  // 应用设置
  settings: AppSettings;
  
  // 文件管理
  files: FileInfo[];
  currentFile: string | null;
  
  // UI 状态
  isLoading: boolean;
  error: string | null;
  sidebarVisible: boolean;
  sidebarActiveTab: string;
  settingsModalVisible: boolean;
  
  // Actions
  setTableData: (data: TableData) => void;
  updateCell: (row: number, col: number, value: string) => void;
  addRow: (index?: number) => void;
  removeRow: (index: number) => void;
  addColumn: (index?: number) => void;
  removeColumn: (index: number) => void;
  updateColumnWidth: (columnIndex: number, width: number) => void;
  
  setCellStyle: (cellId: string, style: Partial<CellStyle>) => void;
  getCellStyle: (cellId: string) => CellStyle;
  updateCellStyle: (row: number, col: number, style: Partial<CellStyle>) => void;
  clearCellStyles: () => void;
  
  setSelectedCells: (cells: CellPosition[]) => void;
  setSelectedRows: (rows: number[]) => void;
  setSelectedColumns: (columns: number[]) => void;
  clearSelection: () => void;
  
  setEditorMode: (mode: EditorMode) => void;
  setMarkdownContent: (content: string) => void;
  syncFromMarkdown: () => void;
  syncToMarkdown: () => void;
  
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  
  // 文件管理操作
  addFile: (file: FileInfo) => void;
  removeFile: (fileId: string) => void;
  updateFile: (file: FileInfo) => void;
  setCurrentFile: (fileId: string | null) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSidebarVisible: (visible: boolean) => void;
  setSidebarActiveTab: (tab: string) => void;
  setSettingsModalVisible: (visible: boolean) => void;
  
  reset: () => void;
}

// 默认表格数据
const defaultTableData: TableData = {
  headers: ['Column 1', 'Column 2', 'Column 3'],
  rows: [
    ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
    ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
    ['Row 3 Col 1', 'Row 3 Col 2', 'Row 3 Col 3']
  ],
  alignments: ['left', 'left', 'left'],
  columnWidths: [150, 150, 150] // 默认列宽
};

// 默认应用设置
const defaultSettings: AppSettings = {
  theme: 'light',
  editorMode: 'split',
  autoSave: true,
  autoSaveInterval: 30,
  showLineNumbers: true,
  wordWrap: true,
  fontSize: 14,
  codeHighlight: true,
  enableSyntaxHighlight: true,
  language: 'zh-CN',
  defaultAlignment: 'left',
  showGridLines: true,
  alternateRowColors: false,
  resizableColumns: true,
  maxHistorySize: 50,
  defaultExportFormat: 'markdown',
  exportWithStyles: true,
  compressExports: false,
  enableVirtualScrolling: false,
  lazyRendering: false,
  renderDelay: 100
};

// 默认单元格样式
const defaultCellStyle: CellStyle = {
  backgroundColor: 'var(--bg-color)',
  color: 'var(--text-color)',
  fontSize: 14,
  fontWeight: 'normal',
  textAlign: 'left',
  verticalAlign: 'middle',
  borderColor: 'var(--border-color)',
  borderWidth: 1,
  borderStyle: 'solid',
  padding: 8,
  fontFamily: 'Arial, sans-serif'
};

// 创建初始历史状态
const createInitialHistory = (tableData: TableData): TableHistory => {
  const initialState: TableState = {
    data: tableData,
    styles: new Map(),
    selectedCells: [],
    selectedRows: [],
    selectedColumns: [],
    timestamp: Date.now()
  };
  
  return {
    past: [],
    present: initialState,
    future: []
  };
};

// 生成单元格 ID
const getCellId = (row: number, col: number): string => `${row}-${col}`;

export const useAppStore = create<AppState>()(devtools((set, get) => ({
  // 初始状态
  tableData: defaultTableData,
  cellStyles: new Map(),
  selectedCells: [],
  selectedRows: [],
  selectedColumns: [],
  editorMode: 'split',
  markdownContent: MarkdownTableParser.serialize(defaultTableData),
  history: createInitialHistory(defaultTableData),
  settings: defaultSettings,
  files: [],
  currentFile: null,
  isLoading: false,
  error: null,
  sidebarVisible: true,
  sidebarActiveTab: 'style',
  settingsModalVisible: false,
  
  // 表格数据操作
  setTableData: (data: TableData) => {
    set((state) => {
      const newState = {
        ...state,
        tableData: data,
        markdownContent: MarkdownTableParser.serialize(data)
      };
      
      // 保存到历史记录
      const currentState: TableState = {
        data,
        styles: state.cellStyles,
        selectedCells: state.selectedCells,
        selectedRows: state.selectedRows,
        selectedColumns: state.selectedColumns,
        timestamp: Date.now()
      };
      
      newState.history = {
        past: [...state.history.past, state.history.present],
        present: currentState,
        future: []
      };
      
      return newState;
    });
  },
  
  updateCell: (row: number, col: number, value: string) => {
    set((state) => {
      const newTableData = MarkdownTableParser.updateCell(state.tableData, row, col, value);
      return {
        ...state,
        tableData: newTableData,
        markdownContent: MarkdownTableParser.serialize(newTableData)
      };
    });
  },
  
  addRow: (index?: number) => {
    set((state) => {
      const newTableData = MarkdownTableParser.addRow(state.tableData, index);
      return {
        ...state,
        tableData: newTableData,
        markdownContent: MarkdownTableParser.serialize(newTableData)
      };
    });
  },
  
  removeRow: (index: number) => {
    set((state) => {
      const newTableData = MarkdownTableParser.removeRow(state.tableData, index);
      return {
        ...state,
        tableData: newTableData,
        markdownContent: MarkdownTableParser.serialize(newTableData)
      };
    });
  },
  
  addColumn: (index?: number) => {
    set((state) => {
      const newTableData = MarkdownTableParser.addColumn(state.tableData, index);
      // 确保添加列时也添加对应的列宽
      if (!newTableData.columnWidths) {
        newTableData.columnWidths = new Array(newTableData.headers.length).fill(150);
      } else {
        const insertIndex = index ?? newTableData.headers.length - 1;
        newTableData.columnWidths = [...newTableData.columnWidths];
        newTableData.columnWidths.splice(insertIndex, 0, 150); // 新列默认宽度150px
      }
      return {
        ...state,
        tableData: newTableData,
        markdownContent: MarkdownTableParser.serialize(newTableData)
      };
    });
  },
  
  removeColumn: (index: number) => {
    set((state) => {
      const newTableData = MarkdownTableParser.removeColumn(state.tableData, index);
      return {
        ...state,
        tableData: newTableData,
        markdownContent: MarkdownTableParser.serialize(newTableData)
      };
    });
  },

  updateColumnWidth: (columnIndex: number, width: number) => {
    set((state) => {
      const newTableData = { ...state.tableData };
      if (!newTableData.columnWidths) {
        newTableData.columnWidths = new Array(newTableData.headers.length).fill(150);
      }
      newTableData.columnWidths = [...newTableData.columnWidths];
      newTableData.columnWidths[columnIndex] = Math.max(50, width); // 最小宽度50px
      return {
        ...state,
        tableData: newTableData
      };
    });
  },
  
  // 样式操作
  setCellStyle: (cellId: string, style: Partial<CellStyle>) => {
    set((state) => {
      const newStyles = new Map(state.cellStyles);
      const currentStyle = newStyles.get(cellId) || { ...defaultCellStyle };
      newStyles.set(cellId, { ...currentStyle, ...style });
      
      return {
        ...state,
        cellStyles: newStyles
      };
    });
  },
  
  getCellStyle: (cellId: string): CellStyle => {
    const { cellStyles } = get();
    return cellStyles.get(cellId) || { ...defaultCellStyle };
  },

  updateCellStyle: (row: number, col: number, style: Partial<CellStyle>) => {
    const cellId = getCellId(row, col);
    const { cellStyles } = get();
    const currentStyle = cellStyles.get(cellId) || { ...defaultCellStyle };
    const newStyle = { ...currentStyle, ...style };
    const newStyles = new Map(cellStyles);
    newStyles.set(cellId, newStyle);
    set({ cellStyles: newStyles });
  },

  clearCellStyles: () => {
    set({ cellStyles: new Map() });
  },
  
  // 选择操作
  setSelectedCells: (cells: CellPosition[]) => {
    set((state) => ({
      ...state,
      selectedCells: cells
    }));
  },
  
  setSelectedRows: (rows: number[]) => {
    set((state) => ({
      ...state,
      selectedRows: rows
    }));
  },
  
  setSelectedColumns: (columns: number[]) => {
    set((state) => ({
      ...state,
      selectedColumns: columns
    }));
  },
  
  clearSelection: () => {
    set((state) => ({
      ...state,
      selectedCells: [],
      selectedRows: [],
      selectedColumns: []
    }));
  },
  
  // 编辑器操作
  setEditorMode: (mode: EditorMode) => {
    set((state) => ({
      ...state,
      editorMode: mode
    }));
  },
  
  setMarkdownContent: (content: string) => {
    set((state) => ({
      ...state,
      markdownContent: content
    }));
  },
  
  syncFromMarkdown: () => {
    set((state) => {
      try {
        const tableData = MarkdownTableParser.parse(state.markdownContent);
        return {
          ...state,
          tableData,
          error: null
        };
      } catch (error) {
        return {
          ...state,
          error: error instanceof Error ? error.message : 'Failed to parse markdown'
        };
      }
    });
  },
  
  syncToMarkdown: () => {
    set((state) => ({
      ...state,
      markdownContent: MarkdownTableParser.serialize(state.tableData)
    }));
  },
  
  // 历史记录操作
  undo: () => {
    set((state) => {
      const { past, present, future } = state.history;
      
      if (past.length === 0) return state;
      
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      
      return {
        ...state,
        tableData: previous.data,
        cellStyles: previous.styles,
        selectedCells: previous.selectedCells,
        selectedRows: previous.selectedRows,
        selectedColumns: previous.selectedColumns,
        markdownContent: MarkdownTableParser.serialize(previous.data),
        history: {
          past: newPast,
          present: previous,
          future: [present, ...future]
        }
      };
    });
  },
  
  redo: () => {
    set((state) => {
      const { past, present, future } = state.history;
      
      if (future.length === 0) return state;
      
      const next = future[0];
      const newFuture = future.slice(1);
      
      return {
        ...state,
        tableData: next.data,
        cellStyles: next.styles,
        selectedCells: next.selectedCells,
        selectedRows: next.selectedRows,
        selectedColumns: next.selectedColumns,
        markdownContent: MarkdownTableParser.serialize(next.data),
        history: {
          past: [...past, present],
          present: next,
          future: newFuture
        }
      };
    });
  },
  
  saveToHistory: () => {
    set((state) => {
      const currentState: TableState = {
        data: state.tableData,
        styles: state.cellStyles,
        selectedCells: state.selectedCells,
        selectedRows: state.selectedRows,
        selectedColumns: state.selectedColumns,
        timestamp: Date.now()
      };
      
      return {
        ...state,
        history: {
          past: [...state.history.past, state.history.present],
          present: currentState,
          future: []
        }
      };
    });
  },
  
  // 文件管理操作
  addFile: (file: FileInfo) => {
    set((state) => ({
      ...state,
      files: [...state.files, file]
    }));
  },

  removeFile: (fileId: string) => {
    set((state) => ({
      ...state,
      files: state.files.filter(f => f.id !== fileId)
    }));
  },

  updateFile: (file: FileInfo) => {
    set((state) => ({
      ...state,
      files: state.files.map(f => f.id === file.id ? file : f)
    }));
  },

  setCurrentFile: (fileId: string | null) => {
    set((state) => ({
      ...state,
      currentFile: fileId
    }));
  },

  // 设置操作
  updateSettings: (newSettings: Partial<AppSettings>) => {
    set((state) => {
      const updatedSettings = {
        ...state.settings,
        ...newSettings
      };
      
      // 如果语言设置发生变化，同步到国际化系统
      if (newSettings.language && typeof window !== 'undefined') {
        // 动态导入国际化hook以避免循环依赖
        import('../i18n').then(({ useI18n }) => {
          const { setLanguage } = useI18n.getState();
          setLanguage(newSettings.language as any);
        }).catch(console.error);
      }
      
      return {
        settings: updatedSettings
      };
    });
  },

  resetSettings: () => {
    set((state) => ({
      ...state,
      settings: defaultSettings
    }));
  },
  
  // UI 状态操作
  setLoading: (loading: boolean) => {
    set((state) => ({
      ...state,
      isLoading: loading
    }));
  },
  
  setError: (error: string | null) => {
    set((state) => ({
      ...state,
      error
    }));
  },

  setSidebarVisible: (visible: boolean) => {
    set((state) => ({
      ...state,
      sidebarVisible: visible
    }))
  },

  setSidebarActiveTab: (tab: string) => {
    set((state) => ({
      ...state,
      sidebarActiveTab: tab
    }))
  },

  setSettingsModalVisible: (visible: boolean) => {
    set((state) => ({
      ...state,
      settingsModalVisible: visible
    }))
  },
  
  // 重置
  reset: () => {
    set(() => ({
      tableData: defaultTableData,
      cellStyles: new Map(),
      selectedCells: [],
      selectedRows: [],
      selectedColumns: [],
      editorMode: 'split',
      markdownContent: MarkdownTableParser.serialize(defaultTableData),
      history: createInitialHistory(defaultTableData),
      settings: defaultSettings,
      files: [],
      currentFile: null,
      isLoading: false,
      error: null,
      sidebarVisible: true,
      settingsModalVisible: false
    }));
  }
}), {
  name: 'markdown-table-editor-store'
}));

// 选择器 hooks
export const useTableData = () => useAppStore((state) => state.tableData);
export const useMarkdownContent = () => useAppStore((state) => state.markdownContent);
export const useEditorMode = () => useAppStore((state) => state.editorMode);
export const useSelectedCells = () => useAppStore((state) => state.selectedCells);
export const useSettings = () => useAppStore((state) => state.settings);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);

// 操作 hooks
export const useTableActions = () => {
  const store = useAppStore();
  return {
    setTableData: store.setTableData,
    updateCell: store.updateCell,
    addRow: store.addRow,
    removeRow: store.removeRow,
    addColumn: store.addColumn,
    removeColumn: store.removeColumn,
    undo: store.undo,
    redo: store.redo,
    saveToHistory: store.saveToHistory
  };
};

export const useStyleActions = () => {
  const store = useAppStore();
  return {
    setCellStyle: store.setCellStyle,
    getCellStyle: store.getCellStyle
  };
};

export const useSelectionActions = () => {
  const store = useAppStore();
  return {
    setSelectedCells: store.setSelectedCells,
    setSelectedRows: store.setSelectedRows,
    setSelectedColumns: store.setSelectedColumns,
    clearSelection: store.clearSelection
  };
};

export const useEditorActions = () => {
  const store = useAppStore();
  return {
    setEditorMode: store.setEditorMode,
    setMarkdownContent: store.setMarkdownContent,
    syncFromMarkdown: store.syncFromMarkdown,
    syncToMarkdown: store.syncToMarkdown
  };
};

// 主要的 store hook，用于组件中导入
export const useTableStore = useAppStore;