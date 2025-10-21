"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

interface FileItem {
  id: string
  name: string
  content: string
  lastModified: Date
  isActive: boolean
}

interface FileManagerProps {
  files: FileItem[]
  activeFileId: string | null
  onFileSelect: (fileId: string) => void
  onFileCreate: (name: string) => void
  onFileDelete: (fileId: string) => void
  onFileRename: (fileId: string, newName: string) => void
  onFileSave: (fileId: string, content: string) => void
  className?: string
}

export default function FileManager({
  files,
  activeFileId,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
  onFileSave,
  className = "",
}: FileManagerProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const newFileInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showNewFileDialog && newFileInputRef.current) {
      newFileInputRef.current.focus()
    }
  }, [showNewFileDialog])

  useEffect(() => {
    if (editingFileId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingFileId])

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onFileCreate(newFileName.trim())
      setNewFileName("")
      setShowNewFileDialog(false)
    }
  }

  const handleRenameStart = (fileId: string, currentName: string) => {
    setEditingFileId(fileId)
    setEditingName(currentName)
  }

  const handleRenameComplete = () => {
    if (editingFileId && editingName.trim()) {
      onFileRename(editingFileId, editingName.trim())
    }
    setEditingFileId(null)
    setEditingName("")
  }

  const handleRenameCancel = () => {
    setEditingFileId(null)
    setEditingName("")
  }

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter") {
      action()
    } else if (event.key === "Escape") {
      setShowNewFileDialog(false)
      setEditingFileId(null)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div
      className={`bg-slate-900 dark:bg-slate-950 border-r border-slate-800 dark:border-slate-900 flex flex-col h-full ${className}`}
    >
      <div className="px-4 py-3 border-b border-slate-800 dark:border-slate-900">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-200 dark:text-slate-300">Files</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowNewFileDialog(true)}
              className="p-1.5 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-800 transition-all duration-200 text-slate-400 hover:text-slate-200"
              title="New file"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-800 transition-all duration-200 text-slate-400 hover:text-slate-200"
              title={isOpen ? "Collapse" : "Expand"}
            >
              <svg
                className={`w-4 h-4 transform transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showNewFileDialog && (
        <div className="px-4 py-3 border-b border-slate-800 dark:border-slate-900 bg-slate-800/50">
          <input
            ref={newFileInputRef}
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleCreateFile)}
            placeholder="Enter file name..."
            className="w-full px-3 py-2 text-sm border border-slate-700 dark:border-slate-700 rounded-lg bg-slate-800 dark:bg-slate-800 text-slate-100 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setShowNewFileDialog(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFile}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="flex-1 overflow-y-auto">
          {files.length === 0 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-600 text-sm">
              No files yet. Create your first file!
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                    file.id === activeFileId
                      ? "bg-blue-600/20 border border-blue-500/30 text-blue-300"
                      : "hover:bg-slate-800 dark:hover:bg-slate-800 text-slate-400"
                  }`}
                  onClick={() => onFileSelect(file.id)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <svg
                      className="w-4 h-4 flex-shrink-0 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {editingFileId === file.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, handleRenameComplete)}
                        onBlur={handleRenameComplete}
                        className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded bg-slate-800 dark:bg-slate-800 text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{file.name}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-700">
                          {formatDate(file.lastModified)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {editingFileId !== file.id && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRenameStart(file.id, file.name)
                          }}
                          className="p-1 rounded hover:bg-slate-700 dark:hover:bg-slate-700 transition-all duration-200 text-slate-500 hover:text-slate-300"
                          title="Rename"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`Delete "${file.name}"?`)) {
                              onFileDelete(file.id)
                            }
                          }}
                          className="p-1 rounded hover:bg-red-500/20 dark:hover:bg-red-500/20 transition-all duration-200 text-slate-500 hover:text-red-400"
                          title="Delete"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
