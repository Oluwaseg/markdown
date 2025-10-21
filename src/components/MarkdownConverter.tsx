"use client"




import React, { useState, useEffect, useCallback, useRef } from 'react';

import MarkdownEditor from './MarkdownEditor';

import MarkdownPreview from './MarkdownPreview';

import Toolbar from './Toolbar';

import FindReplace from './FindReplace';

import FileManager from './FileManager';

import { convertMarkdown, exportToHtml, exportToPdf, CursorPosition } from '../lib/convertMarkdown';

import { countWords, countCharacters, debounce } from '../lib/utils';

import { useKeyboardShortcuts, markdownShortcuts } from '../hooks/useKeyboardShortcuts';

import { useScrollSyncPercentage } from '../hooks/useScrollSync';

interface HistoryItem {
  content: string
  timestamp: number
}

interface FileItem {
  id: string
  name: string
  content: string
  lastModified: Date
  isActive: boolean
}

export default function MarkdownConverter() {
  const [activePanel, setActivePanel] = useState<"editor" | "preview">("editor")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [showFileManager, setShowFileManager] = useState(true)
  const [files, setFiles] = useState<FileItem[]>([])
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchCaseSensitive, setSearchCaseSensitive] = useState(false)
  const [searchWholeWord, setSearchWholeWord] = useState(false)

  // Refs for scroll sync
  const editorRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Converter

This is a **live preview** Markdown editor with the following features:

## Features
- *Real-time* preview
- ~~Syntax highlighting~~ Code highlighting
- Export to HTML and PDF
- Undo/Redo functionality
- Dark/Light theme toggle
- Cursor tracking

### Code Example
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

### Lists
- Unordered list item 1
- Unordered list item 2
  - Nested item
  - Another nested item

1. Ordered list item 1
2. Ordered list item 2
3. Ordered list item 3

