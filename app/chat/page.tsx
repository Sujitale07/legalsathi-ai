'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import LegalResponse from '@/components/LegalResponse'
import ScenarioRenderer from '@/components/ScenarioRenderer'
import { DOMAINS } from '@/lib/domains'
import { VoiceAssistant } from '@/components/voice/VoiceAssistant'

type Message    = { id: string; role: string; content: string; createdAt: string }
type Conversation = { id: string; title: string; domain: string; updatedAt: string }
type Document   = { id: string; title: string; status: string; _count: { chunks: number } }
type Source     = { documentId: string; documentTitle: string; chunkIndex: number; totalChunks: number; pages?: number[] }

function toFriendlyError(raw: unknown): string {
  const str = typeof raw === 'string' ? raw : JSON.stringify(raw)
  const lower = str.toLowerCase()
  // Only translate if it looks like a raw technical error (JSON, HTTP codes, SDK output)
  const looksRaw = str.startsWith('{') || str.startsWith('[') || str.includes('"code":') || str.includes('"status":') || /^chat api error \d/.test(lower)
  if (!looksRaw) return str || 'Something went wrong. Try again.'
  if (lower.includes('503') || lower.includes('high demand') || lower.includes('unavailable'))
    return 'Our servers are a bit busy right now — try again in a moment.'
  if (lower.includes('429') || lower.includes('quota') || lower.includes('resource_exhausted'))
    return 'Too many requests at once. Give it a few seconds and try again.'
  if (lower.includes('abort') || lower.includes('timed out') || lower.includes('timeout'))
    return 'Took too long to respond. Try a shorter question.'
  if (lower.includes('401') || lower.includes('403') || lower.includes('api_key') || lower.includes('unauthenticated'))
    return 'Something went wrong on our end — contact support.'
  if (lower.includes('500')) return 'Something went wrong on our end. Try again.'
  return 'Something went wrong. Try again.'
}

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

const IconMic = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <rect x="5" y="1" width="6" height="9" rx="3" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2 7a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="5" y1="15" x2="11" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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

// ─── Message Skeleton ────────────────────────────────────────────────────────

const MessageSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="flex gap-4 items-start">
      <div className="w-7 h-7 rounded-lg bg-[#E2D9CF] shrink-0" />
      <div className="flex-1 space-y-3 pt-1">
        <div className="h-3 bg-[#E2D9CF] rounded w-24" />
        <div className="space-y-2">
          <div className="h-4 bg-[#E2D9CF] rounded w-5/6" />
          <div className="h-4 bg-[#E2D9CF] rounded w-3/4" />
        </div>
      </div>
    </div>
    <div className="flex justify-end">
      <div className="w-1/2 h-12 bg-[#E2D9CF] rounded-lg" style={{ borderRadius: '18px 18px 4px 18px' }} />
    </div>
    <div className="flex gap-4 items-start">
      <div className="w-7 h-7 rounded-lg bg-[#E2D9CF] shrink-0" />
      <div className="flex-1 space-y-3 pt-1">
        <div className="h-3 bg-[#E2D9CF] rounded w-24" />
        <div className="space-y-2">
          <div className="h-4 bg-[#E2D9CF] rounded w-4/5" />
          <div className="h-4 bg-[#E2D9CF] rounded w-2/3" />
        </div>
      </div>
    </div>
  </div>
)
// ─── History Skeleton ────────────────────────────────────────────────────────

const HistorySkeleton = () => (
  <div className="animate-pulse space-y-2 px-3 pt-2">
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center gap-2 py-1.5">
        <div className="w-4 h-4 rounded bg-[#2D4070] shrink-0" />
        <div className="h-3 bg-[#2D4070] rounded w-3/4" />
      </div>
    ))}
  </div>
)

// ─── Docs Skeleton ───────────────────────────────────────────────────────────

const DocsSkeleton = () => (
  <div className="animate-pulse space-y-1">
    {[0, 1, 2].map((i) => (
      <div key={i} className="flex justify-between items-center px-2.5 py-1.5 rounded-sm" style={{ backgroundColor: '#243564' }}>
        <div className="h-3 bg-[#2D4070] rounded w-2/3" />
        <div className="h-3 bg-[#2D4070] rounded w-6" />
      </div>
    ))}
  </div>
)

