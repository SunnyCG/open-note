use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;

/// Represents a note file
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Note {
    pub name: String,
    pub path: String,
    pub content: String,
    pub modified: u64,
}

/// Represents a note metadata (without content)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NoteMeta {
    pub name: String,
    pub path: String,
    pub modified: u64,
}

/// Represents a vault
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Vault {
    pub name: String,
    pub path: String,
    pub note_count: usize,
    pub last_opened: u64,
}

/// Represents a parsed wiki link
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WikiLink {
    /// The target note name (without .md extension)
    pub target: String,
    /// Optional heading anchor (e.g., "section" from [[note#section]])
    pub heading: Option<String>,
    /// Optional display text (e.g., "My Note" from [[note|My Note]])
    pub display_text: Option<String>,
    /// Start position in the original content (byte offset)
    pub start: usize,
    /// End position in the original content (byte offset)
    pub end: usize,
    /// The raw matched string including brackets
    pub raw: String,
}

/// Result of parsing links from content
#[derive(Debug, Serialize, Deserialize)]
pub struct ParsedLinks {
    /// All wiki links found in the content
    pub links: Vec<WikiLink>,
    /// Unique note names referenced (without headings or display text)
    pub referenced_notes: Vec<String>,
}

/// Node in the file tree - can be a folder or a note
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type")]
pub enum FileTreeNode {
    #[serde(rename = "folder")]
    Folder {
        name: String,
        path: String,           // Relative path from vault root
        modified: u64,
        children: Vec<FileTreeNode>,
    },
    #[serde(rename = "note")]
    Note {
        name: String,
        path: String,           // Full absolute path
        relative_path: String,  // Relative to vault root
        modified: u64,
    },
}

/// Root structure for the file tree
#[derive(Debug, Serialize, Deserialize)]
pub struct FileTree {
    pub vault_path: String,
    pub root: Vec<FileTreeNode>,
    pub total_notes: usize,
    pub total_folders: usize,
}

/// Application configuration for persistence
#[derive(Debug, Serialize, Deserialize)]
struct AppConfig {
    current_vault: Option<String>,
    recent_vaults: Vec<String>,
    #[serde(default)]
    open_notes_per_vault: HashMap<String, Vec<String>>,
    #[serde(default)]
    active_note_per_vault: HashMap<String, String>,
    #[serde(default)]
    last_note_per_vault: HashMap<String, String>,  // Kept for migration
    last_open_directory: Option<String>,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            current_vault: None,
            recent_vaults: Vec::new(),
            open_notes_per_vault: HashMap::new(),
            active_note_per_vault: HashMap::new(),
            last_note_per_vault: HashMap::new(),
            last_open_directory: None,
        }
    }
}

/// Information about a backlink (a note that links to another note)
#[derive(Debug, Serialize, Deserialize)]
pub struct BacklinkInfo {
    /// Path to the source note
    pub source_path: String,
    /// Name of the source note
    pub source_name: String,
    /// Links from the source note that point to the target
    pub links: Vec<WikiLink>,
}

