"use client"

interface ToolbarProps {
  onExportHtml: () => void
  onExportPdf: () => void
  onToggleTheme: () => void
  onClear: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  isDarkMode: boolean
  wordCount: number
  characterCount: number
  onToggleFullscreen: () => void
  isFullscreen: boolean
}

export default function Toolbar({
  onExportHtml,
  onExportPdf,
  onToggleTheme,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isDarkMode,
  wordCount,
  characterCount,
  onToggleFullscreen,
  isFullscreen,
}: ToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 border-b border-slate-700 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Undo/Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 text-slate-300 hover:text-white"
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 text-slate-300 hover:text-white"
          title="Redo (Ctrl+Y)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
            />
          </svg>
        </button>

        <div className="w-px h-6 bg-slate-700 dark:bg-slate-700 mx-1" />

        {/* Clear */}
        <button
          onClick={onClear}
          className="p-2 rounded-lg hover:bg-red-500/20 dark:hover:bg-red-500/20 transition-all duration-200 text-slate-300 hover:text-red-400"
          title="Clear all content"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      <div className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
        <span className="text-slate-200 dark:text-slate-300">{wordCount}</span> words ·{" "}
        <span className="text-slate-200 dark:text-slate-300">{characterCount}</span> chars
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-700 transition-all duration-200 text-slate-300 hover:text-white"
          title={`${isFullscreen ? "Exit" : "Enter"} fullscreen`}
        >
          {isFullscreen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          )}
        </button>

        <div className="w-px h-6 bg-slate-700 dark:bg-slate-700 mx-1" />

        {/* Export buttons - hidden on mobile, shown on sm+ */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-2">
          <button
            onClick={onExportHtml}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200 hover:text-white"
          >
            HTML
          </button>

          <button
            onClick={onExportPdf}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200 hover:text-white"
          >
            PDF
          </button>

          <div className="w-px h-6 bg-slate-700 dark:bg-slate-700 mx-1" />
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-700 transition-all duration-200 text-slate-300 hover:text-white"
          title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
