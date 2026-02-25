import { useState, useEffect, useCallback, useRef } from "react";
import { confirm } from "@tauri-apps/plugin-dialog";
import type { WikiLink, ParsedLinks, BacklinkInfo } from "../types/note";
import * as notesApi from "../lib/notes";

interface WikiLinksCallbacks {
  onOpenNote: (notePath: string) => void;
  onCreateNote: (noteName: string) => void;
}

export function useWikiLinks(
  vaultPath: string | null,
  currentNoteName: string | null,
  content: string,
  callbacks: WikiLinksCallbacks
) {
  const [outgoingLinks, setOutgoingLinks] = useState<WikiLink[]>([]);
  const [referencedNotes, setReferencedNotes] = useState<string[]>([]);
  const [backlinks, setBacklinks] = useState<BacklinkInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbacksRef = useRef(callbacks);

  // Keep callbacks ref updated
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Parse links from content (debounced)
  const parseContentLinks = useCallback((text: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (!text) {
        setOutgoingLinks([]);
        setReferencedNotes([]);
        return;
      }

      try {
        const result: ParsedLinks = await notesApi.parseLinks(text);
        setOutgoingLinks(result.links);
        setReferencedNotes(result.referenced_notes);
      } catch (error) {
        console.error("Failed to parse links:", error);
        setOutgoingLinks([]);
        setReferencedNotes([]);
      }
    }, 300);
  }, []);

  // Load backlinks for current note
  const loadBacklinks = useCallback(async (vault: string, noteName: string) => {
    setIsLoading(true);
    try {
      const result = await notesApi.getBacklinks(vault, noteName);
      if (result.success && result.data) {
        setBacklinks(result.data);
      } else {
        setBacklinks([]);
      }
    } catch (error) {
      console.error("Failed to load backlinks:", error);
      setBacklinks([]);
    }
    setIsLoading(false);
  }, []);

  // Navigate to a wiki link target
  const navigateToLink = useCallback(
    async (link: WikiLink) => {
      if (!vaultPath) return;

      try {
        const result = await notesApi.resolveWikiLink(vaultPath, link.target);
        if (result.success && result.data) {
          // Note exists - open it
          callbacksRef.current.onOpenNote(result.data);
        } else {
          // Note doesn't exist - prompt to create using Tauri dialog
          const shouldCreate = await confirm(
            `Note "${link.target}" does not exist. Create it?`,
            {
              title: "Create Note",
              okLabel: "Create",
              cancelLabel: "Cancel",
            }
          );
          if (shouldCreate) {
            // User confirmed - create the note
            callbacksRef.current.onCreateNote(link.target);
          }
          // If user cancelled, do nothing
        }
      } catch (error) {
        console.error("Failed to resolve wiki link:", error);
      }
    },
    [vaultPath]
  );

  // Parse links when content changes
  useEffect(() => {
    parseContentLinks(content);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [content, parseContentLinks]);

  // Load backlinks when note changes
  useEffect(() => {
    // Clear backlinks immediately when note changes
    setBacklinks([]);

    if (vaultPath && currentNoteName) {
      loadBacklinks(vaultPath, currentNoteName);
    }
  }, [vaultPath, currentNoteName, loadBacklinks]);

  return {
    outgoingLinks,
    referencedNotes,
    backlinks,
    isLoading,
    parseContentLinks,
    loadBacklinks,
    navigateToLink,
  };
}