### Links and Images
[Visit GitHub](https://github.com)
![Markdown Logo](https://markdown-here.com/img/icon256.png)

### Blockquotes
> This is a blockquote. It can contain multiple lines
> and will be properly formatted.

### Tables
| Feature | Status |
|---------|--------|
| Headers | ✅ |
| Bold | ✅ |
| Italic | ✅ |
| Code | ✅ |

### Inline Code
Use \`console.log()\` to debug your JavaScript.

---
Start editing this text to see the live preview!`)

  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ line: 0, column: 0 })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([{ content: markdown, timestamp: Date.now() }])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [previewResult, setPreviewResult] = useState(convertMarkdown(markdown))

  // Initialize with a default file
  useEffect(() => {
    if (files.length === 0) {
      const defaultFile: FileItem = {
        id: "default",
        name: "Untitled.md",
        content: markdown,
        lastModified: new Date(),
        isActive: true,
      }
      setFiles([defaultFile])
      setActiveFileId("default")
    }
  }, [markdown, files.length])

  // Scroll sync between editor and preview
  useScrollSyncPercentage(
    editorRef as React.RefObject<HTMLElement | null>,
    previewRef as React.RefObject<HTMLElement | null>,
    { enabled: !isFullscreen },
  )

  // Keyboard shortcuts
  const insertText = useCallback((text: string) => {
    // This will be implemented to insert text at cursor position
    console.log("Insert text:", text)
  }, [])

  const shortcuts = [
    markdownShortcuts.bold(insertText),
    markdownShortcuts.italic(insertText),
    markdownShortcuts.link(insertText),
    markdownShortcuts.image(insertText),
    markdownShortcuts.codeBlock(insertText),
    markdownShortcuts.header(insertText),
    markdownShortcuts.quote(insertText),
    markdownShortcuts.list(insertText),
    markdownShortcuts.numberedList(insertText),
    markdownShortcuts.table(insertText),
    {
      key: "f",
      ctrlKey: true,
      action: () => setShowFindReplace(!showFindReplace),
    },
    {
      key: "n",
      ctrlKey: true,
      action: () => {
        const newFile: FileItem = {
          id: Date.now().toString(),
          name: `Untitled ${files.length + 1}.md`,
          content: "",
          lastModified: new Date(),
          isActive: false,
        }
        setFiles((prev) => [...prev, newFile])
        setActiveFileId(newFile.id)
        setMarkdown("")
      },
    },
  ]

  useKeyboardShortcuts(shortcuts)

  // Update preview when markdown changes
  useEffect(() => {
    const result = convertMarkdown(markdown, cursorPosition)
    setPreviewResult(result)
  }, [markdown, cursorPosition])

  // Update word and character count
  useEffect(() => {
    setWordCount(countWords(markdown))
    setCharacterCount(countCharacters(markdown))
  }, [markdown])

  // Handle cursor position changes
  const handleCursorChange = useCallback((position: CursorPosition) => {
    setCursorPosition(position)
  }, [])

  // Handle markdown changes with --history
  const handleMarkdownChange = useCallback(
    (newMarkdown: string) => {
      setMarkdown(newMarkdown)

      // Add to history if content actually changed
      const currentItem = history[historyIndex]
      if (currentItem && currentItem.content !== newMarkdown) {
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push({ content: newMarkdown, timestamp: Date.now() })

        // Limit history to 50 items
        if (newHistory.length > 50) {
          newHistory.shift()
        } else {
          setHistoryIndex(newHistory.length - 1)
        }

        setHistory(newHistory)
      }
    },
    [history, historyIndex],
  )

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setMarkdown(history[newIndex].content)
    }
  }, [history, historyIndex])

  // Redo functionality
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setMarkdown(history[newIndex].content)
    }
  }, [history, historyIndex])

  // Clear content
  const handleClear = useCallback(() => {
    if (confirm("Are you sure you want to clear all content?")) {
      setMarkdown("")
      setHistory([{ content: "", timestamp: Date.now() }])
      setHistoryIndex(0)
      
      // Update the active file content as well
      if (activeFileId) {
        setFiles(prev => prev.map(f => 
          f.id === activeFileId 
            ? { ...f, content: "", lastModified: new Date() }
            : f
        ))
      }
    }
  }, [activeFileId])

  // Export functions
  const handleExportHtml = useCallback(() => {
    exportToHtml(previewResult.html, "Markdown Document")
  }, [previewResult.html])

  const handleExportPdf = useCallback(() => {
    exportToPdf(previewResult.html, "Markdown Document")
  }, [previewResult.html])

  // Theme toggle
  const handleToggleTheme = useCallback(() => {
    setIsDarkMode(!isDarkMode)
  }, [isDarkMode])

  // Fullscreen toggle
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  // File management functions
  const handleFileSelect = useCallback(
    (fileId: string) => {
      const file = files.find((f) => f.id === fileId)
      if (file) {
        setMarkdown(file.content)
        setActiveFileId(fileId)
      }
    },
    [files],
  )

  const handleFileCreate = useCallback((name: string) => {
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: name.endsWith(".md") ? name : `${name}.md`,
      content: "",
      lastModified: new Date(),
      isActive: false,
    }
    setFiles((prev) => [...prev, newFile])
    setActiveFileId(newFile.id)
    setMarkdown("")
  }, [])

  const handleFileDelete = useCallback(
    (fileId: string) => {
      setFiles((prev) => {
        const filtered = prev.filter((f) => f.id !== fileId)
        if (activeFileId === fileId) {
          if (filtered.length > 0) {
            setActiveFileId(filtered[0].id)
            setMarkdown(filtered[0].content)
          } else {
            setActiveFileId(null)
            setMarkdown("")
          }
        }
        return filtered
      })
    },
    [activeFileId],
  )

  const handleFileRename = useCallback((fileId: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? { ...f, name: newName.endsWith(".md") ? newName : `${newName}.md`, lastModified: new Date() }
          : f,
      ),
    )
  }, [])

  const handleFileSave = useCallback((fileId: string, content: string) => {
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, content, lastModified: new Date() } : f)))
  }, [])

  // Find & Replace functions
  const handleFind = useCallback((query: string, caseSensitive: boolean, wholeWord: boolean) => {
    if (!query.trim()) return
    
    // Update search state for highlighting
    setSearchQuery(query)
    setSearchCaseSensitive(caseSensitive)
    setSearchWholeWord(wholeWord)
    
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (!textarea) return

    const text = textarea.value
    const searchText = caseSensitive ? query : query.toLowerCase()
    const contentText = caseSensitive ? text : text.toLowerCase()
    
    let searchIndex = -1
    if (wholeWord) {
      const regex = new RegExp(`\\b${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, caseSensitive ? 'g' : 'gi')
      const match = regex.exec(contentText)
      searchIndex = match ? match.index : -1
    } else {
      searchIndex = contentText.indexOf(searchText)
    }
    
    if (searchIndex !== -1) {
      textarea.focus()
      textarea.setSelectionRange(searchIndex, searchIndex + query.length)
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  const handleReplace = useCallback(
    (query: string, replacement: string, caseSensitive: boolean, wholeWord: boolean) => {
      if (!query.trim()) return
      
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      if (!textarea) return

      const text = textarea.value
      const searchText = caseSensitive ? query : query.toLowerCase()
      const contentText = caseSensitive ? text : text.toLowerCase()
      
      let searchIndex = -1
      if (wholeWord) {
        const regex = new RegExp(`\\b${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, caseSensitive ? 'g' : 'gi')
        const match = regex.exec(contentText)
        searchIndex = match ? match.index : -1
      } else {
        searchIndex = contentText.indexOf(searchText)
      }
      
      if (searchIndex !== -1) {
        const newText = text.substring(0, searchIndex) + replacement + text.substring(searchIndex + query.length)
        setMarkdown(newText)
        textarea.focus()
        textarea.setSelectionRange(searchIndex, searchIndex + replacement.length)
      }
    },
    [setMarkdown],
  )

  const handleReplaceAll = useCallback(
    (query: string, replacement: string, caseSensitive: boolean, wholeWord: boolean) => {
      if (!query.trim()) return
      
      const text = markdown
      let newText = text
      
      if (wholeWord) {
        const regex = new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, caseSensitive ? 'g' : 'gi')
        newText = text.replace(regex, replacement)
      } else {
        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi')
        newText = text.replace(regex, replacement)
      }
      
      if (newText !== text) {
        setMarkdown(newText)
      }
    },
    [markdown, setMarkdown],
  )

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return (
    <div
      className={`${isFullscreen ? "fixed inset-0 z-50" : "h-screen"} flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950`}
    >
      <Toolbar
        onExportHtml={handleExportHtml}
        onExportPdf={handleExportPdf}
        onToggleTheme={handleToggleTheme}
        onClear={handleClear}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        isDarkMode={isDarkMode}
        wordCount={wordCount}
        characterCount={characterCount}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
      />

      <div className="flex flex-1 overflow-hidden relative gap-0">
        {/* File Manager Sidebar */}
        {showFileManager && !isFullscreen && (
          <FileManager
            files={files}
            activeFileId={activeFileId}
            onFileSelect={handleFileSelect}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
            onFileRename={handleFileRename}
            onFileSave={handleFileSave}
            className="w-64 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
          />
        )}

        {/* Find & Replace Panel */}
        {showFindReplace && (
          <FindReplace
            isOpen={showFindReplace}
            onClose={() => {
              setShowFindReplace(false)
              setSearchQuery("")
            }}
            onFind={handleFind}
            onReplace={handleReplace}
            onReplaceAll={handleReplaceAll}
            className="top-16"
          />
        )}

        {/* Desktop Layout */}
        <div className="hidden md:flex flex-1 overflow-hidden w-full">
          {/* Editor Panel */}
          <div className="flex-1 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-900">
            <div className="px-6 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-wide">✏️ Editor</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Live editing</span>
            </div>
            <div className="flex-1 overflow-hidden" ref={editorRef}>
              <MarkdownEditor
                value={markdown}
                onChange={handleMarkdownChange}
                onCursorChange={handleCursorChange}
                className="h-full"
                searchQuery={searchQuery}
                caseSensitive={searchCaseSensitive}
                wholeWord={searchWholeWord}
              />
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
            <div className="px-6 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-wide">👁️ Preview</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-time</span>
            </div>
            <div className="flex-1 overflow-hidden" ref={previewRef}>
              <MarkdownPreview
                html={previewResult.html}
                cursorPosition={previewResult.cursorPosition}
                warnings={previewResult.warnings}
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col flex-1 overflow-hidden w-full">
          {/* Panel Toggle */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <button
              onClick={() => setActivePanel("editor")}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                activePanel === "editor"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              ✏️ Editor
            </button>
            <button
              onClick={() => setActivePanel("preview")}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                activePanel === "preview"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              👁️ Preview
            </button>
          </div>

          {/* Active Panel Content */}
          <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900">
            {activePanel === "editor" ? (
              <div ref={editorRef} className="h-full">
                <MarkdownEditor
                  value={markdown}
                  onChange={handleMarkdownChange}
                  onCursorChange={handleCursorChange}
                  className="h-full"
                  searchQuery={searchQuery}
                  caseSensitive={searchCaseSensitive}
                  wholeWord={searchWholeWord}
                />
              </div>
            ) : (
              <div ref={previewRef} className="h-full">
                <MarkdownPreview
                  html={previewResult.html}
                  cursorPosition={previewResult.cursorPosition}
                  warnings={previewResult.warnings}
                  className="h-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