/// Result type for file operations
#[derive(Debug, Serialize, Deserialize)]
pub struct FsResult<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> FsResult<T> {
    pub fn ok(data: T) -> Self {
        FsResult {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn err(msg: &str) -> Self {
        FsResult {
            success: false,
            data: None,
            error: Some(msg.to_string()),
        }
    }
}

/// Theme color definitions for serialization
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ThemeColors {
    pub background: ThemeBackgroundColors,
    pub text: ThemeTextColors,
    pub border: ThemeBorderColors,
    pub accent: ThemeAccentColors,
    pub editor: ThemeEditorColors,
    #[serde(rename = "syntax")]
    pub syntax_highlighting: ThemeSyntaxColors,
    #[serde(default)]
    pub unsaved_dot: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ThemeBackgroundColors {
    pub primary: String,
    pub secondary: String,
    pub tertiary: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ThemeTextColors {
    pub primary: String,
    pub secondary: String,
    #[serde(rename = "muted")]
    pub muted: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ThemeBorderColors {
    #[serde(rename = "default")]
    pub default: String,
    #[serde(rename = "focus")]
    pub focus: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ThemeAccentColors {
    pub primary: String,
    #[serde(default = "default_primary_hover")]
    pub primary_hover: String,
    pub danger: String,
    #[serde(default = "default_danger_hover")]
    pub danger_hover: String,
    pub success: String,
    pub warning: String,
}

fn default_primary_hover() -> String { "#2563eb".to_string() }
fn default_danger_hover() -> String { "#dc2626".to_string() }

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ThemeEditorColors {
    pub background: String,
    pub gutter: String,
    pub cursor: String,
    pub selection: String,
    #[serde(default)]
    pub placeholder: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ThemeSyntaxColors {
    #[serde(default)]
    pub heading1: String,
    #[serde(default)]
    pub heading2: String,
    #[serde(default)]
    pub heading3: String,
    #[serde(default)]
    pub heading4: String,
    pub link: String,
    pub code: String,
    #[serde(default)]
    pub code_bg: String,
    pub quote: String,
    #[serde(default)]
    pub quote_bg: String,
    pub hr: String,
}

/// Represents a theme
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Theme {
    pub name: String,
    #[serde(default)]
    pub version: String,
    #[serde(default)]
    pub author: String,
    pub colors: ThemeColors,
}

/// Get the themes directory path
fn get_themes_dir(app_handle: &tauri::AppHandle) -> std::io::Result<PathBuf> {
    let config_dir = app_handle.path().app_config_dir()
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?;
    Ok(config_dir.join("themes"))
}

/// Parse wiki links from markdown content
fn parse_wiki_links(content: &str) -> Vec<WikiLink> {
    // Pattern matches: [[target]], [[target#heading]], [[target|display]], [[target#heading|display]]
    let pattern = r"\[\[([^\]|#]+)(?:#([^|\]]+))?(?:\|([^\]]+))?\]\]";
    let re = Regex::new(pattern).unwrap();

    re.captures_iter(content)
        .filter_map(|cap| {
            let full_match = cap.get(0)?;
            let target = cap.get(1)?.as_str().trim().to_string();

            // Skip empty targets
            if target.is_empty() {
                return None;
            }

            Some(WikiLink {
                target,
                heading: cap.get(2).map(|m| m.as_str().trim().to_string()),
                display_text: cap.get(3).map(|m| m.as_str().trim().to_string()),
                start: full_match.start(),
                end: full_match.end(),
                raw: full_match.as_str().to_string(),
            })
        })
        .collect()
}

/// Parse links from content - Tauri command
#[tauri::command]
fn parse_links(content: String) -> ParsedLinks {
    let links = parse_wiki_links(&content);
    let referenced_notes: Vec<String> = links
        .iter()
        .map(|l| l.target.clone())
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();

    ParsedLinks {
        links,
        referenced_notes,
    }
}

/// Get backlinks for a note - Tauri command
#[tauri::command]
fn get_backlinks(vault_path: String, note_name: String) -> FsResult<Vec<BacklinkInfo>> {
    let vault = PathBuf::from(&vault_path);

    if !vault.exists() {
        return FsResult::ok(vec![]);
    }

    let target_name = note_name.to_lowercase();
    let mut backlinks: Vec<BacklinkInfo> = Vec::new();

    // Recursive function to scan all markdown files
    fn scan_for_backlinks(
        dir: &PathBuf,
        target_name: &str,
        backlinks: &mut Vec<BacklinkInfo>,
    ) {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let entry_path = entry.path();

                // Skip hidden files/folders
                if entry_path.file_name().map_or(true, |n| is_hidden(n)) {
                    continue;
                }

                if entry_path.is_dir() {
                    scan_for_backlinks(&entry_path, target_name, backlinks);
                } else if entry_path.extension().map_or(false, |ext| ext == "md") {
                    // Skip the note itself (by name)
                    let file_stem = entry_path
                        .file_stem()
                        .map(|s| s.to_string_lossy().to_string())
                        .unwrap_or_default();

                    if file_stem.to_lowercase() == target_name {
                        continue;
                    }

                    // Read and parse the file
                    if let Ok(content) = fs::read_to_string(&entry_path) {
                        let links = parse_wiki_links(&content);
                        let matching_links: Vec<WikiLink> = links
                            .into_iter()
                            .filter(|l| {
                                // Match by note name (strip folder path if present)
                                let link_target = l.target.rsplit('/').next().unwrap_or(&l.target);
                                link_target.to_lowercase() == target_name.to_lowercase()
                            })
                            .collect();

                        if !matching_links.is_empty() {
                            backlinks.push(BacklinkInfo {
                                source_path: entry_path.to_string_lossy().to_string(),
                                source_name: file_stem,
                                links: matching_links,
                            });
                        }
                    }
                }
            }
        }
    }

    scan_for_backlinks(&vault, &target_name, &mut backlinks);
    FsResult::ok(backlinks)
}

/// Resolve a wiki link target to a file path - Tauri command
#[tauri::command]
fn resolve_wiki_link(vault_path: String, target: String) -> FsResult<Option<String>> {
    let vault = PathBuf::from(&vault_path);

    // Parse folder path from target if present (e.g., "folder/note")
    let (folder, note_name) = if target.contains('/') {
        let parts: Vec<&str> = target.rsplitn(2, '/').collect();
        if parts.len() == 2 {
            (Some(parts[1].to_string()), parts[0].to_string())
        } else {
            (None, parts[0].to_string())
        }
    } else {
        (None, target.clone())
    };

    // If folder specified, try exact path first
    if let Some(folder_path) = &folder {
        let exact_path = vault.join(folder_path).join(format!("{}.md", note_name));
        if exact_path.exists() {
            return FsResult::ok(Some(exact_path.to_string_lossy().to_string()));
        }
    }

    // Try exact match at vault root
    let exact_path = vault.join(format!("{}.md", note_name));
    if exact_path.exists() {
        return FsResult::ok(Some(exact_path.to_string_lossy().to_string()));
    }

    // Recursive search function
    fn find_note_recursive(dir: &PathBuf, target_name: &str) -> Option<PathBuf> {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();

                // Skip hidden files/folders
                if path.file_name().map_or(true, |n| is_hidden(n)) {
                    continue;
                }

                if path.is_dir() {
                    if let Some(found) = find_note_recursive(&path, target_name) {
                        return Some(found);
                    }
                } else if path.extension().map_or(false, |ext| ext == "md") {
                    if let Some(stem) = path.file_stem() {
                        if stem.to_string_lossy().to_lowercase() == target_name.to_lowercase() {
                            return Some(path);
                        }
                    }
                }
            }
        }
        None
    }

    // Fall back to recursive search
    let result = find_note_recursive(&vault, &note_name);
    FsResult::ok(result.map(|p| p.to_string_lossy().to_string()))
}

/// Get the configuration file path
fn get_config_path(app_handle: &tauri::AppHandle) -> std::io::Result<PathBuf> {
    let config_dir = app_handle.path().app_data_dir()
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?;
    Ok(config_dir.join("config.json"))
}

/// Save configuration to disk
fn save_config(app_handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let state = app_handle.state::<AppState>();
    let config = AppConfig {
        current_vault: state.current_vault.lock().unwrap().clone(),
        recent_vaults: state.recent_vaults.lock().unwrap().clone(),
        open_notes_per_vault: state.open_notes_per_vault.lock().unwrap().clone(),
        active_note_per_vault: state.active_note_per_vault.lock().unwrap().clone(),
        last_note_per_vault: state.last_note_per_vault.lock().unwrap().clone(),
        last_open_directory: state.last_open_directory.lock().unwrap().clone(),
    };

    let config_path = get_config_path(app_handle)?;

    // Ensure config directory exists
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent)?;
    }

    fs::write(
        &config_path,
        serde_json::to_string_pretty(&config)?
    )?;
    Ok(())
}

/// Load configuration from disk
fn load_config(app_handle: &tauri::AppHandle) -> AppConfig {
    let config_path = match get_config_path(app_handle) {
        Ok(path) => path,
        Err(_) => return AppConfig::default(),
    };

    if !config_path.exists() {
        return AppConfig::default();
    }

    match fs::read_to_string(&config_path) {
        Ok(content) => {
            serde_json::from_str(&content).unwrap_or_else(|_| AppConfig::default())
        }
        Err(_) => AppConfig::default(),
    }
}

/// App state for storing current vault and recent vaults
pub struct AppState {
    pub current_vault: Mutex<Option<String>>,
    pub open_vaults: Mutex<Vec<String>>,
    pub recent_vaults: Mutex<Vec<String>>,
    pub open_notes_per_vault: Mutex<HashMap<String, Vec<String>>>,
    pub active_note_per_vault: Mutex<HashMap<String, String>>,
    pub last_note_per_vault: Mutex<HashMap<String, String>>,  // Kept for migration
    pub last_open_directory: Mutex<Option<String>>,
}

impl Default for AppState {
    fn default() -> Self {
        AppState {
            current_vault: Mutex::new(None),
            open_vaults: Mutex::new(Vec::new()),
            recent_vaults: Mutex::new(Vec::new()),
            open_notes_per_vault: Mutex::new(HashMap::new()),
            active_note_per_vault: Mutex::new(HashMap::new()),
            last_note_per_vault: Mutex::new(HashMap::new()),
            last_open_directory: Mutex::new(None),
        }
    }
}

/// Get vault name from path
fn get_vault_name(path: &str) -> String {
    PathBuf::from(path)
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "Vault".to_string())
}

