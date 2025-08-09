import { create } from 'zustand'
import { zhCN } from './locales/zh-CN'
import { enUS } from './locales/en-US'

export type Language = 'zh-CN' | 'en-US'

export interface TranslationKeys {
  // 通用
  common: {
    save: string
    cancel: string
    confirm: string
    delete: string
    edit: string
    add: string
    remove: string
    clear: string
    reset: string
    import: string
    export: string
    loading: string
    success: string
    error: string
    warning: string
    info: string
    unknown: string
  }
  
  // 头部
  header: {
    title: string
    new: string
    open: string
    save: string
    export: string
    undo: string
    redo: string
    settings: string
    help: string
    shortcuts: string
    guide: string
    about: string
    toggleSidebar: string
    importFile: string
    exportFile: string
    undoAction: string
    redoAction: string
    saveMarkdown: string
    settingsTooltip: string
    helpTooltip: string
    shortcutsNotImplemented: string
    guideNotImplemented: string
    aboutNotImplemented: string
  }
  
  // 侧边栏
  sidebar: {
    files: string
    history: string
    settings: string
    style: string
    tableInfo: string
    rows: string
    columns: string
    cells: string
    lastModified: string
  }

  // 样式面板
  style: {
    backgroundColor: string
    textColor: string
    fontColor: string
    fontStyle: string
    fontSize: string
    padding: string
    textStyle: string
    bold: string
    italic: string
    underline: string
    alignment: string
    leftAlign: string
    centerAlign: string
    rightAlign: string
    borderStyle: string
    borderColor: string
    borderWidth: string
    borderType: string
    solid: string
    dashed: string
    dotted: string
    double: string
    none: string
    stylePreview: string
    resetStyle: string
    presetColors: string
    sampleText: string
  }
  
  // 设置面板
  settings: {
    appearance: string
    darkMode: string
    language: string
    fontSize: string
    editor: string
    autoSave: string
    autoSaveInterval: string
    showLineNumbers: string
    syntaxHighlight: string
    wordWrap: string
    table: string
    defaultAlignment: string
    showGridLines: string
    alternateRowColors: string
    resizableColumns: string
    maxHistorySize: string
    importExport: string
    defaultExportFormat: string
    exportWithStyles: string
    compressExports: string
    performance: string
    enableVirtualScrolling: string
    lazyRendering: string
    renderDelay: string
    management: string
    saveSettings: string
    loadSettings: string
    exportSettings: string
    importSettings: string
    resetToDefault: string
    settingsSaved: string
    settingsLoaded: string
    settingsReset: string
    settingsExported: string
    settingsImported: string
    noSavedSettings: string
    saveSettingsFailed: string
    loadSettingsFailed: string
    exportSettingsFailed: string
    importSettingsFailed: string
    checkFileFormat: string
  }
  
  // 表格
  table: {
    addRow: string
    addColumn: string
    deleteRow: string
    deleteColumn: string
    alignLeft: string
    alignCenter: string
    alignRight: string
    copy: string
    paste: string
    cut: string
    clear: string
    merge: string
    split: string
    parseError: string
    unknownError: string
    edit: string
    preview: string
    line: string
    applyChanges: string
    reset: string
    copyContent: string
    downloadMarkdown: string
    placeholder: string
  }
  
  // 视图
  view: {
    table: string
    markdown: string
    preview: string
    split: string
    tableEditor: string
    markdownEditor: string
    previewPane: string
  }
  
  // 导出格式
  export: {
    markdown: string
    csv: string
    excel: string
    html: string
    json: string
    png: string
    svg: string
    exportSuccess: string
    exportError: string
    unsupportedFormat: string
  }
  
  // 历史记录
  history: {
    undo: string
    redo: string
    undoSuccess: string
    redoSuccess: string
    noUndoOperations: string
    noRedoOperations: string
    clearHistory: string
    historyManaged: string
  }
  
  // 编辑器状态
  editor: {
    unsavedChanges: string
    characterCount: string
    lineCount: string
    validTable: string
  }

  // 文件管理
  files: {
    newFile: string
    fileName: string
    fileDescription: string
    createFile: string
    deleteFile: string
    renameFile: string
    duplicateFile: string
    fileCreated: string
    fileDeleted: string
    fileRenamed: string
    fileDuplicated: string
    search: string
    noFiles: string
    preview: string
    save: string
    searchPlaceholder: string
    importFile: string
    uploadHint: string
    supportedFormats: string
    fileList: string
    current: string
    copy: string
    export: string
    deleteConfirm: string
    ok: string
    cancel: string
    close: string
    openFile: string
    fileSize: string
    createTime: string
    modifyTime: string
    tableSize: string
    markdownPreview: string
    rows: string
    columns: string
    enterFileName: string
    pleaseEnterFileName: string
    fileCreatedSuccess: string
    fileOpenedSuccess: string
    noOpenFile: string
    fileNotExist: string
    fileSavedSuccess: string
    fileDeletedSuccess: string
    fileCopiedSuccess: string
    exportSuccess: string
    exportFailed: string
    importSuccess: string
    importFailed: string
    importError: string
    noMatchingFiles: string
    clickOrDragToUpload: string
  }
}

const translations: Record<Language, TranslationKeys> = {
  'zh-CN': zhCN,
  'en-US': enUS
}

interface I18nState {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

export const useI18n = create<I18nState>((set, get) => ({
  language: 'en-US',
  setLanguage: (language: Language) => {
    set({ language })
    // 保存到本地存储
    localStorage.setItem('app-language', language)
  },
  t: (key: string) => {
    const { language } = get()
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }
}))

// 初始化语言设置
const savedLanguage = localStorage.getItem('app-language') as Language
if (savedLanguage && translations[savedLanguage]) {
  useI18n.getState().setLanguage(savedLanguage)
} else {
  // 如果没有保存的语言设置，使用默认的英文并保存到本地存储
  useI18n.getState().setLanguage('en-US')
}

// 导出便捷的翻译函数
export const t = (key: string) => useI18n.getState().t(key)

// 导出语言列表
export const languages = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' }
] as const