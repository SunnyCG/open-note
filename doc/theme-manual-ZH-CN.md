# Open Note 主题手册

本文档介绍如何自定义 Open Note 的外观主题。

## 目录

- [内置主题](#内置主题)
- [切换主题](#切换主题)
- [自定义主题](#自定义主题)
- [主题文件格式](#主题文件格式)
- [颜色属性参考](#颜色属性参考)
- [示例主题](#示例主题)
- [导入/导出主题](#导入导出主题)

---

## 内置主题

Open Note 提供两个内置主题：

| 主题 | 描述 |
|------|------|
| **Dark** | 深色主题，适合夜间使用，减少眼睛疲劳 |
| **Light** | 浅色主题，适合日间使用，提高可读性 |

## 切换主题

1. 点击标题栏左侧的菜单图标（☰）
2. 在下拉菜单中选择 "Dark" 或 "Light"
3. 主题会立即切换，并自动保存

---

## 自定义主题

### 主题文件位置

自定义主题文件存放在应用配置目录：

- **Linux**: `~/.config/open-note/themes/`
- **macOS**: `~/Library/Application Support/open-note/themes/`
- **Windows**: `%APPDATA%/open-note/themes/`

### 创建自定义主题

1. 创建一个新的 JSON 文件，例如 `my-theme.json`
2. 按照下面的格式定义主题颜色
3. 将文件放入主题目录
4. 重启应用后，主题会出现在菜单中

---

## 主题文件格式

```json
{
  "name": "主题名称",
  "version": "1.0",
  "author": "作者名",
  "colors": {
    "background": {
      "primary": "#111827",
      "secondary": "#1f2937",
      "tertiary": "#374151"
    },
    "text": {
      "primary": "#f3f4f6",
      "secondary": "#d1d5db",
      "muted": "#9ca3af"
    },
    "border": {
      "default": "#374151",
      "focus": "#3b82f6"
    },
    "accent": {
      "primary": "#3b82f6",
      "primaryHover": "#2563eb",
      "danger": "#ef4444",
      "dangerHover": "#dc2626",
      "success": "#22c55e",
      "warning": "#eab308"
    },
    "editor": {
      "background": "#1f2937",
      "gutter": "#1e293b",
      "cursor": "#f3f4f6",
      "selection": "rgba(59, 130, 246, 0.3)",
      "placeholder": "#64748b"
    },
    "syntax": {
      "heading1": "#f1f5f9",
      "heading2": "#e2e8f0",
      "heading3": "#cbd5e1",
      "heading4": "#94a3b8",
      "link": "#7dd3fc",
      "code": "#fbbf24",
      "codeBg": "rgba(175, 184, 193, 0.15)",
      "quote": "#6366f1",
      "quoteBg": "rgba(99, 102, 241, 0.05)",
      "hr": "#374151"
    },
    "unsavedDot": "#3b82f6"
  }
}
```

---

## 颜色属性参考

### 背景颜色 (`background`)

| 属性 | 说明 |
|------|------|
| `primary` | 主背景色 - 应用程序主界面背景 |
| `secondary` | 次级背景色 - 侧边栏、面板、模态框背景 |
| `tertiary` | 三级背景色 - 悬停状态、输入框背景 |

### 文字颜色 (`text`)

| 属性 | 说明 |
|------|------|
| `primary` | 主文字色 - 主要内容文字 |
| `secondary` | 次级文字色 - 次要内容文字 |
| `muted` | 弱化文字色 - 标签、元数据、禁用文字 |

### 边框颜色 (`border`)

| 属性 | 说明 |
|------|------|
| `default` | 默认边框色 - 大部分边框 |
| `focus` | 聚焦边框色 - 输入框聚焦时的边框 |

### 强调颜色 (`accent`)

| 属性 | 说明 |
|------|------|
| `primary` | 主强调色 - 按钮、活动状态、链接 |
| `primaryHover` | 主强调色悬停 - 按钮悬停状态 |
| `danger` | 危险色 - 删除按钮、错误提示 |
| `dangerHover` | 危险色悬停 - 删除按钮悬停 |
| `success` | 成功色 - 保存成功提示 |
| `warning` | 警告色 - 未保存提示 |

### 编辑器颜色 (`editor`)

| 属性 | 说明 |
|------|------|
| `background` | 编辑器背景色 |
| `gutter` | 行号栏背景色 |
| `cursor` | 光标颜色 |
| `selection` | 选中区域颜色（支持 rgba） |
| `placeholder` | 占位符文字颜色 |

### 语法高亮颜色 (`syntax`)

| 属性 | 说明 |
|------|------|
| `heading1` | 一级标题颜色 |
| `heading2` | 二级标题颜色 |
| `heading3` | 三级标题颜色 |
| `heading4` | 四级及以下标题颜色 |
| `link` | 链接颜色（Wiki 链接 `[[note]]`） |
| `code` | 行内代码颜色 |
| `codeBg` | 行内代码背景色（支持 rgba） |
| `quote` | 引用块边框颜色 |
| `quoteBg` | 引用块背景色（支持 rgba） |
| `hr` | 水平分割线颜色 |

### 其他

| 属性 | 说明 |
|------|------|
| `unsavedDot` | 未保存指示器颜色 |

---

## 示例主题

### 高对比度主题

```json
{
  "name": "High Contrast",
  "version": "1.0",
  "author": "Open Note",
  "colors": {
    "background": {
      "primary": "#000000",
      "secondary": "#0a0a0a",
      "tertiary": "#1a1a1a"
    },
    "text": {
      "primary": "#ffffff",
      "secondary": "#f0f0f0",
      "muted": "#d0d0d0"
    },
    "border": {
      "default": "#404040",
      "focus": "#00ff00"
    },
    "accent": {
      "primary": "#00ff00",
      "primaryHover": "#00cc00",
      "danger": "#ff0000",
      "dangerHover": "#cc0000",
      "success": "#00ff00",
      "warning": "#ffff00"
    },
    "editor": {
      "background": "#000000",
      "gutter": "#0a0a0a",
      "cursor": "#00ff00",
      "selection": "rgba(0, 255, 0, 0.3)",
      "placeholder": "#666666"
    },
    "syntax": {
      "heading1": "#ffffff",
      "heading2": "#f0f0f0",
      "heading3": "#e0e0e0",
      "heading4": "#d0d0d0",
      "link": "#00ffff",
      "code": "#ffff00",
      "codeBg": "rgba(255, 255, 0, 0.1)",
      "quote": "#ff00ff",
      "quoteBg": "rgba(255, 0, 255, 0.05)",
      "hr": "#404040"
    },
    "unsavedDot": "#ffff00"
  }
}
```

### 护眼绿色主题

```json
{
  "name": "Eye Care Green",
  "version": "1.0",
  "author": "Open Note",
  "colors": {
    "background": {
      "primary": "#c8e6c9",
      "secondary": "#a5d6a7",
      "tertiary": "#81c784"
    },
    "text": {
      "primary": "#1b5e20",
      "secondary": "#2e7d32",
      "muted": "#388e3c"
    },
    "border": {
      "default": "#66bb6a",
      "focus": "#1b5e20"
    },
    "accent": {
      "primary": "#1b5e20",
      "primaryHover": "#0d3d12",
      "danger": "#b71c1c",
      "dangerHover": "#7f0000",
      "success": "#1b5e20",
      "warning": "#e65100"
    },
    "editor": {
      "background": "#c8e6c9",
      "gutter": "#a5d6a7",
      "cursor": "#1b5e20",
      "selection": "rgba(27, 94, 32, 0.3)",
      "placeholder": "#4caf50"
    },
    "syntax": {
      "heading1": "#0d3d12",
      "heading2": "#1b5e20",
      "heading3": "#2e7d32",
      "heading4": "#388e3c",
      "link": "#0d47a1",
      "code": "#7b1fa2",
      "codeBg": "rgba(123, 31, 162, 0.1)",
      "quote": "#5d4037",
      "quoteBg": "rgba(93, 64, 55, 0.05)",
      "hr": "#66bb6a"
    },
    "unsavedDot": "#1b5e20"
  }
}
```

### 夜间暖色主题

```json
{
  "name": "Warm Night",
  "version": "1.0",
  "author": "Open Note",
  "colors": {
    "background": {
      "primary": "#1a1a2e",
      "secondary": "#16213e",
      "tertiary": "#0f3460"
    },
    "text": {
      "primary": "#e8e8e8",
      "secondary": "#c4c4c4",
      "muted": "#9a9a9a"
    },
    "border": {
      "default": "#0f3460",
      "focus": "#e94560"
    },
    "accent": {
      "primary": "#e94560",
      "primaryHover": "#d63354",
      "danger": "#ff6b6b",
      "dangerHover": "#ee5a5a",
      "success": "#4ecca3",
      "warning": "#ffc857"
    },
    "editor": {
      "background": "#16213e",
      "gutter": "#1a1a2e",
      "cursor": "#e94560",
      "selection": "rgba(233, 69, 96, 0.3)",
      "placeholder": "#6b7280"
    },
    "syntax": {
      "heading1": "#ffffff",
      "heading2": "#e8e8e8",
      "heading3": "#c4c4c4",
      "heading4": "#9a9a9a",
      "link": "#4ecca3",
      "code": "#ffc857",
      "codeBg": "rgba(255, 200, 87, 0.15)",
      "quote": "#e94560",
      "quoteBg": "rgba(233, 69, 96, 0.05)",
      "hr": "#0f3460"
    },
    "unsavedDot": "#e94560"
  }
}
```

---

## 导入/导出主题

### 导入主题

1. 点击菜单 → Themes → Import Theme
2. 选择 `.json` 格式的主题文件
3. 主题会被自动加载并应用到应用

### 导出主题

1. 选择你想要导出的主题
2. 点击菜单 → Themes → Export Current Theme
3. 选择保存位置和文件名
4. 主题文件会被保存为 JSON 格式

### 分享主题

导出的主题文件可以分享给其他用户。只需将 `.json` 文件复制到他们的主题目录即可。

---

## 技术说明

### CSS 变量

Open Note 使用 CSS 变量实现主题系统。每个主题颜色都会被应用到对应的 CSS 变量：

```css
:root {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f3f4f6;
  /* ... */
}
```

切换主题时，这些变量会被动态更新，所有使用这些变量的组件都会自动更新。

### Tailwind CSS

主题颜色通过 Tailwind CSS v4 的 `@theme` 指令集成，可以在组件中使用：

```html
<div class="bg-bg-primary text-text-primary">
  <!-- 内容 -->
</div>
```

---

## 常见问题

### Q: 主题文件放在哪里？

A: 见 [主题文件位置](#主题文件位置)

### Q: 如何恢复默认主题？

A: 选择内置的 "Dark" 或 "Light" 主题即可。

### Q: 自定义主题不显示？

A: 请检查：
1. JSON 文件格式是否正确
2. 文件是否放在正确的目录
3. 是否重启了应用

### Q: 颜色值支持什么格式？

A: 支持：
- 十六进制：`#ff0000`
- RGB：`rgb(255, 0, 0)`
- RGBA：`rgba(255, 0, 0, 0.5)`
- HSL：`hsl(0, 100%, 50%)`

---

## 版本历史

- **v1.0** - 初始版本，支持自定义主题