/// Count markdown files in a directory
fn count_notes(path: &PathBuf) -> usize {
    fs::read_dir(path)
        .map(|entries| {
            entries
                .filter_map(|e| e.ok())
                .filter(|e| e.path().extension().map_or(false, |ext| ext == "md"))
                .count()
        })
        .unwrap_or(0)
}

/// Count markdown files recursively in a directory
fn count_notes_recursive(path: &PathBuf) -> usize {
    let mut count = 0;
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            let entry_path = entry.path();
            if entry_path.is_dir() {
                count += count_notes_recursive(&entry_path);
            } else if entry_path.extension().map_or(false, |ext| ext == "md") {
                count += 1;
            }
        }
    }
    count
}

/// Get modified timestamp for a path
fn get_modified_time(path: &PathBuf) -> u64 {
    fs::metadata(path)
        .and_then(|m| m.modified())
        .map(|t| {
            t.duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0)
        })
        .unwrap_or(0)
}

/// Check if a file/folder name starts with a dot (hidden)
fn is_hidden(name: &std::ffi::OsStr) -> bool {
    name.to_string_lossy().starts_with('.')
}

/// Scan a directory recursively and return tree nodes
fn scan_directory_recursive(dir: &PathBuf, vault_root: &PathBuf) -> Vec<FileTreeNode> {
    let mut children = Vec::new();

    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return children,
    };

    // Collect and sort: folders first, then notes, both alphabetically
    let mut folders: Vec<PathBuf> = Vec::new();
    let mut notes: Vec<PathBuf> = Vec::new();

    for entry in entries.flatten() {
        let entry_path = entry.path();
        let file_name = entry_path.file_name();

        // Skip hidden files/folders (starting with .)
        if file_name.map_or(true, |n| is_hidden(n)) {
            continue;
        }

        if entry_path.is_dir() {
            folders.push(entry_path);
        } else if entry_path.extension().map_or(false, |ext| ext == "md") {
            notes.push(entry_path);
        }
    }

    // Sort alphabetically
    folders.sort_by(|a, b| {
        a.file_name()
            .unwrap_or_default()
            .cmp(&b.file_name().unwrap_or_default())
    });
    notes.sort_by(|a, b| {
        a.file_name()
            .unwrap_or_default()
            .cmp(&b.file_name().unwrap_or_default())
    });

    // Add folders first (recursively)
    for folder_path in folders {
        let sub_children = scan_directory_recursive(&folder_path, vault_root);
        let relative = folder_path
            .strip_prefix(vault_root)
            .unwrap_or(&folder_path)
            .to_string_lossy()
            .to_string();

        let modified = get_modified_time(&folder_path);
        let name = folder_path
            .file_name()
            .map(|s| s.to_string_lossy().to_string())
            .unwrap_or_default();

        children.push(FileTreeNode::Folder {
            name,
            path: relative,
            modified,
            children: sub_children,
        });
    }

    // Add notes
    for note_path in notes {
        let modified = get_modified_time(&note_path);
        let name = note_path
            .file_stem()
            .map(|s| s.to_string_lossy().to_string())
            .unwrap_or_default();
        let relative = note_path
            .strip_prefix(vault_root)
            .unwrap_or(&note_path)
            .to_string_lossy()
            .to_string();

        children.push(FileTreeNode::Note {
            name,
            path: note_path.to_string_lossy().to_string(),
            relative_path: relative,
            modified,
        });
    }

    children
}

