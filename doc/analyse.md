# Open Note 项目分析

## 一、界面结构

应用采用三栏式布局设计：

### 1. 侧边栏 (Sidebar) - 宽度 256px

| 区域 | 功能 |
|------|------|
| **Vault Header** | 显示当前保险库名称和笔记数量，点击可打开保险库管理弹窗 |
| **Notes List** | 笔记列表，显示笔记名称和修改时间，支持选中、删除操作 |
| **Outgoing Links Panel** | 显示当前笔记的出链（引用的其他笔记） |

### 2. 主内容区 (Main Content)

| 区域 | 功能 |
|------|------|
| **Error Banner** | 错误提示横幅（仅在出错时显示） |
| **Toolbar** | 笔记标题输入框、预览/编辑切换按钮、保存按钮 |
| **Editor/Preview Area** | CodeMirror 6 编辑器 或 WikiLink 预览渲染 |
| **Status Bar** | 字符数、词数、链接数统计，保存状态指示器 |
| **Backlinks Panel** | 显示反向链接（引用当前笔记的其他笔记） |

### 3. 弹窗 (Modals)

| 弹窗 | 功能 |
|------|------|
| **New Note Modal** | 创建新笔记，输入笔记名称 |
| **Vault Modal** | 保险库管理，包含打开文件夹、创建新保险库、最近保险库列表 |

---

## 二、前端模块

### 目录结构

```
src/
├── App.tsx                    # 主应用组件
├── main.tsx                   # 入口文件
├── vite-env.d.ts              # Vite 类型声明
├── components/                # UI 组件
│   ├── MarkdownEditor.tsx     # CodeMirror 6 编辑器
│   ├── WikiLinkRenderer.tsx   # Wiki 链接预览渲染
│   ├── BacklinksPanel.tsx     # 反向链接面板
│   ├── OutgoingLinksPanel.tsx # 出链面板
│   └── SaveStatusIndicator.tsx# 保存状态指示器
├── hooks/                     # 自定义 Hooks
│   ├── useNotes.ts            # 笔记管理状态
│   ├── useWikiLinks.ts        # Wiki 链接解析与导航
│   └── useAutoSave.ts         # 自动保存逻辑
├── lib/                       # 工具库
│   ├── notes.ts               # Tauri API 封装
│   ├── wikiLinkExtension.ts   # CodeMirror Wiki链接扩展
│   └── markdownStylingExtension.ts # CodeMirror Markdown 样式扩展
└── types/
    └── note.ts                # TypeScript 类型定义
```

### 组件模块详解

#### 1. MarkdownEditor (`components/MarkdownEditor.tsx`)
- 基于 CodeMirror 6 的 Markdown 编辑器
- 功能：
  - 行号显示
  - 语法高亮（Markdown + 代码块）
  - Wiki 链接语法识别与点击处理
  - 撤销/重做支持
  - 快捷键保存 (Cmd/Ctrl+S)
  - 深色主题 (oneDark)

#### 2. WikiLinkRenderer (`components/WikiLinkRenderer.tsx`)
- 预览模式下的内容渲染
- 功能：
  - 解析并渲染 `[[wiki-link]]` 为可点击链接
  - 支持显示文本和标题锚点

#### 3. BacklinksPanel (`components/BacklinksPanel.tsx`)
- 反向链接面板
- 显示引用当前笔记的其他笔记列表

#### 4. OutgoingLinksPanel (`components/OutgoingLinksPanel.tsx`)
- 出链面板
- 显示当前笔记引用的其他笔记列表

#### 5. SaveStatusIndicator (`components/SaveStatusIndicator.tsx`)
- 保存状态可视化指示

### Hooks 模块详解

#### 1. useNotes (`hooks/useNotes.ts`)
核心笔记管理 Hook，提供：

| 功能 | 说明 |
|------|------|
| `currentVault` | 当前保险库状态 |
| `recentVaults` | 最近打开的保险库列表 |
| `notes` | 笔记列表（元数据） |
| `currentNote` | 当前打开的笔记 |
| `openVault()` | 打开指定保险库 |
| `createNewVault()` | 创建新保险库 |
| `openNote()` | 打开指定笔记 |
| `saveNote()` | 保存笔记 |
| `createNote()` | 创建新笔记 |
| `deleteNote()` | 删除笔记 |
| `renameNote()` | 重命名笔记 |

#### 2. useWikiLinks (`hooks/useWikiLinks.ts`)
Wiki 链接管理 Hook，提供：

| 功能 | 说明 |
|------|------|
| `outgoingLinks` | 当前笔记的出链列表 |
| `referencedNotes` | 引用的笔记名称列表（去重） |
| `backlinks` | 反向链接列表 |
| `navigateToLink()` | 导航到 Wiki 链接目标（支持自动创建不存在的笔记） |

