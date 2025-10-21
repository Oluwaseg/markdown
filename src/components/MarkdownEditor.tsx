"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  onCursorChange: (position: { line: number; column: number }) => void
  className?: string
  searchQuery?: string
  caseSensitive?: boolean
  wholeWord?: boolean
}

export default function MarkdownEditor({ 
  value, 
  onChange, 
  onCursorChange, 
  className = "",
  searchQuery = "",
  caseSensitive = false,
  wholeWord = false
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 })

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  // Focus textarea when value changes to empty (after clear)
  useEffect(() => {
    if (value === "" && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [value])

  // Function to get highlighted text with search matches
  const getHighlightedText = () => {
    if (!searchQuery.trim()) return value

    const searchText = caseSensitive ? searchQuery : searchQuery.toLowerCase()
    const contentText = caseSensitive ? value : value.toLowerCase()
    
    let regex: RegExp
    if (wholeWord) {
      regex = new RegExp(`\\b${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, caseSensitive ? 'g' : 'gi')
    } else {
      regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi')
    }

    return value.replace(regex, (match) => `<mark class="bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white px-0.5 rounded">${match}</mark>`)
  }

  const handleCursorMove = () => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const textBeforeCursor = value.substring(0, start)
    const lines = textBeforeCursor.split("\n")
    const line = Math.max(0, lines.length - 1)
    const column = Math.max(0, lines[lines.length - 1]?.length || 0)

    const newPosition = { line, column }
    setCursorPosition(newPosition)
    onCursorChange(newPosition)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Tab key for indentation
    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + "  " + value.substring(end)

      onChange(newValue)

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
        handleCursorMove()
      }, 0)
    }
  }

  useEffect(() => {
    handleCursorMove()
  }, [value])

  return (
    <div className={`relative ${className}`}>
      {/* Highlighted text overlay */}
      {searchQuery.trim() && (
        <div 
          className="absolute inset-0 p-6 pl-16 font-mono text-sm leading-relaxed text-transparent pointer-events-none z-10 overflow-hidden"
          style={{ 
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            tabSize: 2
          }}
          dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
        />
      )}
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={handleCursorMove}
        onClick={handleCursorMove}
        onKeyUp={handleCursorMove}
        placeholder="Start typing your Markdown here..."
        className="w-full h-full p-6 pl-16 font-mono text-sm border-none outline-none resize-none bg-transparent leading-relaxed text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 relative z-20"
        style={{ tabSize: 2 }}
      />

      {/* Line numbers */}
      <div className="absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col items-center text-xs text-slate-500 dark:text-slate-400 py-6 select-none font-mono font-medium z-30">
        {value.split("\n").map((_, index) => (
          <div
            key={index}
            className="leading-relaxed h-6 flex items-center justify-center hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            {index + 1}
          </div>
        ))}
      </div>

      {/* Cursor position indicator */}
      <div className="absolute bottom-3 right-3 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 font-mono font-medium shadow-sm z-30">
        Ln {cursorPosition.line + 1}, Col {cursorPosition.column + 1}
      </div>
    </div>
  )
}