/// Count notes in a tree
fn count_tree_notes(nodes: &[FileTreeNode]) -> usize {
    nodes.iter().map(|node| {
        match node {
            FileTreeNode::Note { .. } => 1,
            FileTreeNode::Folder { children, .. } => count_tree_notes(children),
        }
    }).sum()
}

/// Count folders in a tree
fn count_tree_folders(nodes: &[FileTreeNode]) -> usize {
    nodes.iter().map(|node| {
        match node {
            FileTreeNode::Note { .. } => 0,
            FileTreeNode::Folder { children, .. } => 1 + count_tree_folders(children),
        }
    }).sum()
}

/// Validate if a path is a valid vault directory
#[tauri::command]
fn validate_vault(path: String) -> FsResult<bool> {
    let path_buf = PathBuf::from(&path);

    if !path_buf.exists() {
        return FsResult::err("Path does not exist");
    }

    if !path_buf.is_dir() {
        return FsResult::err("Path is not a directory");
    }

    FsResult::ok(true)
}

/// Create a new vault at the specified path
#[tauri::command]
fn create_vault(path: String) -> FsResult<Vault> {
    let path_buf = PathBuf::from(&path);

    if path_buf.exists() {
        return FsResult::err("A folder already exists at this location");
    }

    match fs::create_dir_all(&path_buf) {
        Ok(()) => {
            let name = get_vault_name(&path);
            FsResult::ok(Vault {
                name,
                path,
                note_count: 0,
                last_opened: current_timestamp(),
            })
        }
        Err(e) => FsResult::err(&format!("Failed to create vault: {}", e)),
    }
}

/// Get vault information
#[tauri::command]
fn get_vault_info(path: String) -> FsResult<Vault> {
    let path_buf = PathBuf::from(&path);

    if !path_buf.exists() {
        return FsResult::err("Vault does not exist");
    }

    let name = get_vault_name(&path);
    let note_count = count_notes(&path_buf);

    FsResult::ok(Vault {
        name,
        path,
        note_count,
        last_opened: current_timestamp(),
    })
}

/// Get current timestamp in seconds
fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

/// Get the default vault directory path
#[tauri::command]
fn get_vault_path(app_handle: tauri::AppHandle) -> FsResult<String> {
    match app_handle.path().app_data_dir() {
        Ok(path) => {
            let vault_path = path.join("vault");
            FsResult::ok(vault_path.to_string_lossy().to_string())
        }
        Err(e) => FsResult::err(&format!("Failed to get app data dir: {}", e)),
    }
}

/// Initialize vault directory if it doesn't exist
#[tauri::command]
fn init_vault(app_handle: tauri::AppHandle) -> FsResult<String> {
    match app_handle.path().app_data_dir() {
        Ok(path) => {
            let vault_path = path.join("vault");
            if !vault_path.exists() {
                if let Err(e) = fs::create_dir_all(&vault_path) {
                    return FsResult::err(&format!("Failed to create vault: {}", e));
                }
            }
            FsResult::ok(vault_path.to_string_lossy().to_string())
        }
        Err(e) => FsResult::err(&format!("Failed to get app data dir: {}", e)),
    }
}

/// Set the current vault
#[tauri::command]
fn set_current_vault(app_handle: tauri::AppHandle, path: String) -> FsResult<Vault> {
    let state = app_handle.state::<AppState>();

    // Validate the vault
    let path_buf = PathBuf::from(&path);
    if !path_buf.exists() || !path_buf.is_dir() {
        return FsResult::err("Invalid vault path");
    }

    // Update current vault
    if let Ok(mut current) = state.current_vault.lock() {
        *current = Some(path.clone());
    }

    // Add to open vaults
    if let Ok(mut open) = state.open_vaults.lock() {
        // Remove if already exists
        open.retain(|p| p != &path);
        // Add to front
        open.insert(0, path.clone());
    }

    // Add to recent vaults
    if let Ok(mut recent) = state.recent_vaults.lock() {
        // Remove if already exists
        recent.retain(|p| p != &path);
        // Add to front
        recent.insert(0, path.clone());
        // Keep only last 10
        recent.truncate(10);
    }

    // Save configuration
    let _ = save_config(&app_handle);

    let name = get_vault_name(&path);
    let note_count = count_notes(&path_buf);

    FsResult::ok(Vault {
        name,
        path,
        note_count,
        last_opened: current_timestamp(),
    })
}

