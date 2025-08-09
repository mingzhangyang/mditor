# Markdown 表格可视化编辑器

一款功能强大的 Web 应用，专门用于将 Markdown 格式的表格进行可视化展示，并提供丰富的编辑、样式定制和导入导出功能。

## ✨ 核心功能

### 📊 表格编辑
- **可视化编辑**: 直观的表格界面，支持点击编辑单元格
- **键盘导航**: 使用方向键、Tab、Enter 等快捷键快速导航
- **多选操作**: 支持 Ctrl/Cmd + 点击多选，Shift + 点击范围选择
- **右键菜单**: 便捷的上下文菜单，支持复制、粘贴、清空等操作
- **拖拽选择**: 鼠标拖拽选择多个单元格

### 🎨 样式定制
- **单元格样式**: 背景色、文字色、字体大小、内边距
- **文字格式**: 粗体、斜体、下划线
- **对齐方式**: 左对齐、居中、右对齐
- **边框样式**: 边框颜色、宽度、类型
- **批量操作**: 选中多个单元格批量设置样式

### 📝 Markdown 编辑
- **实时同步**: Markdown 和表格视图实时同步
- **语法高亮**: 支持 Markdown 语法高亮显示
- **行号显示**: 可选的行号显示功能
- **实时预览**: 边编辑边预览表格效果
- **格式验证**: 自动检测 Markdown 表格格式是否正确

### 🔄 导入导出
- **多格式支持**: 
  - 导入: Markdown (.md)、CSV (.csv)、Excel (.xlsx)、JSON (.json)
  - 导出: Markdown、CSV、Excel、JSON、HTML、PNG、SVG
- **拖拽导入**: 支持文件拖拽到应用中直接导入
- **剪贴板操作**: 从剪贴板导入/导出数据
- **样式保持**: 导出时可选择是否保留样式信息

### 🛠️ 表格操作
- **行列管理**: 添加/删除行、添加/删除列
- **数据排序**: 对指定列进行升序/降序排序
- **表格转置**: 行列互换
- **批量清空**: 清空选中单元格或整个表格
- **撤销重做**: 完整的操作历史记录和撤销重做功能

### 👀 预览功能
- **多视图模式**: 表格视图、Markdown 视图、预览视图、分屏视图
- **缩放控制**: 50%-200% 缩放预览
- **打印支持**: 优化的打印样式
- **全屏预览**: 支持全屏模式查看
- **导出图片**: 将表格导出为 PNG 或 SVG 图片

### ⚙️ 个性化设置
- **主题切换**: 明亮/暗黑主题
- **界面语言**: 多语言支持
- **编辑器配置**: 字体大小、行号、代码高亮、自动换行
- **表格显示**: 网格线、斑马纹、列宽调整
- **性能优化**: 虚拟滚动、延迟渲染

## 🚀 快速开始

### 环境要求
- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 📁 项目结构

```
src/
├── components/          # React 组件
│   ├── Header/         # 头部组件
│   ├── Sidebar/        # 侧边栏组件
│   │   ├── StylePanel.tsx      # 样式面板
│   │   ├── HistoryPanel.tsx    # 历史记录面板
│   │   ├── SettingsPanel.tsx   # 设置面板
│   │   └── FilePanel.tsx       # 文件管理面板
│   └── MainEditor/     # 主编辑器
│       ├── TableEditor.tsx     # 表格编辑器
│       ├── MarkdownEditor.tsx  # Markdown 编辑器
│       ├── PreviewPane.tsx     # 预览面板
│       └── Toolbar.tsx         # 工具栏
├── store/              # 状态管理 (Zustand)
├── utils/              # 工具函数
│   ├── markdown.ts     # Markdown 解析器
│   └── importExport.ts # 导入导出管理器
├── types/              # TypeScript 类型定义
└── styles/             # 样式文件
```

## 🎯 使用指南

### 基本操作
1. **创建表格**: 在 Markdown 编辑器中输入表格语法，或使用工具栏创建新表格
2. **编辑单元格**: 双击单元格进入编辑模式，或选中后按 Enter
3. **选择单元格**: 点击选择单个单元格，Ctrl+点击多选，Shift+点击范围选择
4. **设置样式**: 在右侧样式面板中设置选中单元格的样式
5. **导入数据**: 拖拽文件到应用中，或使用头部的导入按钮
6. **导出数据**: 使用头部的导出按钮选择格式导出

### 键盘快捷键
- `Ctrl/Cmd + S`: 保存
- `Ctrl/Cmd + Z`: 撤销
- `Ctrl/Cmd + Y`: 重做
- `Ctrl/Cmd + \`: 切换侧边栏
- `Enter`: 编辑单元格
- `Escape`: 退出编辑/取消选择
- `Delete/Backspace`: 清空选中单元格
- `Tab`: 移动到下一个单元格
- `Shift + Tab`: 移动到上一个单元格
- `方向键`: 导航单元格

### Markdown 表格语法
```markdown
| 表头1 | 表头2 | 表头3 |
|-------|-------|-------|
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |
```

支持对齐语法:
- `|:------|` 左对齐
- `|:-----:|` 居中对齐  
- `|------:|` 右对齐

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: Ant Design
- **状态管理**: Zustand
- **样式方案**: CSS + Ant Design
- **表格处理**: @tanstack/react-table
- **Markdown 解析**: react-markdown
- **文件处理**: xlsx, papaparse
- **代码质量**: ESLint + TypeScript

## 🔧 配置说明

### 环境变量
项目支持以下环境变量配置:

```env
# 开发服务器端口
VITE_PORT=5173

# API 基础路径
VITE_API_BASE_URL=http://localhost:3000

# 是否启用调试模式
VITE_DEBUG=true
```

### 构建配置
项目使用 Vite 作为构建工具，配置文件为 `vite.config.ts`。主要配置包括:

- 路径别名配置
- 开发服务器配置
- 构建优化配置
- 代码分割配置

## 📈 性能优化

- **虚拟滚动**: 大表格使用虚拟滚动提升性能
- **延迟渲染**: 非可视区域延迟渲染
- **代码分割**: 按需加载组件和工具库
- **缓存策略**: 智能缓存用户数据和设置
- **防抖处理**: 输入和操作防抖，减少不必要的计算

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢以下开源项目的支持:
- [React](https://reactjs.org/)
- [Ant Design](https://ant.design/)
- [Vite](https://vitejs.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [TanStack Table](https://tanstack.com/table)

## 📞 联系方式

如有问题或建议，请通过以下方式联系:
- 提交 Issue
- 发送邮件
- 加入讨论群

---

**享受使用 Markdown 表格可视化编辑器！** 🎉