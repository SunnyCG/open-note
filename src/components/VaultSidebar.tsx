import { useState, useRef } from "react";
import type { Vault } from "../types/note";

interface VaultSidebarProps {
  openVaults: Vault[];
  recentVaults: Vault[];
  currentVault: Vault | null;
  onVaultClick: (path: string) => void;
  onVaultClose: (path: string) => void;
}

// Get the first character of the vault name (Chinese character or uppercase letter)
function getVaultInitial(name: string): string {
  if (!name || name.length === 0) return "?";

  const firstChar = name.charAt(0);

  // Check if it's a Chinese character (CJK Unified Ideographs range)
  const code = firstChar.charCodeAt(0);
  if (code >= 0x4e00 && code <= 0x9fff) {
    return firstChar;
  }

  // For non-Chinese, return uppercase first letter
  return firstChar.toUpperCase();
}

export function VaultSidebar({
  openVaults,
  recentVaults,
  currentVault,
  onVaultClick,
}: VaultSidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  // Filter recent vaults to exclude those already in open vaults
  const openPaths = new Set(openVaults.map((v) => v.path));
  const historyVaults = recentVaults.filter((v) => !openPaths.has(v.path));

  const handleSidebarMouseEnter = () => {
    setIsHovered(true);
  };

  const handleSidebarMouseLeave = () => {
    setIsHovered(false);
  };

  const renderVaultItem = (vault: Vault, isOpen: boolean) => {
    const isActive = currentVault?.path === vault.path;
    const initial = getVaultInitial(vault.name);

    return (
      <div
        key={vault.path}
        className={`
          relative w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer
          transition-all duration-150 text-sm font-semibold
          ${isActive
            ? "bg-accent-primary text-white"
            : isOpen
            ? "bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary"
            : "bg-bg-secondary text-text-muted hover:bg-bg-tertiary hover:text-text-secondary"
          }
        `}
        onClick={() => onVaultClick(vault.path)}
      >
        {initial}
      </div>
    );
  };

  // Get tooltip position based on sidebar position
  const getTooltipStyle = () => {
    if (!sidebarRef.current) return {};
    const rect = sidebarRef.current.getBoundingClientRect();
    return {
      left: rect.right + 8,
      top: rect.top + 8,
    };
  };

  return (
    <aside
      ref={sidebarRef}
      className="w-14 bg-bg-primary border-r border-border-default flex flex-col items-center py-3 gap-1"
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
    >
      {/* Open vaults */}
      {openVaults.map((vault) => renderVaultItem(vault, true))}

      {/* Separator line if both open and history vaults exist */}
      {openVaults.length > 0 && historyVaults.length > 0 && (
        <div className="w-8 h-0.5 bg-accent-primary my-2 rounded-full" />
      )}

      {/* History vaults */}
      {historyVaults.map((vault) => renderVaultItem(vault, false))}

      {/* Tooltip showing all vault names */}
      {isHovered && (openVaults.length > 0 || historyVaults.length > 0) && (
        <div
          className="fixed z-50 bg-bg-tertiary text-text-primary text-sm rounded-lg shadow-lg pointer-events-none py-2 min-w-[120px]"
          style={getTooltipStyle()}
        >
          {openVaults.length > 0 && (
            <div>
              <div className="px-3 py-1 text-xs text-text-muted uppercase tracking-wide">
                Open
              </div>
              {openVaults.map((vault) => (
                <div
                  key={vault.path}
                  className={`px-3 py-1 flex items-center gap-2 ${
                    currentVault?.path === vault.path ? "text-accent-primary" : ""
                  }`}
                >
                  <span className="w-4 text-center font-semibold">
                    {getVaultInitial(vault.name)}
                  </span>
                  <span>{vault.name}</span>
                </div>
              ))}
            </div>
          )}

          {openVaults.length > 0 && historyVaults.length > 0 && (
            <div className="h-px bg-border-default my-1 mx-3" />
          )}

          {historyVaults.length > 0 && (
            <div>
              <div className="px-3 py-1 text-xs text-text-muted uppercase tracking-wide">
                History
              </div>
              {historyVaults.map((vault) => (
                <div
                  key={vault.path}
                  className={`px-3 py-1 flex items-center gap-2 ${
                    currentVault?.path === vault.path ? "text-accent-primary" : ""
                  }`}
                >
                  <span className="w-4 text-center font-semibold">
                    {getVaultInitial(vault.name)}
                  </span>
                  <span>{vault.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