/// Get the current vault
#[tauri::command]
fn get_current_vault(app_handle: tauri::AppHandle) -> FsResult<Option<Vault>> {
    let state = app_handle.state::<AppState>();

    if let Ok(current) = state.current_vault.lock() {
        if let Some(path) = current.as_ref() {
            let path_buf = PathBuf::from(path);

            // Check if vault still exists
            if !path_buf.exists() {
                // Clear the invalid current vault
                drop(current);
                if let Ok(mut current) = state.current_vault.lock() {
                    *current = None;
                }
                return FsResult::ok(None);
            }

            let name = get_vault_name(path);
            let note_count = count_notes(&path_buf);

            return FsResult::ok(Some(Vault {
                name,
                path: path.clone(),
                note_count,
                last_opened: current_timestamp(),
            }));
        }
    }

    FsResult::ok(None)
}

/// List recent vaults
#[tauri::command]
fn list_recent_vaults(app_handle: tauri::AppHandle) -> FsResult<Vec<Vault>> {
    let state = app_handle.state::<AppState>();

    let recent_paths: Vec<String> = match state.recent_vaults.lock() {
        Ok(recent) => recent.clone(),
        Err(_) => return FsResult::ok(vec![]),
    };

    let vaults: Vec<Vault> = recent_paths
        .iter()
        .filter_map(|path| {
            let path_buf = PathBuf::from(path);
            if path_buf.exists() {
                let name = get_vault_name(path);
                let note_count = count_notes(&path_buf);
                Some(Vault {
                    name,
                    path: path.clone(),
                    note_count,
                    last_opened: 0,
                })
            } else {
                None
            }
        })
        .collect();

    FsResult::ok(vaults)
}

/// Remove a vault from recent list
#[tauri::command]
fn remove_recent_vault(app_handle: tauri::AppHandle, path: String) -> FsResult<()> {
    let state = app_handle.state::<AppState>();

    if let Ok(mut recent) = state.recent_vaults.lock() {
        recent.retain(|p| p != &path);
    }

    // Save configuration
    let _ = save_config(&app_handle);

    FsResult::ok(())
}

/// Get the last opened directory path
#[tauri::command]
fn get_last_open_directory(app_handle: tauri::AppHandle) -> FsResult<Option<String>> {
    let state = app_handle.state::<AppState>();

    if let Ok(last_dir) = state.last_open_directory.lock() {
        return FsResult::ok(last_dir.clone());
    }

    FsResult::ok(None)
}

/// Set the last opened directory path
#[tauri::command]
fn set_last_open_directory(app_handle: tauri::AppHandle, path: String) -> FsResult<()> {
    let state = app_handle.state::<AppState>();

    if let Ok(mut last_dir) = state.last_open_directory.lock() {
        *last_dir = Some(path);
    }

    // Save configuration
    let _ = save_config(&app_handle);

    FsResult::ok(())
}

/// Get all open vaults
#[tauri::command]
fn get_open_vaults(app_handle: tauri::AppHandle) -> FsResult<Vec<Vault>> {
    let state = app_handle.state::<AppState>();

    let open_paths: Vec<String> = match state.open_vaults.lock() {
        Ok(open) => open.clone(),
        Err(_) => return FsResult::ok(vec![]),
    };

    let vaults: Vec<Vault> = open_paths
        .iter()
        .filter_map(|path| {
            let path_buf = PathBuf::from(path);
            if path_buf.exists() {
                let name = get_vault_name(path);
                let note_count = count_notes(&path_buf);
                Some(Vault {
                    name,
                    path: path.clone(),
                    note_count,
                    last_opened: current_timestamp(),
                })
            } else {
                None
            }
        })
        .collect();

    FsResult::ok(vaults)
}

/// Add a vault to open vaults list
#[tauri::command]
fn add_open_vault(app_handle: tauri::AppHandle, path: String) -> FsResult<()> {
    let state = app_handle.state::<AppState>();

    if let Ok(mut open) = state.open_vaults.lock() {
        // Remove if already exists to avoid duplicates
        open.retain(|p| p != &path);
        // Add to front
        open.insert(0, path);
    }

    FsResult::ok(())
}

/// Remove a vault from open vaults list (but keep in history)
#[tauri::command]
fn remove_open_vault(app_handle: tauri::AppHandle, path: String) -> FsResult<()> {
    let state = app_handle.state::<AppState>();

    if let Ok(mut open) = state.open_vaults.lock() {
        open.retain(|p| p != &path);
    }

    FsResult::ok(())
}

/// Get the last opened note for a specific vault
#[tauri::command]
fn get_last_note(app_handle: tauri::AppHandle, vault_path: String) -> FsResult<Option<String>> {
    let state = app_handle.state::<AppState>();

    if let Ok(last_notes) = state.last_note_per_vault.lock() {
        let note_path = last_notes.get(&vault_path).cloned();
        return FsResult::ok(note_path);
    }

    FsResult::ok(None)
}

