'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type Message = { id: string; role: string; content: string; createdAt: string }
type Conversation = { id: string; title: string; updatedAt: string }
type Document = { id: string; title: string; _count: { chunks: number } }

const S = {
  // Layout
  shell: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--bg)',
  } as React.CSSProperties,

  // Sidebar
  sidebar: {
    width: '248px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    overflow: 'hidden',
  },
  sidebarHeader: {
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
    gap: '8px',
  },
  brandMark: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
    flexShrink: 0,
    letterSpacing: '-0.3px',
  } as React.CSSProperties,
  brandName: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: '-0.3px',
  },
  sidebarBody: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '8px',
  },
  newChatBtn: {
    width: '100%',
    padding: '8px 12px',
    marginBottom: '4px',
    background: 'transparent',
    border: '1px dashed var(--border)',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-muted)',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'background 150ms ease, border-color 150ms ease, color 150ms ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-subtle)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    padding: '12px 8px 4px',
  },
  convItem: (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px 8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '1px',
    background: active ? 'var(--primary-tint)' : 'transparent',
    borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
    transition: 'background 150ms ease, border-color 150ms ease',
  }),
  convTitle: (active: boolean): React.CSSProperties => ({
    flex: 1,
    fontSize: '13px',
    color: active ? 'var(--text)' : 'var(--text-muted)',
    fontWeight: active ? 500 : 400,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-subtle)',
    fontSize: '13px',
    padding: '2px',
    borderRadius: '4px',
    flexShrink: 0,
    lineHeight: 1,
    transition: 'color 150ms ease',
  } as React.CSSProperties,

  // Docs footer
  docsFooter: {
    borderTop: '1px solid var(--border)',
    flexShrink: 0,
  },
  docsToggle: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-muted)',
    transition: 'color 150ms ease',
  } as React.CSSProperties,
  docsPanel: {
    padding: '0 12px 12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  docRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid var(--border)',
    fontSize: '13px',
  } as React.CSSProperties,
  inputBase: {
    padding: '7px 10px',
    fontSize: '13px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    background: 'var(--bg)',
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'inherit',
    width: '100%',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  } as React.CSSProperties,
  uploadBtn: (disabled: boolean): React.CSSProperties => ({
    padding: '8px 12px',
    background: disabled ? 'var(--surface-hover)' : 'var(--primary)',
    color: disabled ? 'var(--text-muted)' : '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'opacity 150ms ease, background 150ms ease',
  }),

  // Main
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    background: 'var(--bg)',
  },
  topbar: {
    height: '56px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    flexShrink: 0,
    background: 'var(--bg)',
  },
  topbarTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--text)',
  },
  messageList: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '32px 0',
  },
  messageInner: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  // User bubble
  userRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  userBubble: {
    maxWidth: '70%',
    background: 'var(--primary)',
    color: '#fff',
    borderRadius: '18px 18px 4px 18px',
    padding: '12px 16px',
    fontSize: '15px',
    lineHeight: 1.65,
    whiteSpace: 'pre-wrap',
  } as React.CSSProperties,
  // AI message — Perplexity style, no bubble
  aiRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  aiAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 700,
    flexShrink: 0,
    marginTop: '2px',
    letterSpacing: '-0.3px',
  } as React.CSSProperties,
  aiContent: {
    flex: 1,
    borderLeft: '3px solid var(--primary-tint)',
    paddingLeft: '16px',
  },
  aiSender: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--primary)',
    marginBottom: '6px',
  },
  aiText: {
    fontSize: '15px',
    lineHeight: 1.65,
    color: 'var(--text)',
    whiteSpace: 'pre-wrap',
  } as React.CSSProperties,
  thinking: {
    fontSize: '13px',
    color: 'var(--text-subtle)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  // Input bar
  inputBar: {
    borderTop: '1px solid var(--border)',
    padding: '16px 24px',
    flexShrink: 0,
    background: 'var(--bg)',
  },
  inputWrap: {
    maxWidth: '680px',
    margin: '0 auto',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '24px',
    padding: '8px 8px 8px 20px',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  } as React.CSSProperties,
  chatTextarea: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    resize: 'none' as const,
    outline: 'none',
    fontSize: '15px',
    lineHeight: 1.5,
    color: 'var(--text)',
    fontFamily: 'inherit',
    padding: '4px 0',
    overflowY: 'auto' as const,
  },
  sendBtn: (disabled: boolean): React.CSSProperties => ({
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    background: disabled ? 'var(--border)' : 'var(--primary)',
    color: disabled ? 'var(--text-subtle)' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 150ms ease, opacity 150ms ease',
    opacity: disabled ? 0.5 : 1,
  }),

  // Empty state
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '48px 24px',
    textAlign: 'center' as const,
  },
  emptyMark: {
    width: '52px',
    height: '52px',
    borderRadius: '10px',
    background: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 700,
    letterSpacing: '-0.5px',
  },
  emptyHeading: {
    fontSize: '22px',
    fontWeight: 600,
    color: 'var(--text)',
    letterSpacing: '-0.3px',
  },
  emptyDesc: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    maxWidth: '340px',
    lineHeight: 1.6,
  },
  startBtn: {
    marginTop: '8px',
    padding: '10px 24px',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 150ms ease',
  } as React.CSSProperties,
} as const

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeTitle, setActiveTitle] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadContent, setUploadContent] = useState('')
  const [uploading, setUploading] = useState(false)
  const [docsOpen, setDocsOpen] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const loadConversations = useCallback(async () => {
    const res = await fetch('/api/conversations')
    setConversations(await res.json())
  }, [])

  const loadDocuments = useCallback(async () => {
    const res = await fetch('/api/documents')
    setDocuments(await res.json())
  }, [])

  useEffect(() => {
    loadConversations()
    loadDocuments()
  }, [loadConversations, loadDocuments])

  const selectConversation = useCallback(async (conv: Conversation) => {
    setActiveId(conv.id)
    setActiveTitle(conv.title)
    const res = await fetch(`/api/conversations/${conv.id}`)
    const data = await res.json()
    setMessages(data.messages)
  }, [])

  const newConversation = useCallback(async () => {
    const res = await fetch('/api/conversations', { method: 'POST' })
    const conv = await res.json()
    setConversations((prev) => [conv, ...prev])
    setActiveId(conv.id)
    setActiveTitle('New chat')
    setMessages([])
    setTimeout(() => textareaRef.current?.focus(), 50)
  }, [])

  const deleteConversation = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation()
      await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeId === id) {
        setActiveId(null)
        setActiveTitle('')
        setMessages([])
      }
    },
    [activeId]
  )

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !activeId || streaming) return

    const userText = input.trim()
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    const tempAiId = `tmp-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', content: userText, createdAt: new Date().toISOString() },
      { id: tempAiId, role: 'assistant', content: '', createdAt: new Date().toISOString() },
    ])

    setStreaming(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeId, message: userText }),
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
          const { text } = JSON.parse(payload)
          setMessages((prev) =>
            prev.map((m) => (m.id === tempAiId ? { ...m, content: m.content + text } : m))
          )
        }
      }
    } finally {
      setStreaming(false)
      loadConversations()
    }
  }, [input, activeId, streaming, loadConversations])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    },
    [sendMessage]
  )

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [])

  const uploadDocument = useCallback(async () => {
    if (!uploadTitle.trim() || !uploadContent.trim()) return
    setUploading(true)
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: uploadTitle, content: uploadContent }),
      })
      setUploadTitle('')
      setUploadContent('')
      await loadDocuments()
    } finally {
      setUploading(false)
    }
  }, [uploadTitle, uploadContent, loadDocuments])

  return (
    <div style={S.shell}>

      {/* ─── Sidebar ─── */}
      <aside style={S.sidebar}>
        <div style={S.sidebarHeader}>
          <div style={S.brandMark}>LS</div>
          <span style={S.brandName}>LegalSathi</span>
        </div>

        <div style={S.sidebarBody}>
          <button
            onClick={newConversation}
            style={S.newChatBtn}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--surface-hover)'
              e.currentTarget.style.borderColor = 'var(--border-strong)'
              e.currentTarget.style.color = 'var(--text)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            New chat
          </button>

          {conversations.length > 0 && (
            <div style={S.sectionLabel}>Recent</div>
          )}

          {conversations.map((conv) => {
            const active = activeId === conv.id
            return (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                style={S.convItem(active)}
                onMouseOver={(e) => {
                  if (!active) e.currentTarget.style.background = 'var(--surface-hover)'
                  const btn = e.currentTarget.querySelector<HTMLElement>('.del-btn')
                  if (btn) btn.style.opacity = '1'
                }}
                onMouseOut={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent'
                  const btn = e.currentTarget.querySelector<HTMLElement>('.del-btn')
                  if (btn) btn.style.opacity = '0'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, color: active ? 'var(--primary)' : 'var(--text-subtle)' }}>
                  <path d="M2 2h9v7H2zM4 9v2M9 9v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={S.convTitle(active)}>{conv.title}</span>
                <button
                  className="del-btn"
                  onClick={(e) => deleteConversation(conv.id, e)}
                  style={{ ...S.deleteBtn, opacity: 0 }}
                  onMouseOver={(e) => (e.currentTarget.style.color = 'var(--error)')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>

        {/* Documents */}
        <div style={S.docsFooter}>
          <button
            style={S.docsToggle}
            onClick={() => setDocsOpen((v) => !v)}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M3 1h5l3 3v8H3V1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M8 1v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
              Documents
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
              {documents.length} {docsOpen ? '▲' : '▼'}
            </span>
          </button>

          {docsOpen && (
            <div style={S.docsPanel}>
              {documents.map((doc) => (
                <div key={doc.id} style={S.docRow}>
                  <span style={{ color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{doc.title}</span>
                  <span style={{ color: 'var(--text-subtle)', fontSize: '12px', marginLeft: '8px', flexShrink: 0 }}>{doc._count.chunks} chunks</span>
                </div>
              ))}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: documents.length ? '8px' : 0 }}>
                <input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Document title"
                  style={S.inputBase}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <textarea
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  placeholder="Paste document text…"
                  rows={3}
                  style={{ ...S.inputBase, resize: 'none' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <button
                  onClick={uploadDocument}
                  disabled={uploading || !uploadTitle.trim() || !uploadContent.trim()}
                  style={S.uploadBtn(uploading || !uploadTitle.trim() || !uploadContent.trim())}
                  onMouseOver={(e) => { if (!uploading) e.currentTarget.style.opacity = '0.88' }}
                  onMouseOut={(e) => { if (!uploading) e.currentTarget.style.opacity = '1' }}
                >
                  {uploading ? 'Uploading…' : 'Upload document'}
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main style={S.main}>
        {activeId ? (
          <>
            {/* Topbar */}
            <div style={S.topbar}>
              <span style={S.topbarTitle}>{activeTitle}</span>
            </div>

            {/* Messages */}
            <div style={S.messageList}>
              <div style={S.messageInner}>
                {messages.map((msg) =>
                  msg.role === 'user' ? (
                    <div key={msg.id} style={S.userRow}>
                      <div style={S.userBubble}>{msg.content}</div>
                    </div>
                  ) : (
                    <div key={msg.id} style={S.aiRow}>
                      <div style={S.aiAvatar}>LS</div>
                      <div style={S.aiContent}>
                        <div style={S.aiSender}>LegalSathi</div>
                        {msg.content ? (
                          <div style={S.aiText}>{msg.content}</div>
                        ) : streaming ? (
                          <div style={S.thinking}>
                            <span style={{ display: 'inline-flex', gap: '3px' }}>
                              {[0, 1, 2].map((i) => (
                                <span
                                  key={i}
                                  style={{
                                    width: '5px',
                                    height: '5px',
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                                    display: 'inline-block',
                                  }}
                                />
                              ))}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Input bar */}
            <div style={S.inputBar}>
              <div
                style={{
                  ...S.inputWrap,
                  borderColor: inputFocused ? 'var(--primary)' : 'var(--border)',
                  boxShadow: inputFocused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Ask a legal question…"
                  rows={1}
                  style={S.chatTextarea}
                />
                <button
                  onClick={sendMessage}
                  disabled={streaming || !input.trim()}
                  style={S.sendBtn(streaming || !input.trim())}
                  onMouseOver={(e) => { if (!streaming && input.trim()) e.currentTarget.style.opacity = '0.88' }}
                  onMouseOut={(e) => { if (!streaming && input.trim()) e.currentTarget.style.opacity = '1' }}
                  aria-label="Send"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 8L2.5 3l2.5 5-2.5 5 11-5z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
              <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-subtle)', marginTop: '8px' }}>
                Shift + Enter for new line
              </p>
            </div>
          </>
        ) : (
          <div style={S.emptyState}>
            <div style={S.emptyMark}>LS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <h1 style={S.emptyHeading}>LegalSathi AI</h1>
              <p style={S.emptyDesc}>
                Ask legal questions and get context-aware answers grounded in your documents.
              </p>
            </div>
            <button
              style={S.startBtn}
              onClick={newConversation}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.88')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Start a chat
            </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