#### 3. useAutoSave (`hooks/useAutoSave.ts`)
自动保存 Hook，提供：

| 功能 | 说明 |
|------|------|
| `saveStatus` | 保存状态 (idle/saving/saved/error) |
| `saveNow()` | 立即保存 |
| `cancelPendingSave()` | 取消待执行的保存 |

- 默认 1 秒防抖延迟
- 支持手动触发保存

### API 封装层 (`lib/notes.ts`)

封装所有 Tauri IPC 调用：

```typescript
// 保险库管理
validateVault(path)
createVault(path)
getVaultInfo(path)
setCurrentVault(path)
getCurrentVault()
listRecentVaults()
removeRecentVault(path)
initVault()
getVaultPath()

// 笔记操作
listNotes(vaultPath)
readNote(path)
writeNote(vaultPath, name, content)
deleteNote(path)
renameNote(path, newName)

// Wiki 链接
parseLinks(content)
getBacklinks(vaultPath, noteName)
resolveWikiLink(vaultPath, target)
```

---

## 三、Rust 后端模块

### 数据结构

```rust
// 笔记
Note {
    name: String,
    path: String,
    content: String,
    modified: u64,
}

// 笔记元数据（不含内容）
NoteMeta {
    name: String,
    path: String,
    modified: u64,
}

// 保险库
Vault {
    name: String,
    path: String,
    note_count: usize,
    last_opened: u64,
}

// Wiki 链接
WikiLink {
    target: String,           // 目标笔记名
    heading: Option<String>,  // 标题锚点
    display_text: Option<String>, // 显示文本
    start: usize,             // 起始位置
    end: usize,               // 结束位置
    raw: String,              // 原始匹配文本
}

// 反向链接信息
BacklinkInfo {
    source_path: String,
    source_name: String,
    links: Vec<WikiLink>,
}

// 通用操作结果
FsResult<T> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}
```

### Tauri Commands 分类

#### 1. 保险库管理

| 命令 | 功能 |
|------|------|
| `validate_vault` | 验证路径是否为有效保险库目录 |
| `create_vault` | 在指定路径创建新保险库 |
| `get_vault_info` | 获取保险库信息 |
| `set_current_vault` | 设置当前保险库 |
| `get_current_vault` | 获取当前保险库 |
| `list_recent_vaults` | 列出最近打开的保险库 |
| `remove_recent_vault` | 从最近列表移除保险库 |
| `get_vault_path` | 获取默认保险库路径 |
| `init_vault` | 初始化默认保险库 |

#### 2. 笔记操作

| 命令 | 功能 |
|------|------|
| `list_notes` | 列出保险库中所有笔记（按修改时间排序） |
| `read_note` | 读取笔记内容和元数据 |
| `write_note` | 创建或更新笔记 |
| `delete_note` | 删除笔记 |
| `rename_note` | 重命名笔记 |

#### 3. Wiki 链接

| 命令 | 功能 |
|------|------|
| `parse_links` | 解析 Markdown 内容中的 Wiki 链接 |
| `get_backlinks` | 获取指向指定笔记的反向链接 |
| `resolve_wiki_link` | 解析 Wiki 链接目标为文件路径 |

### Wiki 链接解析

支持的语法：
- `[[note-name]]` - 基本链接
- `[[note-name#heading]]` - 带标题锚点
- `[[note-name|display text]]` - 带显示文本
- `[[note-name#heading|display text]]` - 完整语法

正则表达式：
```rust
r"\[\[([^\]|#]+)(?:#([^|\]]+))?(?:\|([^\]]+))?\]\]"
```

### 应用状态

```rust
AppState {
    current_vault: Mutex<Option<String>>,
    recent_vaults: Mutex<Vec<String>>,
}
```

---

## 四、数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  App.tsx                                                        │
│    ├── useNotes() ────────────────────┐                        │
│    ├── useWikiLinks() ────────────────┤                        │
│    └── useAutoSave() ─────────────────┤                        │
│                                        │                        │
│                    lib/notes.ts ◄──────┘ (Tauri invoke)        │
└────────────────────────────────────┬────────────────────────────┘
                                     │ IPC
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (Rust/Tauri)                        │
├─────────────────────────────────────────────────────────────────┤
│  Tauri Commands                                                 │
│    ├── Vault Management                                         │
│    ├── Note Operations                                          │
│    └── Wiki Links                                               │
│                                                                 │
│  File System ◄───────► ~/.local/share/open-note/vault/         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 五、技术栈总结

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 编辑器 | CodeMirror 6 |
| 样式 | Tailwind CSS |
| 后端框架 | Tauri 2.x |
| 后端语言 | Rust |
| IPC 通信 | @tauri-apps/api/core |
| 对话框 | @tauri-apps/plugin-dialog |
