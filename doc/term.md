# Open Note 术语表

## 核心概念

| 英文 | 中文 | 说明 |
|------|------|------|
| **Vault** | 仓库 / 保险库 | 存储笔记的文件夹，类似于 Obsidian 的 vault 概念 |
| **Note** | 笔记 / 文档 | 单个 Markdown 文件，应用的基本存储单元 |
| **Wiki Link** | Wiki 链接 / 双向链接 | `[[note-name]]` 格式的内部链接语法 |

---

## 保险库相关

| 英文 | 中文 | 说明 |
|------|------|------|
| Vault | 仓库 / 保险库 | 笔记存储的根目录 |
| Vault Path | 仓库路径 | 仓库在文件系统中的位置 |
| Current Vault | 当前仓库 | 正在使用的仓库 |
| Recent Vaults | 最近仓库 | 最近打开过的仓库列表 |
| Open Vault | 打开仓库 | 选择并切换到一个已存在的仓库 |
| Create Vault | 创建仓库 | 在指定位置新建仓库 |
| Validate Vault | 验证仓库 | 检查路径是否为有效仓库 |

---

## 笔记相关

| 英文 | 中文 | 说明 |
|------|------|------|
| Note | 笔记 / 文档 | 单个笔记文件 |
| Note Name | 笔记名称 | 笔记的标题/文件名 |
| Note Path | 笔记路径 | 笔记文件的完整路径 |
| Note Content | 笔记内容 | 笔记的 Markdown 文本内容 |
| Note Meta | 笔记元数据 | 笔记的基本信息（名称、路径、修改时间） |
| Create Note | 创建笔记 | 新建一个笔记 |
| Read Note | 读取笔记 | 加载笔记内容 |
| Write Note | 写入笔记 | 保存笔记内容 |
| Delete Note | 删除笔记 | 删除笔记文件 |
| Rename Note | 重命名笔记 | 修改笔记名称 |

---

## 链接相关

| 英文 | 中文 | 说明 |
|------|------|------|
| Wiki Link | Wiki 链接 | Obsidian 风格的双向链接语法 |
| Outgoing Link | 出链 / 外链 | 当前笔记链接到的其他笔记 |
| Backlink | 反向链接 / 回链 | 链接到当前笔记的其他笔记 |
| Referenced Note | 被引用笔记 | 通过链接引用的目标笔记 |
| Target | 目标 | 链接指向的笔记名称 |
| Heading | 标题锚点 | 链接中的 `#heading` 部分 |
| Display Text | 显示文本 | 链接中的自定义显示文字 `\|display` |
| Raw | 原始文本 | 完整的链接语法字符串 |
| Parse Links | 解析链接 | 从内容中提取所有 Wiki 链接 |
| Resolve Link | 解析链接 | 将链接目标转换为文件路径 |
| Navigate | 导航 | 跳转到链接指向的笔记 |

---

## 编辑器相关

| 英文 | 中文 | 说明 |
|------|------|------|
| Editor | 编辑器 | CodeMirror 6 文本编辑组件 |
| Preview | 预览 | 渲染后的内容展示 |
| Edit Mode | 编辑模式 | 可编辑文本的模式 |
| Preview Mode | 预览模式 | 只读渲染展示模式 |
| Markdown | Markdown | 标记语言格式 |
| Syntax Highlighting | 语法高亮 | 代码和语法的彩色显示 |
| Line Number | 行号 | 编辑器左侧的行号显示 |

---

## 状态与操作

| 英文 | 中文 | 说明 |
|------|------|------|
| Save | 保存 | 将修改写入文件 |
| Auto Save | 自动保存 | 延迟自动保存功能 |
| Save Status | 保存状态 | 保存操作的状态指示 |
| Unsaved Changes | 未保存更改 | 尚未写入文件的修改 |
| Debounce | 防抖 | 延迟执行以减少操作频率 |
| Loading | 加载中 | 数据加载状态 |
| Error | 错误 | 操作失败的提示 |
| Idle | 空闲 | 无操作状态 |
| Modified | 修改时间 | 文件最后修改的时间戳 |

---

## 界面元素

| 英文 | 中文 | 说明 |
|------|------|------|
| Sidebar | 侧边栏 | 左侧的导航面板 |
| Main Content | 主内容区 | 中央的编辑/预览区域 |
| Toolbar | 工具栏 | 标题输入和操作按钮区域 |
| Status Bar | 状态栏 | 底部的统计和状态信息 |
| Modal | 弹窗 / 模态框 | 覆盖在主界面上的对话框 |
| Panel | 面板 | 侧边栏或底部的功能区块 |
| Button | 按钮 | 可点击的操作元素 |

---

## 技术术语

| 英文 | 中文 | 说明 |
|------|------|------|
| Tauri Command | Tauri 命令 | Rust 后端暴露给前端的函数 |
| IPC | 进程间通信 | 前端与后端之间的通信机制 |
| Invoke | 调用 | 前端调用后端命令 |
| Hook | 钩子 | React 的状态管理函数 |
| State | 状态 | 应用或组件的数据状态 |
| Props | 属性 | 组件的输入参数 |
| Callback | 回调 | 事件处理函数 |
| FsResult | 文件系统结果 | 操作的返回结果封装 |