/// Set the last opened note for a specific vault
#[tauri::command]
fn set_last_note(app_handle: tauri::AppHandle, vault_path: String, note_path: String) -> FsResult<()> {
    let state = app_handle.state::<AppState>();

    if let Ok(mut last_notes) = state.last_note_per_vault.lock() {
        last_notes.insert(vault_path, note_path);
    }

    // Save configuration
    let _ = save_config(&app_handle);

    FsResult::ok(())
}

/// Get open notes for a specific vault
#[tauri::command]
fn get_open_notes(app_handle: tauri::AppHandle, vault_path: String) -> FsResult<Vec<String>> {
    let state = app_handle.state::<AppState>();

    if let Ok(open_notes) = state.open_notes_per_vault.lock() {
        let notes = open_notes.get(&vault_path).cloned().unwrap_or_default();
        return FsResult::ok(notes);
    }

    FsResult::ok(vec![])
}

/// Set open notes for a specific vault
#[tauri::command]
fn set_open_notes(app_handle: tauri::AppHandle, vault_path: String, note_paths: Vec<String>) -> FsResult<()> {
    let state = app_handle.state::<AppState>();

    if let Ok(mut open_notes) = state.open_notes_per_vault.lock() {
        open_notes.insert(vault_path, note_paths);
    }

    // Save configuration
    let _ = save_config(&app_handle);

    FsResult::ok(())
}

/// Add an open note to a vault's open notes list
#[tauri::command]
fn add_open_note(app_handle: tauri::AppHandle, vault_path: String, note_path: String) -> FsResult<()> {
    let state = app_handle.state::<AppState>();

    if let Ok(mut open_notes) = state.open_notes_per_vault.lock() {
        let notes = open_notes.entry(vault_path.clone()).or_insert_with(Vec::new);
        // Remove if already exists to avoid duplicates
        notes.retain(|p| p != &note_path);
        // Add to end
        notes.push(note_path);
    }

    // Save configuration
    let _ = save_config(&app_handle);

    FsResult::ok(())
}

/// Remove an open note from a vault's open notes list
#[tauri::command]
fn remove_open_note(app_handle: tauri::AppHandle, vault_path: String, note_path: String) -> FsResult<()> {
    let state = app_handle.state::<AppState>();

    if let Ok(mut open_notes) = state.open_notes_per_vault.lock() {
        if let Some(notes) = open_notes.get_mut(&vault_path) {
            notes.retain(|p| p != &note_path);
        }
    }

    // Save configuration
    let _ = save_config(&app_handle);

    FsResult::ok(())
}

/// Get the active note for a specific vault
#[tauri::command]
fn get_active_note(app_handle: tauri::AppHandle, vault_path: String) -> FsResult<Option<String>> {
    let state = app_handle.state::<AppState>();

    if let Ok(active_notes) = state.active_note_per_vault.lock() {
        let note_path = active_notes.get(&vault_path).cloned();
        return FsResult::ok(note_path);
    }

    FsResult::ok(None)
}

/// Set the active note for a specific vault
#[tauri::command]
fn set_active_note(app_handle: tauri::AppHandle, vault_path: String, note_path: String) -> FsResult<()> {
    let state = app_handle.state::<AppState>();

    if let Ok(mut active_notes) = state.active_note_per_vault.lock() {
        active_notes.insert(vault_path, note_path);
    }

    // Save configuration
    let _ = save_config(&app_handle);

    FsResult::ok(())
}

/// List all notes in the vault
#[tauri::command]
fn list_notes(vault_path: String) -> FsResult<Vec<NoteMeta>> {
    let path = PathBuf::from(&vault_path);

    if !path.exists() {
        return FsResult::ok(vec![]);
    }

    let mut notes = Vec::new();

    match fs::read_dir(&path) {
        Ok(entries) => {
            for entry in entries.flatten() {
                let entry_path = entry.path();
                if entry_path.extension().map_or(false, |ext| ext == "md") {
                    if let Ok(metadata) = entry.metadata() {
                        let modified = metadata
                            .modified()
                            .map(|t| {
                                t.duration_since(std::time::UNIX_EPOCH)
                                    .map(|d| d.as_secs())
                                    .unwrap_or(0)
                            })
                            .unwrap_or(0);

                        let file_stem = entry_path
                            .file_stem()
                            .map(|s| s.to_string_lossy().to_string())
                            .unwrap_or_default();

                        notes.push(NoteMeta {
                            name: file_stem,
                            path: entry_path.to_string_lossy().to_string(),
                            modified,
                        });
                    }
                }
            }

            // Sort by modified time (newest first)
            notes.sort_by(|a, b| b.modified.cmp(&a.modified));
            FsResult::ok(notes)
        }
        Err(e) => FsResult::err(&format!("Failed to read vault: {}", e)),
    }
}

/// List all notes and folders in the vault as a tree structure
#[tauri::command]
fn list_file_tree(vault_path: String) -> FsResult<FileTree> {
    let path = PathBuf::from(&vault_path);

    if !path.exists() {
        return FsResult::ok(FileTree {
            vault_path,
            root: vec![],
            total_notes: 0,
            total_folders: 0,
        });
    }

    let root = scan_directory_recursive(&path, &path);
    let total_notes = count_tree_notes(&root);
    let total_folders = count_tree_folders(&root);

    FsResult::ok(FileTree {
        vault_path,
        root,
        total_notes,
        total_folders,
    })
}

