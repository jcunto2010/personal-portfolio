'use client'

import { useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import { Copy, Check, FileCode } from 'lucide-react'
import { cn } from '../../lib/utils'

interface CodeFile {
  filename: string
  language: string
  code: string
}

interface CodeSnippetProps {
  files: CodeFile[]
  className?: string
  /** When true, the snippet container grows with content (no max-height). Desktop use. */
  autoHeight?: boolean
}

export function CodeSnippet({ files, className, autoHeight = false }: CodeSnippetProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [copied, setCopied] = useState(false)

  const activeFile = files[activeIndex]

  const handleCopy = async () => {
    if (!navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(activeFile.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  // Map languages to prism-supported ones
  const getPrismLanguage = (lang: string): string => {
    const normalized = lang.toLowerCase()
    // Dart is not natively supported by prism-react-renderer's default subset
    // Use 'clike' (C-like) which works for many languages including Dart-like syntax
    if (normalized === 'dart') return 'clike'
    if (normalized === 'typescript' || normalized === 'ts') return 'typescript'
    if (normalized === 'javascript' || normalized === 'js') return 'javascript'
    return normalized
  }

  return (
    <div
      className={cn(
        'w-full rounded-xl border border-white/15 bg-[#0a0f1c]/80 backdrop-blur-xl overflow-hidden shadow-2xl',
        className
      )}
    >
      {/* Header with tabs and copy button */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#050914] px-3 py-2">
        {/* Tabs */}
        <div 
          className="flex items-center gap-1 overflow-x-auto"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {files.map((file, index) => (
            <button
              key={file.filename}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'group flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200',
                activeIndex === index
                  ? 'bg-violet-500/20 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)] border border-violet-400/30'
                  : 'bg-black/40 text-slate-300 border border-white/5 hover:bg-white/10 hover:text-white hover:border-white/15'
              )}
            >
              <FileCode className={cn(
                'h-3.5 w-3.5 transition-colors',
                activeIndex === index ? 'text-violet-300' : 'text-slate-500 group-hover:text-slate-300'
              )} />
              <span className="whitespace-nowrap">{file.filename}</span>
            </button>
          ))}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200',
            copied
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
          )}
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Code content - scrollable area */}
      <div 
        className="relative"
        style={{
          maxHeight: autoHeight ? undefined : '320px',
          overflowX: 'auto',
          overflowY: autoHeight ? 'hidden' : 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <Highlight 
          theme={themes.nightOwl} 
          code={activeFile.code.trim()} 
          language={getPrismLanguage(activeFile.language)}
        >
          {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={cn(highlightClassName, 'm-0 p-4 text-[11px] leading-5 sm:text-xs sm:leading-6')}
              style={{
                ...style,
                background: 'transparent',
                margin: 0,
                padding: '1rem',
                minWidth: '100%',
                width: 'max-content',
                fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
              }}
            >
              {tokens.map((line, i) => {
                const lineProps = getLineProps({ line, key: i })
                return (
                  <div key={i} {...lineProps} style={{ display: 'flex' }}>
                    {/* Line number */}
                    <span 
                      className="select-none pr-4 text-right text-slate-600/60"
                      style={{ minWidth: '2rem', flexShrink: 0 }}
                    >
                      {i + 1}
                    </span>
                    {/* Code line */}
                    <span style={{ flex: 1 }}>
                      {line.map((token, key) => {
                        const tokenProps = getTokenProps({ token, key })
                        return <span key={key} {...tokenProps} />
                      })}
                    </span>
                  </div>
                )
              })}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  )
}

// Utility for single file usage
interface SingleCodeSnippetProps {
  code: string
  language?: string
  filename?: string
  className?: string
}

export function SingleCodeSnippet({
  code,
  language = 'typescript',
  filename = 'snippet.ts',
  className,
}: SingleCodeSnippetProps) {
  return <CodeSnippet files={[{ filename, language, code }]} className={className} />
}
