# 持久化功能实现文档

## 概述

实现了应用程序数据的持久化存储功能，确保在关闭程序后能够恢复之前的状态。

## 实现日期

2026-02-25

## 实现的功能

### 1. Vault 历史记录持久化
- 保存最近打开的 vault 列表（最多10个）
- 应用启动时自动恢复历史记录
- 每次打开新的 vault 时自动保存

### 2. 最后打开的笔记记忆
- 记住每个 vault 中最后打开的笔记
- 切换 vault 时自动恢复上次打开的笔记
- 打开笔记时自动更新记忆

### 3. 当前 Vault 状态恢复 ⭐ 新增
- 应用关闭时保存当前打开的 vault
- 应用启动时自动打开上次的 vault
- 如果保存的 vault 路径不存在，自动清除并回退到默认 vault
- **解决用户反馈的问题**：不再每次都打开默认的 "vault" 目录

### 4. 文件选择器默认路径记忆
- 记住上次选择文件夹的路径
- 下次打开文件选择器时使用该路径作为默认位置
- 支持 "Open Folder" 和 "Create Vault" 功能

## 数据存储位置

配置文件保存在系统特定的应用数据目录：

- **Linux**: `~/.config/open-note/config.json`
- **Windows**: `%APPDATA%\com.sunny.open-note\config.json`
- **macOS**: `~/Library/Application Support/com.sunny.open-note/config.json`

## 配置文件结构

```json
{
  "current_vault": "/path/to/current/vault",
  "recent_vaults": [
    "/path/to/vault1",
    "/path/to/vault2",
    "/path/to/vault3"
  ],
  "last_note_per_vault": {
    "/path/to/vault1": "/path/to/vault1/note1.md",
    "/path/to/vault2": "/path/to/vault2/note2.md"
  },
  "last_open_directory": "/path/to/last/selected/folder"
}
```

**字段说明：**
- `current_vault`: 最后使用的 vault 路径（应用重启时自动打开）
- `recent_vaults`: 历史记录的 vault 列表（最多 10 个）
- `last_note_per_vault`: 每个 vault 的最后打开笔记
- `last_open_directory`: 上次选择的文件夹路径

**注意：** `open_vaults`（已打开的 vault 列表）**不会持久化保存**，每次应用启动时重置为只包含 `current_vault`。

## Vault Sidebar 显示逻辑

Vault Sidebar 分为两个区域，用蓝色分隔线隔开：

```
┌─────────────┐
│ Open (上方) │ ← 已打开的 vault (open_vaults)
│     [V1]    │
│     [V2]    │
│ ─────────   │ ← 蓝色分隔线
│ History(下) │ ← 历史记录 (recent_vaults)
│     [V3]    │
│     [V4]    │
└─────────────┘
```

**显示规则：**
- **Open 区域**：显示本次会话中用户打开的 vault (open_vaults)
- **History 区域**：显示历史记录中**不在** Open 区域的 vault
- **当前 vault**：高亮显示（蓝色背景），无论在哪个区域
- **分隔线**：仅当两个区域都有内容时显示

**⭐ 关键行为（会话隔离）：**
1. 应用启动时，Open 区域**只有** `current_vault`（最后使用的 vault）
2. 其他所有历史 vault 都在 History 区域
3. 用户打开新 vault 时，它自动添加到 Open 区域
4. **关闭应用后，Open 状态不会保存**，下次启动重置为第 1 步

## 代码修改

### Rust 端 (src-tauri/src/lib.rs)

1. **新增结构体**：
   - `AppConfig`: 存储配置数据
     - `current_vault`: 最后使用的 vault
     - `recent_vaults`: 历史记录（最多 10 个）
     - `last_note_per_vault`: 每个 vault 的最后笔记
     - `last_open_directory`: 上次选择的目录

2. **新增函数**：
   - `get_config_path()`: 获取配置文件路径
   - `save_config()`: 保存配置到磁盘
   - `load_config()`: 从磁盘加载配置

3. **修改 AppState**：
   - 新增字段：`last_open_directory: Mutex<Option<String>>`

4. **修改的命令**：
   - `set_current_vault()`: 修改后保存配置
   - `set_last_note()`: 修改后保存配置
   - `remove_recent_vault()`: 修改后保存配置

5. **新增命令**：
   - `get_last_open_directory()`: 获取上次打开的目录
   - `set_last_open_directory()`: 设置上次打开的目录

6. **修改 run() 函数**：
   - 添加 `.setup()` 处理器
   - 应用启动时加载配置
   - **启动时清空 open_vaults，只添加 current_vault**
   - 实现会话隔离：每次启动都是全新的 Open 状态

### ⭐ 关键设计：会话隔离的 Open 状态

