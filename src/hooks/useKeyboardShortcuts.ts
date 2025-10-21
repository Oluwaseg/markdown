import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const pressedKey = event.key.toLowerCase();
    
    for (const shortcut of shortcuts) {
      const keyMatches = pressedKey === shortcut.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const altMatches = !!shortcut.altKey === event.altKey;
      const metaMatches = !!shortcut.metaKey === event.metaKey;
      
      if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Common keyboard shortcuts for Markdown editing
export const markdownShortcuts = {
  bold: (insertText: (text: string) => void) => ({
    key: 'b',
    ctrlKey: true,
    action: () => insertText('**bold text**')
  }),
  italic: (insertText: (text: string) => void) => ({
    key: 'i',
    ctrlKey: true,
    action: () => insertText('*italic text*')
  }),
  link: (insertText: (text: string) => void) => ({
    key: 'k',
    ctrlKey: true,
    action: () => insertText('[link text](url)')
  }),
  image: (insertText: (text: string) => void) => ({
    key: 'k',
    ctrlKey: true,
    shiftKey: true,
    action: () => insertText('![alt text](image-url)')
  }),
  codeBlock: (insertText: (text: string) => void) => ({
    key: '`',
    ctrlKey: true,
    action: () => insertText('```\ncode here\n```')
  }),
  header: (insertText: (text: string) => void) => ({
    key: 'h',
    ctrlKey: true,
    action: () => insertText('# Header')
  }),
  quote: (insertText: (text: string) => void) => ({
    key: 'q',
    ctrlKey: true,
    action: () => insertText('> Quote text')
  }),
  list: (insertText: (text: string) => void) => ({
    key: 'l',
    ctrlKey: true,
    action: () => insertText('- List item')
  }),
  numberedList: (insertText: (text: string) => void) => ({
    key: 'l',
    ctrlKey: true,
    shiftKey: true,
    action: () => insertText('1. Numbered item')
  }),
  table: (insertText: (text: string) => void) => ({
    key: 't',
    ctrlKey: true,
    action: () => insertText('| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |')
  })
};
