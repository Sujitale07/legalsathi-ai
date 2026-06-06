'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type Message    = { id: string; role: string; content: string; createdAt: string }
type Conversation = { id: string; title: string; updatedAt: string }
type Document   = { id: string; title: string; status: string; _count: { chunks: number } }
type Source     = { documentId: string; documentTitle: string; chunkIndex: number; totalChunks: number }

const SUGGESTIONS = [
  'Tenant rights in Nepal',
  'Employment contract clauses',
  'Civil case filing steps',
]

// ─── Functional Icons ─────────────────────────────────────────────────────────

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const IconChat = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-60">
    <path d="M2 2h12v9H8l-4 3v-3H2V2z" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)

const IconDoc = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-60">
    <path d="M3 2h7l3 3v9H3V2z" stroke="currentColor" strokeWidth="1.2" />
    <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)

const IconSend = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M14 8l-12-5 2 5-2 5 12-5z" fill="currentColor" />
  </svg>
)

const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const IconCopy = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <rect x="5" y="5" width="8" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <path d="M3 11V3h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconLightning = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M9 2L3 9h5l-1 5 6-7H8l1-5z" fill="currentColor" />
  </svg>
)

const IconChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const IconChevronUp = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M3 10l5-5 5 5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

// ─── Thinking Indicator ───────────────────────────────────────────────────────

