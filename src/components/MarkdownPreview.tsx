"use client"

import { useEffect, useRef, useState } from "react"

interface MarkdownPreviewProps {
  html: string
  cursorPosition?: number
  warnings: string[]
  className?: string
}

export default function MarkdownPreview({ html, cursorPosition, warnings, className = "" }: MarkdownPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [processedHtml, setProcessedHtml] = useState("")

  // Process HTML to extract and highlight code blocks
  useEffect(() => {
    const processHtml = async () => {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")
      const codeBlocks = doc.querySelectorAll("pre code")

      // For now, just use the original HTML
      // In a more advanced implementation, we could replace code blocks with SyntaxHighlighter components
      setProcessedHtml(html)
    }

    processHtml()
  }, [html])

  useEffect(() => {
    // Scroll to cursor position if provided
    if (cursorPosition && cursorRef.current && previewRef.current) {
      const previewRect = previewRef.current.getBoundingClientRect()
      const cursorRect = cursorRef.current.getBoundingClientRect()

      if (cursorRect.top < previewRect.top || cursorRect.bottom > previewRect.bottom) {
        cursorRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }, [cursorPosition])

  return (
    <div className={`relative ${className}`}>
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="m-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg shadow-sm">
          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-3 flex items-center gap-2">
            <span>⚠️</span> Syntax Warnings
          </h4>
          <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-2">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview content */}
      <div
        ref={previewRef}
        className="prose prose-sm max-w-none dark:prose-invert p-6 overflow-auto h-full prose-headings:font-semibold prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-slate-900 dark:prose-strong:text-slate-100"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
        style={{
          lineHeight: "1.7",
        }}
      />

      {/* Cursor indicator */}
      {cursorPosition !== undefined && (
        <div
          ref={cursorRef}
          className="absolute w-0.5 h-5 bg-gradient-to-b from-blue-500 to-blue-400 animate-pulse pointer-events-none shadow-lg"
          style={{
            left: `${cursorPosition}px`,
            top: "0px",
            zIndex: 10,
          }}
        />
      )}

      {/* Custom styles for better preview */}
      <style jsx>{`
        .prose pre {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.25rem;
          overflow-x: auto;
          font-size: 0.875rem;
          line-height: 1.6;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .dark .prose pre {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-color: #334155;
        }
        
        .prose code:not(pre code) {
          background: #f1f5f9;
          color: #0f172a;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.875em;
          font-weight: 500;
          border: 1px solid #e2e8f0;
        }
        
        .dark .prose code:not(pre code) {
          background: #1e293b;
          color: #e2e8f0;
          border-color: #334155;
        }
        
        .prose blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.25rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #475569;
          background: #f8fafc;
          padding: 1rem 1.25rem;
          border-radius: 0.5rem;
        }
        
        .dark .prose blockquote {
          background: #1e293b;
          color: #cbd5e1;
          border-left-color: #60a5fa;
        }
        
        .prose table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5rem 0;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow: hidden;
        }
        
        .prose th,
        .prose td {
          border: 1px solid #e2e8f0;
          padding: 0.75rem 1rem;
          text-align: left;
        }
        
        .prose th {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          font-weight: 600;
          color: #0f172a;
        }
        
        .dark .prose th {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #e2e8f0;
          border-color: #334155;
        }
        
        .dark .prose td {
          border-color: #334155;
        }
        
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .prose h1 {
          font-size: 2rem;
          font-weight: 700;
        }
        
        .prose h2 {
          font-size: 1.5rem;
          font-weight: 700;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }
        
        .dark .prose h2 {
          border-bottom-color: #334155;
        }
        
        .prose ul, .prose ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        
        .prose li {
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  )
}
