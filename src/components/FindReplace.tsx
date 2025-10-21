"use client"

import { useState, useEffect, useRef } from "react"

interface FindReplaceProps {
  isOpen: boolean
  onClose: () => void
  onFind: (query: string, caseSensitive: boolean, wholeWord: boolean) => void
  onReplace: (query: string, replacement: string, caseSensitive: boolean, wholeWord: boolean) => void
  onReplaceAll: (query: string, replacement: string, caseSensitive: boolean, wholeWord: boolean) => void
  className?: string
}

export default function FindReplace({
  isOpen,
  onClose,
  onFind,
  onReplace,
  onReplaceAll,
  className = "",
}: FindReplaceProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [replaceQuery, setReplaceQuery] = useState("")
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [isReplaceMode, setIsReplaceMode] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      } else if (event.ctrlKey && event.key === "f") {
        event.preventDefault()
        setIsReplaceMode(false)
      } else if (event.ctrlKey && event.shiftKey && event.key === "F") {
        event.preventDefault()
        setIsReplaceMode(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const handleFind = () => {
    if (searchQuery.trim()) {
      onFind(searchQuery, caseSensitive, wholeWord)
    }
  }

  const handleReplace = () => {
    if (searchQuery.trim()) {
      onReplace(searchQuery, replaceQuery, caseSensitive, wholeWord)
    }
  }

  const handleReplaceAll = () => {
    if (searchQuery.trim()) {
      onReplaceAll(searchQuery, replaceQuery, caseSensitive, wholeWord)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed bottom-0 right-0 sm:absolute sm:top-0 sm:right-0 w-full sm:w-96 bg-slate-900 dark:bg-slate-950 border-t sm:border-t-0 sm:border-l border-slate-800 dark:border-slate-800 shadow-2xl z-20 ${className}`}
    >
      <div className="p-4 sm:p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200 dark:text-slate-300">
            {isReplaceMode ? "Find & Replace" : "Find"}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsReplaceMode(!isReplaceMode)}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              {isReplaceMode ? "Find Only" : "Replace"}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-800 transition-all duration-200 text-slate-400 hover:text-slate-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-1.5">Find</label>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (e.shiftKey) {
                    handleFind()
                  } else {
                    handleFind()
                  }
                }
              }}
              className="w-full px-3 py-2.5 text-sm border border-slate-700 dark:border-slate-700 rounded-lg bg-slate-800 dark:bg-slate-800 text-slate-100 dark:text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter search term..."
            />
          </div>

          {isReplaceMode && (
            <div>
              <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-1.5">Replace</label>
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleReplace()
                  }
                }}
                className="w-full px-3 py-2.5 text-sm border border-slate-700 dark:border-slate-700 rounded-lg bg-slate-800 dark:bg-slate-800 text-slate-100 dark:text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter replacement text..."
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Case sensitive</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={wholeWord}
                onChange={(e) => setWholeWord(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Whole word</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={handleFind}
              className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 active:scale-95"
            >
              Find
            </button>
            {isReplaceMode && (
              <>
                <button
                  onClick={handleReplace}
                  className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 active:scale-95"
                >
                  Replace
                </button>
                <button
                  onClick={handleReplaceAll}
                  className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 active:scale-95"
                >
                  Replace All
                </button>
              </>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-600 pt-3 border-t border-slate-800 dark:border-slate-800">
            <div className="font-medium text-slate-400 dark:text-slate-500 mb-2">Shortcuts:</div>
            <div className="space-y-1 text-slate-600 dark:text-slate-700">
              <div>Ctrl+F: Find</div>
              <div>Ctrl+Shift+F: Find & Replace</div>
              <div>Enter: Find next</div>
              <div>Shift+Enter: Find previous</div>
              <div>Esc: Close</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