/// Create a new folder
#[tauri::command]
fn create_folder(vault_path: String, folder_path: String) -> FsResult<String> {
    // folder_path is relative to vault root (e.g., "Projects/Work")
    let full_path = PathBuf::from(&vault_path).join(&folder_path);

    if full_path.exists() {
        return FsResult::err("Folder already exists");
    }

    match fs::create_dir_all(&full_path) {
        Ok(()) => FsResult::ok(full_path.to_string_lossy().to_string()),
        Err(e) => FsResult::err(&format!("Failed to create folder: {}", e)),
    }
}

/// Read a note by path
#[tauri::command]
fn read_note(path: String) -> FsResult<Note> {
    let path_buf = PathBuf::from(&path);

    if !path_buf.exists() {
        return FsResult::err("Note not found");
    }

    match fs::read_to_string(&path_buf) {
        Ok(content) => {
            let metadata = fs::metadata(&path_buf).ok();
            let modified = metadata
                .and_then(|m| m.modified().ok())
                .map(|t| {
                    t.duration_since(std::time::UNIX_EPOCH)
                        .map(|d| d.as_secs())
                        .unwrap_or(0)
                })
                .unwrap_or(0);

            let name = path_buf
                .file_stem()
                .map(|s| s.to_string_lossy().to_string())
                .unwrap_or_default();

            FsResult::ok(Note {
                name,
                path,
                content,
                modified,
            })
        }
        Err(e) => FsResult::err(&format!("Failed to read note: {}", e)),
    }
}

/// Create or update a note
#[tauri::command]
fn write_note(vault_path: String, name: String, content: String, folder: Option<String>) -> FsResult<Note> {
    // Determine target directory
    let target_dir = if let Some(folder_path) = &folder {
        PathBuf::from(&vault_path).join(folder_path)
    } else {
        PathBuf::from(&vault_path)
    };

    let path = target_dir.join(format!("{}.md", name));

    // Ensure target directory exists
    if !target_dir.exists() {
        if let Err(e) = fs::create_dir_all(&target_dir) {
            return FsResult::err(&format!("Failed to create directory: {}", e));
        }
    }

    match fs::write(&path, &content) {
        Ok(()) => {
            let modified = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0);

            FsResult::ok(Note {
                name,
                path: path.to_string_lossy().to_string(),
                content,
                modified,
            })
        }
        Err(e) => FsResult::err(&format!("Failed to write note: {}", e)),
    }
}

/// Delete a note
#[tauri::command]
fn delete_note(path: String) -> FsResult<()> {
    let path_buf = PathBuf::from(&path);

    if !path_buf.exists() {
        return FsResult::err("Note not found");
    }

    match fs::remove_file(&path_buf) {
        Ok(()) => FsResult::ok(()),
        Err(e) => FsResult::err(&format!("Failed to delete note: {}", e)),
    }
}

/// Rename a note
#[tauri::command]
fn rename_note(path: String, new_name: String) -> FsResult<Note> {
    let old_path = PathBuf::from(&path);

    if !old_path.exists() {
        return FsResult::err("Note not found");
    }

    let vault_path = old_path.parent().unwrap_or(&old_path);
    let new_path = vault_path.join(format!("{}.md", new_name));

    if new_path.exists() {
        return FsResult::err("A note with this name already exists");
    }

    match fs::rename(&old_path, &new_path) {
        Ok(()) => {
            let content = fs::read_to_string(&new_path).unwrap_or_default();
            let modified = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0);

            FsResult::ok(Note {
                name: new_name,
                path: new_path.to_string_lossy().to_string(),
                content,
                modified,
            })
        }
        Err(e) => FsResult::err(&format!("Failed to rename note: {}", e)),
    }
}

/// List all custom themes in the themes directory
#[tauri::command]
fn list_custom_themes(app_handle: tauri::AppHandle) -> FsResult<Vec<Theme>> {
    let themes_dir = match get_themes_dir(&app_handle) {
        Ok(dir) => dir,
        Err(e) => return FsResult::err(&format!("Failed to get themes directory: {}", e)),
    };

    if !themes_dir.exists() {
        return FsResult::ok(vec![]);
    }

    let mut themes = Vec::new();

    if let Ok(entries) = fs::read_dir(&themes_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map_or(false, |ext| ext == "json") {
                if let Ok(content) = fs::read_to_string(&path) {
                    if let Ok(theme) = serde_json::from_str::<Theme>(&content) {
                        themes.push(theme);
                    }
                }
            }
        }
    }

    // Sort alphabetically by name
    themes.sort_by(|a, b| a.name.cmp(&b.name));

    FsResult::ok(themes)
}

