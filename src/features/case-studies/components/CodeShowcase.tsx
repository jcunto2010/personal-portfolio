import React, { useMemo } from 'react'

export type CodeShowcaseLanguage = 'dart' | 'typescript' | 'text'

export interface CodeShowcaseProps {
  code: string
  language?: CodeShowcaseLanguage
  title?: string
  caption?: string
  highlightLines?: number[]
}

const DART_KEYWORDS = /\b(import|void|class|extends|final|const|async|await|return|if|else|for|in|true|false|null|static|super|this|get|set|part|of|with|abstract|implements|typedef)\b/g
const TS_KEYWORDS = /\b(import|export|from|const|let|var|function|return|async|await|type|interface|class|extends|implements|if|else|for|of|in|true|false|null|undefined|void)\b/g
const STRING_DOUBLE = /("(?:[^"\\]|\\.)*")/g
const STRING_SINGLE = /('(?:[^'\\]|\\.)*')/g
const COMMENT_SINGLE = /(\/\/.*$)/gm
function tokenizeDart(line: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  const combined = new RegExp(
    [DART_KEYWORDS.source, STRING_DOUBLE.source, STRING_SINGLE.source, COMMENT_SINGLE.source].join('|'),
    'g'
  )
  let m
  while ((m = combined.exec(line)) !== null) {
    if (m.index > lastIndex) {
      parts.push(<span key={lastIndex}>{line.slice(lastIndex, m.index)}</span>)
    }
    const token = m[0]
    if (/\b(import|void|class|extends|final|const|async|await|return|if|else|for|in|true|false|null|static|super|this|get|set|part|of|with|abstract|implements|typedef)\b/.test(token)) {
      parts.push(<span key={m.index} className="text-cyan-400">{token}</span>)
    } else if (token.startsWith('"') || token.startsWith("'")) {
      parts.push(<span key={m.index} className="text-amber-300">{token}</span>)
    } else if (token.startsWith('//')) {
      parts.push(<span key={m.index} className="text-gray-500">{token}</span>)
    } else {
      parts.push(<span key={m.index}>{token}</span>)
    }
    lastIndex = m.index + token.length
  }
  if (lastIndex < line.length) {
    parts.push(<span key={lastIndex}>{line.slice(lastIndex)}</span>)
  }
  return parts.length ? parts : [line]
}

function tokenizeTypeScript(line: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  const combined = new RegExp(
    [TS_KEYWORDS.source, STRING_DOUBLE.source, STRING_SINGLE.source, COMMENT_SINGLE.source].join('|'),
    'g'
  )
  let m
  while ((m = combined.exec(line)) !== null) {
    if (m.index > lastIndex) {
      parts.push(<span key={lastIndex}>{line.slice(lastIndex, m.index)}</span>)
    }
    const token = m[0]
    if (/\b(import|export|from|const|let|var|function|return|async|await|type|interface|class|extends|implements|if|else|for|of|in|true|false|null|undefined|void)\b/.test(token)) {
      parts.push(<span key={m.index} className="text-cyan-400">{token}</span>)
    } else if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) {
      parts.push(<span key={m.index} className="text-amber-300">{token}</span>)
    } else if (token.startsWith('//')) {
      parts.push(<span key={m.index} className="text-gray-500">{token}</span>)
    } else {
      parts.push(<span key={m.index}>{token}</span>)
    }
    lastIndex = m.index + token.length
  }
  if (lastIndex < line.length) {
    parts.push(<span key={lastIndex}>{line.slice(lastIndex)}</span>)
  }
  return parts.length ? parts : [line]
}

export const CodeShowcase: React.FC<CodeShowcaseProps> = ({
  code,
  language = 'text',
  title,
  caption,
  highlightLines = [],
}) => {
  const lines = useMemo(() => code.trimEnd().split('\n'), [code])

  const highlightSet = useMemo(() => new Set(highlightLines), [highlightLines])

  const tokenize = language === 'dart' ? tokenizeDart : language === 'typescript' ? tokenizeTypeScript : (l: string) => [l]

  return (
    <div className="font-mono text-sm">
      {title && (
        <div className="mb-2 font-heading font-semibold text-white">
          {title}
        </div>
      )}
      {caption && (
        <p className="mb-3 text-gray-400 font-body text-sm">
          {caption}
        </p>
      )}
      <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 px-4 py-4 backdrop-blur-sm">
        <code className="block text-gray-300">
          {lines.map((line, i) => {
            const lineNum = i + 1
            const isHighlight = highlightSet.has(lineNum)
            return (
              <div
                key={i}
                className={`flex gap-4 py-0.5 ${isHighlight ? 'border-l-2 border-primary-500 bg-white/10 pl-3 -ml-1' : ''}`}
              >
                <span className="select-none text-gray-600 w-6 shrink-0 text-right">{lineNum}</span>
                <span>{language !== 'text' ? tokenize(line) : line}</span>
              </div>
            )
          })}
        </code>
      </pre>
    </div>
  )
}