const ThinkingIndicator = () => (
  <div className="flex gap-1.5 py-1">
    {[0, 1, 2].map((i) => (
      <div key={i} className="w-1.5 h-1.5 rounded-full bg-app-text-subtle"
        style={{ animation: `dot-pulse 1s ease-in-out ${i * 0.2}s infinite` }}
      />
    ))}
  </div>
)

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadContent, setUploadContent] = useState('')
  const [uploading, setUploading] = useState(false)
  const [docsOpen, setDocsOpen] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [messageSources, setMessageSources] = useState<Record<string, Source[]>>({})
  const [messageSuggestions, setMessageSuggestions] = useState<Record<string, string[]>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const activeTextarea = useRef<HTMLTextAreaElement>(null)
  const heroTextarea = useRef<HTMLTextAreaElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const documentsRef = useRef<Document[]>([])
  useEffect(() => { documentsRef.current = documents })

  const activeTitle = conversations.find(c => c.id === activeId)?.title ?? 'New Chat'

  // ── Data ──────────────────────────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    const res = await fetch('/api/conversations')
    setConversations(await res.json())
  }, [])

  const loadDocuments = useCallback(async () => {
    const res = await fetch('/api/documents')
    setDocuments(await res.json())
  }, [])

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadConversations(), loadDocuments()])
    }
    init()
  }, [loadConversations, loadDocuments])

  // Poll processing documents every 3 s until they become ready or failed
  useEffect(() => {
    const processingIds = documents.filter(d => d.status === 'processing').map(d => d.id)
    if (processingIds.length === 0) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
      return
    }
    if (pollRef.current) return
    pollRef.current = setInterval(async () => {
      const current = documentsRef.current.filter(d => d.status === 'processing')
      if (!current.length) return
      const updates = await Promise.all(
        current.map(d => fetch(`/api/documents/${d.id}`).then(r => r.json()).catch(() => null))
      )
      setDocuments(prev => prev.map(d => {
        const u = updates.find((u): u is Document => !!u && u.id === d.id)
        return u ? { ...d, status: u.status } : d
      }))
    }, 3000)
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null } }
  }, [documents])

  // ── Actions ───────────────────────────────────────────────────────────────

  const selectConversation = useCallback(async (conv: Conversation) => {
    setActiveId(conv.id)
    setMessages([])
    const res = await fetch(`/api/conversations/${conv.id}`)
    const data = await res.json()
    setMessages(data.messages ?? [])
  }, [])

  const newConversation = useCallback(async () => {
    const res = await fetch('/api/conversations', { method: 'POST' })
    const conv = await res.json()
    setConversations((p) => [conv, ...p])
    setActiveId(conv.id)
    setMessages([])
    setTimeout(() => activeTextarea.current?.focus(), 60)
  }, [])

  const deleteConversation = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
    setConversations((p) => p.filter((c) => c.id !== id))
    if (activeId === id) { setActiveId(null); setMessages([]) }
  }, [activeId])

  const sendMessage = useCallback(async (override?: string) => {
    const text = (override ?? input).trim()
    if (!text || streaming) return

    let convId = activeId
    if (!convId) {
      const res = await fetch('/api/conversations', { method: 'POST' })
      const conv = await res.json()
      setConversations((p) => [conv, ...p])
      setActiveId(conv.id)
      convId = conv.id
    }

    setInput('')
    if (activeTextarea.current) activeTextarea.current.style.height = 'auto'
    if (heroTextarea.current) heroTextarea.current.style.height = 'auto'

    const aiId = `ai-${Date.now()}`
    setMessages((p) => [
      ...p,
      { id: `u-${Date.now()}`, role: 'user', content: text, createdAt: new Date().toISOString() },
      { id: aiId, role: 'assistant', content: '', createdAt: new Date().toISOString() },
    ])
    setStreaming(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId, message: text }),
      })
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          if (payload === '[DONE]') break
          try {
            const parsed = JSON.parse(payload)
            if (parsed.text) {
              setMessages(p => p.map(m => m.id === aiId ? { ...m, content: m.content + parsed.text } : m))
            } else if (parsed.sources) {
              setMessageSources(p => ({ ...p, [aiId]: parsed.sources }))
            } else if (parsed.suggestions) {
              setMessageSuggestions(p => ({ ...p, [aiId]: parsed.suggestions }))
            }
          } catch { /* skip malformed */ }
        }
      }
    } finally {
      setStreaming(false)
      loadConversations()
      // Re-fetch after a short delay to capture auto-title (generated async on server)
      setTimeout(() => loadConversations(), 3500)
    }
  }, [input, activeId, streaming, loadConversations])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'auto' }) }, [messages])

  const grow = useCallback((el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 300)}px`
  }, [])

  const onKey = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }, [sendMessage])

  const deleteDocument = useCallback(async (id: string) => {
    await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    setDocuments(p => p.filter(d => d.id !== id))
  }, [])

  const uploadDocument = useCallback(async () => {
    if (!uploadTitle.trim() || !uploadContent.trim()) return
    setUploading(true)
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: uploadTitle, content: uploadContent }),
      })
      const doc = await res.json()
      setDocuments(p => [{ ...doc, status: 'processing', _count: { chunks: 0 } }, ...p])
      setUploadTitle(''); setUploadContent('')
    } finally { setUploading(false) }
  }, [uploadTitle, uploadContent])

  const copyMessage = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-app-bg text-app-text font-sans">

      {/* ════════════════════ SIDEBAR (Navy) */}
      <aside className="w-64 shrink-0 flex flex-col" style={{ backgroundColor: '#1E2E4F' }}>

        {/* Brand */}
        <div className="h-14 px-5 flex items-center border-b" style={{ borderColor: '#2D4070' }}>
          <div className="w-8 h-8 rounded-sm flex items-center justify-center mr-3 shrink-0" style={{ backgroundColor: '#FAF8F4' }}>
            <span className="text-[11px] font-bold font-mono" style={{ color: '#1E2E4F' }}>LS</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight font-display" style={{ color: '#EEE9DF' }}>
            LegalSathi
          </span>
        </div>

        {/* New Chat */}
        <div className="p-3">
          <button
            onClick={newConversation}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-[12px] font-medium transition-colors cursor-pointer"
            style={{ color: '#A8B4C8' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#EEE9DF'; (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2D4070' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#A8B4C8'; (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
          >
            <IconPlus /> New Conversation
          </button>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto sb-scroll px-3 space-y-0.5">
          {conversations.length > 0 && (
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6B7D9A' }}>
              Recent
            </div>
          )}
          {conversations.map((conv) => {
            const active = activeId === conv.id
            return (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className="group flex items-center gap-2 px-3 py-2 cursor-pointer rounded-sm transition-all text-[12px]"
                style={{
                  backgroundColor: active ? '#2D4070' : 'transparent',
                  color: active ? '#EEE9DF' : '#A8B4C8',
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#243564'; (e.currentTarget as HTMLDivElement).style.color = '#EEE9DF' } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLDivElement).style.color = '#A8B4C8' } }}
              >
                <IconChat />
                <span className="flex-1 truncate">{conv.title}</span>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#6B7D9A' }}
                >
                  <IconX />
                </button>
              </div>
            )
          })}
        </div>

        {/* Knowledge Base */}
        <div className="border-t" style={{ borderColor: '#2D4070' }}>
          <button
            onClick={() => setDocsOpen(!docsOpen)}
            className="w-full px-5 py-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider transition-colors"
            style={{ color: '#A8B4C8' }}
          >
            <span className="flex items-center gap-2"><IconDoc /> Knowledge Base</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px]">{documents.length}</span>
              {docsOpen ? <IconChevronUp /> : <IconChevronDown />}
            </div>
          </button>

          {docsOpen && (
            <div className="px-3 pb-4 space-y-2">
              <div className="max-h-32 overflow-y-auto space-y-1 sb-scroll">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center px-2.5 py-1.5 rounded-sm text-[11px] group" style={{ backgroundColor: '#243564' }}>
                    <span className="truncate pr-2" style={{ color: '#A8B4C8' }}>{doc.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {doc.status === 'processing' && (
                        <span className="text-[9px] font-medium text-yellow-400">Indexing…</span>
                      )}
                      {doc.status === 'failed' && (
                        <span className="text-[9px] text-red-400">Failed</span>
                      )}
                      {doc.status === 'ready' && (
                        <span className="text-[9px]" style={{ color: '#6B7D9A' }}>{doc._count.chunks}c</span>
                      )}
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: '#6B7D9A' }}
                      >
                        <IconX />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 pt-1">
                <input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Document title"
                  className="w-full px-3 py-2 rounded-sm text-[11px] outline-none"
                  style={{ backgroundColor: '#243564', border: '1px solid #2D4070', color: '#EEE9DF' }}
                />
                <textarea
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  placeholder="Paste document content…"
                  rows={2}
                  className="w-full px-3 py-2 rounded-sm text-[11px] outline-none resize-none"
                  style={{ backgroundColor: '#243564', border: '1px solid #2D4070', color: '#EEE9DF' }}
                />
                <button
                  onClick={uploadDocument}
                  disabled={uploading || !uploadTitle.trim()}
                  className="w-full py-2 rounded-sm text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-30"
                  style={{ backgroundColor: '#EEE9DF', color: '#1E2E4F' }}
                >
                  {uploading ? 'Indexing…' : 'Add to Knowledge Base'}
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ════════════════════ MAIN */}
      <main className="flex-1 flex flex-col min-w-0 bg-app-bg">

        {activeId ? (
          <>
            {/* Header */}
            <header className="h-14 shrink-0 flex items-center justify-between px-8 border-b border-app-border bg-app-surface">
              <h2 className="text-[17px] font-semibold text-app-text truncate max-w-md font-display">
                {activeTitle}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-app-text-subtle">
                <div className={`w-1.5 h-1.5 rounded-full ${streaming ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                <span>{streaming ? 'Responding…' : 'Ready'}</span>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scroll-area py-10" style={{ backgroundColor: '#FAF8F4' }}>
              <div className="max-w-[740px] mx-auto px-8 space-y-10">

                {/* Empty state */}
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm" style={{ backgroundColor: '#1E2E4F' }}>
                      <span className="text-[12px] font-bold font-mono" style={{ color: '#EEE9DF' }}>LS</span>
                    </div>
                    <p className="text-[17px] font-semibold text-app-text font-display mb-2">How can I help you?</p>
                    <p className="text-[13px] text-app-text-muted max-w-[280px] leading-relaxed">
                      Ask any legal question. I'll reference your uploaded documents for grounded answers.
                    </p>
                  </div>
                )}

                {messages.map((msg) => msg.role === 'user' ? (

                  /* ── User bubble ── */
                  <div key={msg.id} className="flex justify-end">
                    <div
                      className="max-w-[68%] px-5 py-3.5 text-[13.5px] leading-[1.7] shadow-sm"
                      style={{
                        backgroundColor: '#1E2E4F',
                        color: '#EEE9DF',
                        borderRadius: '18px 18px 4px 18px',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>

                ) : (

                  /* ── AI response (flat prose, no card) ── */
                  <div key={msg.id} className="group flex gap-4 items-start">
                    {/* Avatar */}
                    <div
                      className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center mt-0.5"
                      style={{ backgroundColor: '#1E2E4F' }}
                    >
                      <span className="text-[9px] font-bold font-mono" style={{ color: '#EEE9DF' }}>LS</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3 pt-0.5">

                      {/* Sender label + copy */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold font-display" style={{ color: '#1E2E4F' }}>LegalSathi</span>
                        <button
                          onClick={() => copyMessage(msg.id, msg.content)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: copiedId === msg.id ? '#16a34a' : '#9A8E84' }}
                        >
                          {copiedId === msg.id ? <><IconCheck /> Copied</> : <><IconCopy /> Copy</>}
                        </button>
                      </div>

                      {/* Response text */}
                      <div className="text-[14px] leading-[1.9] whitespace-pre-wrap break-words" style={{ color: '#1A1A2E' }}>
                        {msg.content ? msg.content : <ThinkingIndicator />}
                      </div>

                      {/* Source chips */}
                      {(messageSources[msg.id]?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[10px] font-medium" style={{ color: '#9A8E84' }}>Referenced:</span>
                          {[...new Map(messageSources[msg.id].map(s => [s.documentId, s])).values()].map(s => (
                            <span
                              key={s.documentId}
                              className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full"
                              style={{ backgroundColor: '#E8ECF4', color: '#1E2E4F', border: '1px solid #C8D4E8' }}
                            >
                              <IconDoc />{s.documentTitle}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Follow-up suggestions */}
                      {(messageSuggestions[msg.id]?.length ?? 0) > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide" style={{ color: '#9A8E84' }}>
                            <IconLightning />
                            <span>FOLLOW-UP</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {messageSuggestions[msg.id].map((q, i) => (
                              <button
                                key={i}
                                onClick={() => sendMessage(q)}
                                className="text-[12px] px-3.5 py-1.5 rounded-full border transition-all cursor-pointer"
                                style={{ borderColor: '#C8BEB4', color: '#5C5349', backgroundColor: 'transparent' }}
                                onMouseEnter={e => {
                                  const el = e.currentTarget as HTMLButtonElement
                                  el.style.backgroundColor = '#1E2E4F'
                                  el.style.color = '#EEE9DF'
                                  el.style.borderColor = '#1E2E4F'
                                }}
                                onMouseLeave={e => {
                                  const el = e.currentTarget as HTMLButtonElement
                                  el.style.backgroundColor = 'transparent'
                                  el.style.color = '#5C5349'
                                  el.style.borderColor = '#C8BEB4'
                                }}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                ))}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Input */}
            <div className="px-8 pb-6 pt-4 bg-app-bg border-t border-app-border">
              <div className="max-w-[680px] mx-auto">
                <div className={`border bg-app-surface rounded-md transition-all ${
                  inputFocused ? 'border-app-border-strong shadow-sm' : 'border-app-border'
                }`}>
                  <textarea
                    ref={activeTextarea}
                    value={input}
                    rows={1}
                    placeholder="Ask a legal question…"
                    onChange={(e) => { setInput(e.target.value); grow(e.target) }}
                    onKeyDown={onKey}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    disabled={streaming}
                    className="w-full bg-transparent resize-none outline-none text-[13px] py-4 px-4 leading-relaxed text-app-text placeholder:text-app-text-subtle disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center justify-between px-4 py-2.5 border-t border-app-border">
                    <span className="text-[11px] text-app-text-subtle">
                      {streaming
                        ? <span className="flex items-center gap-2"><ThinkingIndicator /><span>Generating response…</span></span>
                        : 'Shift+Enter for new line'
                      }
                    </span>
                    <button
                      onClick={() => sendMessage()}
                      disabled={streaming || !input.trim()}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-sm text-[12px] font-medium transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#1E2E4F', color: '#EEE9DF' }}
                    >
                      <IconSend /> Send
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-app-text-subtle text-center">
                  AI guidance only — always verify important matters with a qualified lawyer
                </p>
              </div>
            </div>
          </>

        ) : (

          /* ─── Hero / Empty State ─── */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-[560px] space-y-10">

              {/* Identity */}
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-sm flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: '#1E2E4F' }}>
                  <span className="text-[13px] font-bold font-mono" style={{ color: '#EEE9DF' }}>LS</span>
                </div>
                <h1 className="text-[32px] font-bold text-app-text font-display leading-tight">
                  LegalSathi AI
                </h1>
                <p className="text-[14px] text-app-text-muted max-w-sm mx-auto">
                  AI-powered legal assistant for Nepal. Ask questions, research law, understand your rights.
                </p>
              </div>

              {/* Input */}
              <div className={`border bg-app-surface rounded-sm transition-colors ${
                inputFocused ? 'border-app-border-strong shadow-sm' : 'border-app-border'
              }`}>
                <textarea
                  ref={heroTextarea}
                  value={input}
                  rows={3}
                  placeholder="Describe your legal question or situation…"
                  onChange={(e) => { setInput(e.target.value); grow(e.target) }}
                  onKeyDown={onKey}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  className="w-full bg-transparent resize-none outline-none text-[14px] p-5 leading-relaxed text-app-text placeholder:text-app-text-subtle"
                />
                <div className="flex justify-between items-center px-5 py-3 border-t border-app-border">
                  <span className="text-[11px] text-app-text-subtle">Enter to send · Shift+Enter for new line</span>
                  <button
                    onClick={() => sendMessage()}
                    disabled={streaming || !input.trim()}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-sm text-[12px] font-medium transition-all disabled:opacity-40"
                    style={{ backgroundColor: '#1E2E4F', color: '#EEE9DF' }}
                  >
                    <IconSend /> Send
                  </button>
                </div>
              </div>

              {/* Suggestions */}
              <div className="grid grid-cols-3 gap-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); heroTextarea.current?.focus() }}
                    className="text-left px-4 py-3 border border-app-border bg-app-surface hover:border-app-border-strong hover:bg-app-surface-hover rounded-sm text-[12px] text-app-text-muted hover:text-app-text transition-all cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <p className="text-center text-[11px] text-app-text-subtle pt-2 border-t border-app-border">
                © 2026 LegalSathi · AI guidance only — always consult a qualified lawyer
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