**设计理念：**
- `open_vaults` **不持久化**，只在内存中维护
- 每次应用启动，Open 区域重置为只包含 `current_vault`
- 用户在会话中打开的 vault 添加到 Open 区域
- 关闭应用后，Open 状态完全重置

**实现方式：**
```rust
// 启动时清空并只添加 current vault
if let Ok(mut open) = state.open_vaults.lock() {
    open.clear();  // 清空之前的状态
    if let Some(ref current_path) = current_vault_path {
        open.insert(0, current_path.clone());  // 只添加当前 vault
    }
}
```

### TypeScript 端 (src/lib/notes.ts)

新增 API wrapper 函数：
```typescript
export async function getLastOpenDirectory(): Promise<FsResult<string | null>>
export async function setLastOpenDirectory(path: string): Promise<FsResult<void>>
```

### App.tsx

修改了两个函数以支持默认路径记忆：
- `handleOpenVault()`: 使用记忆的默认路径，选择后保存父目录
- `handleCreateVault()`: 使用记忆的默认路径，选择后保存目录

## 如何测试

### 测试步骤：

1. **启动应用程序**：
   ```bash
   npm run tauri dev
   ```

2. **打开一个 Vault**：
   - 点击 "Open Folder" 按钮
   - 选择一个包含笔记的文件夹
   - 打开一些笔记

3. **关闭应用程序**：
   - 直接关闭窗口
   - 应用会自动保存当前状态

4. **重新启动应用程序** ⭐ 关键测试：
   - ✅ **应该自动打开上次的 vault**（而不是默认的 "vault" 目录）
   - ✅ **应该自动打开上次查看的笔记**
   - ✅ Vault Sidebar 应该显示历史 vault 列表

5. **测试文件选择器记忆**：
   - 点击 "Open Folder"
   - 文件选择器应该打开在上次选择的位置

6. **测试多个 Vault**：
   - 打开多个不同的 vault
   - 它们应该出现在 Vault Sidebar 中
   - 切换 vault 应该恢复各自的最后打开的笔记

7. **测试 Vault Sidebar 位置** ⭐ 关键测试：
   - 打开 vault A，打开一些笔记
   - 打开 vault B，打开一些笔记
   - 打开 vault C
   - 关闭应用
   - 重新启动应用
   - ✅ **只有最后使用的 vault（比如 vault C）在 Open 区域**
   - ✅ **vault A 和 B 都在 History 区域**
   - ✅ **点击 vault A 或 B 后，它们会移动到 Open 区域**

8. **测试会话隔离** ⭐ 新测试：
   - 在当前会话中打开几个 vault
   - 关闭应用
   - 重新启动应用
   - ✅ **只有最后使用的 vault 在 Open 区域**
   - ✅ **其他 vault 都重置到 History 区域**
   - ✅ **确认 Open 状态没有持久化**

8. **测试路径失效处理**：
   - 手动删除或移动保存的 vault 目录
   - 重新启动应用
   - ✅ 应该回退到默认 vault（不会崩溃）

## 开发模式 vs 打包模式

两种模式都支持持久化，数据存储在相同的位置：

| 功能 | 开发模式 | 打包模式 |
|------|---------|---------|
| 配置文件位置 | 相同 | 相同 |
| 持久化功能 | ✅ 完全支持 | ✅ 完全支持 |
| 热重载 | ✅ 支持 | ❌ 不支持 |

## 跨平台打包

### 在目标平台上构建：

```bash
# Ubuntu (在 Linux 上)
npm run tauri build
# 生成文件: src-tauri/target/release/bundle/deb/

# Windows 11 (在 Windows 上)
npm run tauri build
# 生成文件: src-tauri/target/release/bundle/msi/

# macOS (在 macOS 上)
npm run tauri build
# 生成文件: src-tauri/target/release/bundle/dmg/
```

### 注意事项：

- Tauri 需要在**目标平台**上构建
- 需要安装对应平台的构建工具链
- Linux: 需要 `libwebkit2gtk-4.0-dev`, `build-essential`
- Windows: 需要 WebView2, Microsoft C++ Build Tools
- macOS: 需要 Xcode Command Line Tools

## 故障排除

### 配置文件未加载

检查配置文件是否存在：
```bash
# Linux
cat ~/.config/open-note/config.json

# Windows
type %APPDATA%\com.sunny.open-note\config.json

# macOS
cat ~/Library/Application\ Support/com.sunny.open-note/config.json
```

### 权限问题

确保应用有权限读写配置目录。如果出现问题，删除配置文件重新生成。

## 未来改进

- [ ] 添加配置导入/导出功能
- [ ] 支持云同步配置
- [ ] 添加配置重置功能
- [ ] 支持更多的用户偏好设置（主题、字体大小等）