/// Import a theme from a file path
#[tauri::command]
fn import_theme(app_handle: tauri::AppHandle, file_path: String) -> FsResult<Theme> {
    let source_path = PathBuf::from(&file_path);

    if !source_path.exists() {
        return FsResult::err("Theme file does not exist");
    }

    // Read and parse the theme file
    let content = match fs::read_to_string(&source_path) {
        Ok(c) => c,
        Err(e) => return FsResult::err(&format!("Failed to read theme file: {}", e)),
    };

    let theme: Theme = match serde_json::from_str(&content) {
        Ok(t) => t,
        Err(e) => return FsResult::err(&format!("Invalid theme file format: {}", e)),
    };

    // Validate theme has required fields
    if theme.name.is_empty() {
        return FsResult::err("Theme must have a name");
    }

    // Ensure themes directory exists
    let themes_dir = match get_themes_dir(&app_handle) {
        Ok(dir) => dir,
        Err(e) => return FsResult::err(&format!("Failed to get themes directory: {}", e)),
    };

    if let Err(e) = fs::create_dir_all(&themes_dir) {
        return FsResult::err(&format!("Failed to create themes directory: {}", e));
    }

    // Create a safe filename from the theme name
    let safe_name: String = theme.name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '-' })
        .collect();
    let dest_path = themes_dir.join(format!("{}.json", safe_name));

    // Write the theme to the themes directory
    match fs::write(&dest_path, &content) {
        Ok(()) => FsResult::ok(theme),
        Err(e) => FsResult::err(&format!("Failed to save theme: {}", e)),
    }
}

/// Export a theme to a file path
#[tauri::command]
fn export_theme(theme: Theme, file_path: String) -> FsResult<()> {
    let dest_path = PathBuf::from(&file_path);

    // Ensure parent directory exists
    if let Some(parent) = dest_path.parent() {
        if let Err(e) = fs::create_dir_all(parent) {
            return FsResult::err(&format!("Failed to create directory: {}", e));
        }
    }

    // Serialize and write the theme
    match serde_json::to_string_pretty(&theme) {
        Ok(json) => {
            match fs::write(&dest_path, json) {
                Ok(()) => FsResult::ok(()),
                Err(e) => FsResult::err(&format!("Failed to write theme file: {}", e)),
            }
        }
        Err(e) => FsResult::err(&format!("Failed to serialize theme: {}", e)),
    }
}

/// Delete a custom theme file
#[tauri::command]
fn delete_custom_theme(app_handle: tauri::AppHandle, theme_name: String) -> FsResult<()> {
    let themes_dir = match get_themes_dir(&app_handle) {
        Ok(dir) => dir,
        Err(e) => return FsResult::err(&format!("Failed to get themes directory: {}", e)),
    };

    // Find the theme file by reading and matching names
    if !themes_dir.exists() {
        return FsResult::err("Themes directory does not exist");
    }

    let mut found_path: Option<PathBuf> = None;

    if let Ok(entries) = fs::read_dir(&themes_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map_or(false, |ext| ext == "json") {
                if let Ok(content) = fs::read_to_string(&path) {
                    if let Ok(theme) = serde_json::from_str::<Theme>(&content) {
                        if theme.name == theme_name {
                            found_path = Some(path);
                            break;
                        }
                    }
                }
            }
        }
    }

    match found_path {
        Some(path) => {
            match fs::remove_file(&path) {
                Ok(()) => FsResult::ok(()),
                Err(e) => FsResult::err(&format!("Failed to delete theme: {}", e)),
            }
        }
        None => FsResult::err("Theme not found"),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState::default())
        .setup(|app| {
            // Load configuration from disk
            let config = load_config(app.handle());

            // Restore state from config
            let state = app.state::<AppState>();
            let current_vault_path = config.current_vault.clone();

            if let Ok(mut current) = state.current_vault.lock() {
                *current = current_vault_path.clone();
            }
            // Only restore the current vault to open vaults, not all open vaults
            if let Ok(mut open) = state.open_vaults.lock() {
                open.clear();
                // Only add current vault to open vaults if it exists
                if let Some(ref current_path) = current_vault_path {
                    open.insert(0, current_path.clone());
                }
            }
            if let Ok(mut recent) = state.recent_vaults.lock() {
                *recent = config.recent_vaults;
            }
            if let Ok(mut open_notes) = state.open_notes_per_vault.lock() {
                *open_notes = config.open_notes_per_vault;
            }
            if let Ok(mut active_notes) = state.active_note_per_vault.lock() {
                *active_notes = config.active_note_per_vault;
            }
            if let Ok(mut last_notes) = state.last_note_per_vault.lock() {
                *last_notes = config.last_note_per_vault;
            }
            if let Ok(mut last_dir) = state.last_open_directory.lock() {
                *last_dir = config.last_open_directory;
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Vault management
            validate_vault,
            create_vault,
            get_vault_info,
            set_current_vault,
            get_current_vault,
            list_recent_vaults,
            remove_recent_vault,
            // Multi-vault support
            get_open_vaults,
            add_open_vault,
            remove_open_vault,
            get_last_note,
            set_last_note,
            // Multi-note support
            get_open_notes,
            set_open_notes,
            add_open_note,
            remove_open_note,
            get_active_note,
            set_active_note,
            // Directory persistence
            get_last_open_directory,
            set_last_open_directory,
            // Legacy/compat
            get_vault_path,
            init_vault,
            // Note operations
            list_notes,
            list_file_tree,
            create_folder,
            read_note,
            write_note,
            delete_note,
            rename_note,
            // Wiki links
            parse_links,
            get_backlinks,
            resolve_wiki_link,
            // Theme management
            list_custom_themes,
            import_theme,
            export_theme,
            delete_custom_theme
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