// ─── Export helpers ───────────────────────────────────────────────────────────

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function extractScenario(content: string) {
  const m = content.match(/\{[\s\S]*\}/)
  if (!m) return null
  try {
    const p = JSON.parse(m[0])
    return p?.sections ? p : null
  } catch { return null }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [sending, setSending] = useState(false)
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null)
  const [failedMsgs, setFailedMsgs] = useState<Record<string, string>>({}) // id → error text
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadContent, setUploadContent] = useState('')
  const [uploading, setUploading] = useState(false)
  const [docsOpen, setDocsOpen] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [messageSources, setMessageSources] = useState<Record<string, Source[]>>({})
  const [messageSuggestions, setMessageSuggestions] = useState<Record<string, string[]>>({})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messageScenarios, setMessageScenarios] = useState<Record<string, any>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState<string | null>(null)  // msg id with dropdown open
  const [exportingId, setExportingId] = useState<string | null>(null) // msg id being exported

  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const shouldScrollSmoothRef = useRef(false)
  const prevLengthRef = useRef(messages.length)
  const sendingRef = useRef(false)

  const activeTextarea = useRef<HTMLTextAreaElement>(null)
  const heroTextarea = useRef<HTMLTextAreaElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const documentsRef = useRef<Document[]>([])
  useEffect(() => { documentsRef.current = documents })

  const activeConv = conversations.find(c => c.id === activeId)
  const activeTitle = activeConv?.title ?? 'New Chat'
  const activeDomainConfig = DOMAINS.find(d => d.slug === (activeConv?.domain ?? selectedDomain ?? 'general'))

  // ── Data ──────────────────────────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations')
      setConversations(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/documents')
      setDocuments(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDocs(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadConversations(), loadDocuments()])
    }
    init()
  }, [loadConversations, loadDocuments])

  // Close export dropdown when clicking outside
  useEffect(() => {
    if (!exportOpen) return
    const handler = () => setExportOpen(null)
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [exportOpen])

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
    setLoadingConversation(true)
    setMessages([])
    shouldScrollSmoothRef.current = false
    try {
      const res = await fetch(`/api/conversations/${conv.id}`)
      const data = await res.json()
      setMessages(data.messages ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingConversation(false)
    }
  }, [])

  const newConversation = useCallback(() => {
    setActiveId(null)
    setMessages([])
    setSelectedDomain(null)
    setVoiceOpen(false)
    shouldScrollSmoothRef.current = false
    setTimeout(() => heroTextarea.current?.focus(), 60)
  }, [])

  const deleteConversation = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (deletingIds.has(id)) return
    setDeletingIds(p => new Set(p).add(id))
    setConversations((p) => p.filter((c) => c.id !== id))
    if (activeId === id) { setActiveId(null); setMessages([]) }
    await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
    setDeletingIds(p => { const n = new Set(p); n.delete(id); return n })
  }, [activeId, deletingIds])

  const sendMessage = useCallback(async (override?: string) => {
    const text = (override ?? input).trim()
    if (!text || streaming || sendingRef.current) return

    sendingRef.current = true
    setSending(true)
    let aiId = ''

    try {
      let convId = activeId
      if (!convId) {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: selectedDomain ?? 'general' }),
        })
        if (!res.ok) throw new Error('Failed to create conversation')
        const conv = await res.json()
        // Provisional title from the user's message — AI-generated title replaces it after stream
        const provisionalTitle = text.length > 55 ? text.slice(0, 52).trimEnd() + '…' : text
        setConversations((p) => [{ ...conv, title: provisionalTitle }, ...p])
        setActiveId(conv.id)
        convId = conv.id
      }

      setInput('')
      if (activeTextarea.current) activeTextarea.current.style.height = 'auto'
      if (heroTextarea.current) heroTextarea.current.style.height = 'auto'

      aiId = `ai-${Date.now()}`
      shouldScrollSmoothRef.current = true
      setMessages((p) => [
        ...p,
        { id: `u-${Date.now()}`, role: 'user', content: text, createdAt: new Date().toISOString() },
        { id: aiId, role: 'assistant', content: '', createdAt: new Date().toISOString() },
      ])
      setStreaming(true)
      setStreamingMsgId(aiId)

      const abort = new AbortController()
      const timeoutId = setTimeout(() => abort.abort(), 120_000) // 2-min hard timeout

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId, message: text }),
        signal: abort.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) throw new Error(`Chat API error ${res.status}`)
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')
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
            } else if (parsed.scenario) {
              setMessageScenarios(p => ({ ...p, [aiId]: parsed.scenario }))
            } else if (parsed.suggestions) {
              setMessageSuggestions(p => ({ ...p, [aiId]: parsed.suggestions }))
            } else if (parsed.error) {
              setFailedMsgs(p => ({ ...p, [aiId]: toFriendlyError(parsed.error) }))
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (err) {
      const raw = err instanceof Error
        ? (err.name === 'AbortError' ? 'Request timed out — Gemini took too long.' : err.message)
        : 'Something went wrong.'
      setFailedMsgs(p => ({ ...p, [aiId]: toFriendlyError(raw) }))
    } finally {
      setStreaming(false)
      setStreamingMsgId(null)
      sendingRef.current = false
      setSending(false)
      loadConversations()
      setTimeout(() => loadConversations(), 3500)
    }
  }, [input, activeId, streaming, selectedDomain, loadConversations])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const isNewMessage = messages.length > prevLengthRef.current
    prevLengthRef.current = messages.length

    if (isNewMessage) {
      if (shouldScrollSmoothRef.current) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        shouldScrollSmoothRef.current = false
      } else {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' })
      }
    } else if (streaming) {
      const threshold = 150
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold
      if (isAtBottom) {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' })
      }
    } else {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' })
    }
  }, [messages, streaming])

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

  const handleExport = useCallback(async (
    msgId: string,
    format: 'md' | 'docx' | 'pdf',
    mode: 'brief' | 'full',
    content: string,
  ) => {
    setExportOpen(null)
    setExportingId(msgId)
    const sources = messageSources[msgId] ?? []
    const scenario = messageScenarios[msgId] ?? extractScenario(content)
    const title = scenario?.title ?? conversations.find(c => c.id === activeId)?.title ?? 'LegalSathi Export'

    try {
      if (format === 'md') {
        const { scenarioToMarkdown, plainToMarkdown } = await import('@/lib/export')
        const md = scenario
          ? scenarioToMarkdown(scenario, sources, mode)
          : plainToMarkdown(content, sources, title)
        triggerDownload(md, `${title.replace(/[^a-z0-9]+/gi, '_')}.md`, 'text/markdown')

      } else if (format === 'pdf') {
        const { scenarioToHtml, plainToHtml } = await import('@/lib/export')
        const html = scenario
          ? scenarioToHtml(scenario, sources, mode)
          : plainToHtml(content, sources, title)
        const win = window.open('', '_blank')
        if (win) { win.document.write(html); win.document.close() }

      } else if (format === 'docx') {
        const res = await fetch('/api/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ format: 'docx', scenario: scenario ?? { title, sections: [], summary: { content } }, sources, mode }),
        })
        if (!res.ok) throw new Error('Export failed')
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url
        a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] ?? `${title}.docx`
        a.click(); URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setExportingId(null)
    }
  }, [messageSources, messageScenarios, conversations, activeId])

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

        {/* Navigation */}
        <div className="p-3 border-b" style={{ borderColor: '#2D4070' }}>
          <div className="space-y-1">
            <Link
              href="/chat"
              className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-[12px] font-medium transition-colors duration-150 cursor-pointer bg-[#2D4070] text-[#EEE9DF]"
            >
              <IconChat /> Chat Assistant
            </Link>
            <Link
              href="/ingest"
              className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-[12px] font-medium transition-colors duration-150 cursor-pointer text-[#A8B4C8] hover:text-[#EEE9DF] hover:bg-[#2D4070]/30"
            >
              <IconDoc /> Data Ingestion
            </Link>
          </div>
        </div>

        {/* New Chat */}
        <div className="p-3">
          <button
            onClick={newConversation}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-[12px] font-medium transition-colors duration-150 cursor-pointer text-[#A8B4C8] hover:text-[#EEE9DF] hover:bg-[#2D4070]"
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
          {loadingHistory ? (
            <HistorySkeleton />
          ) : conversations.length === 0 ? (
            <div className="px-3 py-4 text-[11px] italic text-center" style={{ color: '#6B7D9A' }}>
              No history yet
            </div>
          ) : (
            conversations.map((conv) => {
              const active = activeId === conv.id
              return (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`group flex items-center gap-2 px-3 py-2 cursor-pointer rounded-sm transition-colors duration-150 text-[12px] ${
                    active 
                      ? 'bg-[#2D4070] text-[#EEE9DF]' 
                      : 'text-[#A8B4C8] hover:bg-[#243564] hover:text-[#EEE9DF]'
                  }`}
                >
                  <IconChat />
                  <span className="flex-1 truncate">{conv.title}</span>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all duration-150 p-1 rounded-sm cursor-pointer"
                    style={{ color: '#6B7D9A' }}
                  >
                    <IconX />
                  </button>
                </div>
              )
            })
          )}
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
                {loadingDocs ? (
                  <DocsSkeleton />
                ) : documents.length === 0 ? (
                  <div className="px-2.5 py-3 text-[10.5px] italic text-center" style={{ color: '#6B7D9A' }}>
                    No documents uploaded
                  </div>
                ) : (
                  documents.map((doc) => (
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
                  ))
                )}
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

        {(activeId || loadingConversation || sending) ? (
          <>
            {/* Header */}
            <header className="h-14 shrink-0 flex items-center justify-between px-8 border-b border-app-border bg-app-surface">
              <div className="flex items-center gap-3 min-w-0">
                <h2 className="text-[17px] font-semibold text-app-text truncate max-w-xs font-display">
                  {activeTitle}
                </h2>
                {activeDomainConfig && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold shrink-0"
                    style={{ backgroundColor: '#E8ECF4', color: '#1E2E4F', border: '1px solid #C8D4E8' }}
                  >
                    <span>{activeDomainConfig.icon}</span>
                    <span>{activeDomainConfig.label}</span>
                    <span style={{ color: '#9A8E84', marginLeft: 2 }}>· locked</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-app-text-subtle">
                <div className={`w-1.5 h-1.5 rounded-full ${streaming || sending ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                <span>{streaming || sending ? 'Responding…' : 'Ready'}</span>
              </div>
            </header>

            {/* Messages */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-area py-10" style={{ backgroundColor: '#FAF8F4' }}>
              <div className="max-w-[740px] mx-auto px-8 space-y-10">

                {loadingConversation ? (
                  <MessageSkeleton />
                ) : messages.length === 0 ? (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm" style={{ backgroundColor: '#1E2E4F' }}>
                      <span className="text-[12px] font-bold font-mono" style={{ color: '#EEE9DF' }}>LS</span>
                    </div>
                    <p className="text-[17px] font-semibold text-app-text font-display mb-2">How can I help you?</p>
                    <p className="text-[13px] text-app-text-muted max-w-[280px] leading-relaxed">
                      Ask any legal question. I&apos;ll reference your uploaded documents for grounded answers.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => msg.role === 'user' ? (

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

                        {/* Sender label + copy + export */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold font-display" style={{ color: '#1E2E4F' }}>LegalSathi</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyMessage(msg.id, msg.content)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                              style={{ color: copiedId === msg.id ? '#16a34a' : '#9A8E84' }}
                            >
                              {copiedId === msg.id ? <><IconCheck /> Copied</> : <><IconCopy /> Copy</>}
                            </button>

                            {/* Export dropdown */}
                            {!failedMsgs[msg.id] && msg.content && (
                              <div className="relative">
                                <button
                                  onClick={() => setExportOpen(p => p === msg.id ? null : msg.id)}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                                  style={{ color: '#9A8E84' }}
                                  title="Export"
                                >
                                  {exportingId === msg.id ? (
                                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="animate-spin"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="20" strokeDashoffset="10"/></svg>
                                  ) : (
                                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  )}
                                  Export
                                </button>

                                {exportOpen === msg.id && (
                                  <div
                                    className="absolute right-0 top-full mt-1 z-50 rounded-lg shadow-lg overflow-hidden"
                                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D9CF', minWidth: 180 }}
                                  >
                                    {/* Mode selector */}
                                    <div className="px-3 pt-2.5 pb-1.5 text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#9A8E84' }}>Export as</div>

                                    {(['md', 'docx', 'pdf'] as const).map(fmt => (
                                      <div key={fmt} className="px-1 pb-0.5">
                                        {(['full', 'brief'] as const).map(mode => (
                                          <button
                                            key={mode}
                                            onClick={() => handleExport(msg.id, fmt, mode, msg.content)}
                                            className="w-full text-left px-3 py-2 rounded text-[11px] flex items-center justify-between hover:bg-app-surface-hover transition-colors"
                                            style={{ color: '#1A1A2E' }}
                                          >
                                            <span>
                                              {fmt === 'md' ? '📄' : fmt === 'docx' ? '📝' : '🖨️'}{' '}
                                              {fmt === 'md' ? 'Markdown' : fmt === 'docx' ? 'Word (.docx)' : 'PDF (print)'}
                                            </span>
                                            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#F3EFE8', color: '#5C5349' }}>
                                              {mode === 'brief' ? 'Brief' : 'Full'}
                                            </span>
                                          </button>
                                        ))}
                                      </div>
                                    ))}
                                    <div className="h-2" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Response text */}
                        <div>
                          {(() => {
                            // Failed — show error with reason
                            if (failedMsgs[msg.id]) {
                              return (
                                <div
                                  className="flex items-center gap-2.5 text-[12.5px]"
                                  style={{ color: '#9A8E84' }}
                                >
                                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
                                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
                                    <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                                  </svg>
                                  {failedMsgs[msg.id]}
                                </div>
                              )
                            }
                            // Scenario arrived via SSE (current session)
                            if (messageScenarios[msg.id]) {
                              return <ScenarioRenderer data={messageScenarios[msg.id]} />
                            }
                            // This message is actively streaming — hide raw JSON build-up
                            if (streamingMsgId === msg.id) {
                              return <ThinkingIndicator />
                            }
                            // Empty with no error = still waiting for first token
                            if (!msg.content) {
                              return <ThinkingIndicator />
                            }
                            // Try to parse as scenario JSON (handles historical messages after reload).
                            // Use regex to extract just the JSON object — the AI appends a Disclaimer
                            // and [TRIGGER] code after the closing }, which breaks a naive JSON.parse.
                            const jsonExtract = msg.content.match(/\{[\s\S]*\}/)
                            if (jsonExtract) {
                              try {
                                const parsed = JSON.parse(jsonExtract[0])
                                if (parsed?.sections) return <ScenarioRenderer data={parsed} />
                              } catch { /* fall through */ }
                            }
                            return <LegalResponse content={msg.content} />
                          })()}
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
                                <IconDoc />
                                {s.documentTitle}
                                {s.pages && s.pages.length > 0 && (
                                  <span
                                    className="ml-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold"
                                    style={{ backgroundColor: '#1E2E4F', color: '#EEE9DF' }}
                                    title="PDF file page number (may differ from printed document page)"
                                  >
                                    PDF p.{s.pages.join(', ')}
                                  </span>
                                )}
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
                                  className="text-[12px] px-3.5 py-1.5 rounded-full border border-app-border-strong text-app-text-muted bg-transparent hover:bg-app-accent hover:text-[#EEE9DF] hover:border-app-accent transition-colors duration-150 cursor-pointer"
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  ))
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Input */}
            <div className="px-8 pb-6 pt-4 bg-app-bg border-t border-app-border">
              <div className="max-w-[680px] mx-auto">
                {voiceOpen ? (
                  /* ── Inline voice panel (replaces textarea) ── */
                  <div className="border border-app-border bg-app-surface rounded-md p-4">
                    <VoiceAssistant
                      domain={activeConv?.domain ?? selectedDomain ?? 'general'}
                      autoStart
                      compact
                      onClose={() => setVoiceOpen(false)}
                    />
                  </div>
                ) : (
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
                      disabled={streaming || sending}
                      className="w-full bg-transparent resize-none outline-none text-[13px] py-4 px-4 leading-relaxed text-app-text placeholder:text-app-text-subtle disabled:cursor-not-allowed"
                    />
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-app-border">
                      <span className="text-[11px] text-app-text-subtle">
                        {streaming || sending
                          ? <span className="flex items-center gap-2"><ThinkingIndicator /><span>Generating response…</span></span>
                          : 'Shift+Enter for new line'
                        }
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setVoiceOpen(true)}
                          disabled={streaming || sending}
                          title="Start voice conversation"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-app-border text-app-text-subtle hover:border-[#1E2E4F] hover:text-[#1E2E4F]"
                        >
                          <IconMic /> Voice
                        </button>
                        <button
                          type="button"
                          onClick={() => sendMessage()}
                          disabled={streaming || sending || !input.trim()}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-sm text-[12px] font-medium transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed bg-[#1E2E4F] text-[#EEE9DF]"
                        >
                          <IconSend /> Send
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <p className="mt-2 text-[11px] text-app-text-subtle text-center">
                  AI guidance only — always verify important matters with a qualified lawyer
                </p>
              </div>
            </div>
          </>

        ) : (

          /* ─── Hero / Domain Selection ─── */
          <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto scroll-area">
            <div className="w-full max-w-[640px] space-y-8">

              {/* Identity */}
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-sm flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#1E2E4F' }}>
                  <span className="text-[13px] font-bold font-mono" style={{ color: '#EEE9DF' }}>LS</span>
                </div>
                <h1 className="text-[30px] font-bold text-app-text font-display leading-tight">
                  LegalSathi AI
                </h1>
                {!selectedDomain ? (
                  <p className="text-[14px] text-app-text-muted max-w-sm mx-auto">
                    Select a legal domain to begin. Your session will be strictly locked to that topic.
                  </p>
                ) : (
                  <p className="text-[13px] text-app-text-muted max-w-sm mx-auto">
                    Session locked to&nbsp;
                    <span className="font-semibold text-app-text">
                      {activeDomainConfig?.icon} {activeDomainConfig?.label}
                    </span>
                    &nbsp;·&nbsp;
                    <button
                      onClick={() => setSelectedDomain(null)}
                      className="underline underline-offset-2 hover:text-app-text transition-colors cursor-pointer"
                    >
                      change domain
                    </button>
                  </p>
                )}
              </div>

              {!selectedDomain ? (
                /* ── Domain card grid ── */
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {DOMAINS.map((domain) => (
                    <button
                      key={domain.slug}
                      onClick={() => {
                        setSelectedDomain(domain.slug)
                        setTimeout(() => heroTextarea.current?.focus(), 60)
                      }}
                      className={`text-left px-5 py-4 border border-app-border bg-app-surface hover:border-[#1E2E4F] hover:bg-app-surface-hover rounded-sm transition-all cursor-pointer group ${
                        domain.slug === 'general' ? 'col-span-2 sm:col-span-3' : ''
                      }`}
                    >
                      <div className="text-[22px] mb-2">{domain.icon}</div>
                      <div className="text-[13px] font-semibold text-app-text group-hover:text-[#1E2E4F] font-display mb-1">
                        {domain.label}
                      </div>
                      <div className="text-[11.5px] text-app-text-subtle leading-relaxed">
                        {domain.description}
                      </div>
                    </button>
                  ))}
                </div>
              ) : voiceOpen ? (
                /* ── Inline voice panel (domain selected, voice active) ── */
                <div className="border border-app-border bg-app-surface rounded-sm p-4">
                  <VoiceAssistant
                    domain={selectedDomain ?? 'general'}
                    autoStart
                    compact
                    onClose={() => setVoiceOpen(false)}
                  />
                </div>
              ) : (
                /* ── Chat input (domain selected) ── */
                <div className={`border bg-app-surface rounded-sm transition-colors ${
                  inputFocused ? 'border-app-border-strong shadow-sm' : 'border-app-border'
                }`}>
                  <textarea
                    ref={heroTextarea}
                    value={input}
                    rows={3}
                    placeholder={`Ask a ${activeDomainConfig?.label ?? 'legal'} question…`}
                    onChange={(e) => { setInput(e.target.value); grow(e.target) }}
                    onKeyDown={onKey}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    disabled={streaming || sending}
                    className="w-full bg-transparent resize-none outline-none text-[14px] p-5 leading-relaxed text-app-text placeholder:text-app-text-subtle disabled:cursor-not-allowed"
                  />
                  <div className="flex justify-between items-center px-5 py-3 border-t border-app-border">
                    <span className="text-[11px] text-app-text-subtle">Enter to send · Shift+Enter for new line</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setVoiceOpen(true)}
                        title="Start voice conversation"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] font-medium transition-all border border-app-border text-app-text-subtle hover:border-[#1E2E4F] hover:text-[#1E2E4F]"
                      >
                        <IconMic /> Voice
                      </button>
                      <button
                        type="button"
                        onClick={() => sendMessage()}
                        disabled={streaming || sending || !input.trim()}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-sm text-[12px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#1E2E4F] text-[#EEE9DF]"
                      >
                        <IconSend /> Send
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
