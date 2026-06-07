'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { DOMAINS } from '@/lib/domains'

type Document = {
  id: string
  title: string
  status: string
  fileType: string
  domain: string
  createdAt: string
  _count: { chunks: number }
}

type Chunk = {
  id: string
  content: string
  chunkIndex: number
  totalChunks: number
  createdAt: string
}

type DocumentDetail = Document & {
  chunks: Chunk[]
  nullEmbedCount: number
}

type QueueItem = {
  id: string
  file: File
  name: string
  size: number
  type: string
  status: 'pending' | 'parsing' | 'ready' | 'uploading' | 'success' | 'failed'
  content: string
  error?: string
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconChat = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-60">
    <path d="M2 2h12v9H8l-4 3v-3H2V2z" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)

const IconDoc = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M3 2h7l3 3v9H3V2z" stroke="currentColor" strokeWidth="1.2" />
    <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M3 4h10M5 4v10a1 1 0 001 1h4a1 1 0 001-1V4M6 4V2a1 1 0 011-1h2a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

const IconUpload = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="mx-auto mb-2 text-app-text-subtle">
    <path d="M12 16V4M12 4L8 8M12 4L16 8M4 20H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-app-text-subtle">
    <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 10l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-emerald-500">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-red-500">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const IconLoading = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin text-amber-500">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" className="opacity-25" />
    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export default function IngestPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload')

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Manual Paste Form
  const [pasteTitle, setPasteTitle] = useState('')
  const [pasteContent, setPasteContent] = useState('')
  const [pasteDomain, setPasteDomain] = useState('general')
  const [pasting, setPasting] = useState(false)

  // File Upload Queue
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadDomain, setUploadDomain] = useState('general')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Detail Drawer
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<DocumentDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [reEmbedding, setReEmbedding] = useState(false)

  // Polling ref for documents
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const documentsRef = useRef<Document[]>([])
  useEffect(() => {
    documentsRef.current = documents
  })

  // Load Catalog
  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/documents')
      if (res.ok) {
        setDocuments(await res.json())
      }
    } catch (err) {
      console.error('Failed to load documents', err)
    } finally {
      setLoadingDocs(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => {
      loadDocuments()
    })
  }, [loadDocuments])

  // Polling for processing documents
  useEffect(() => {
    const processing = documents.filter(d => d.status === 'processing')
    if (processing.length === 0) {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
      return
    }

    if (pollRef.current) return

    pollRef.current = setInterval(async () => {
      const currentProcessing = documentsRef.current.filter(d => d.status === 'processing')
      if (currentProcessing.length === 0) return

      try {
        const results = await Promise.all(
          currentProcessing.map(async d => {
            const res = await fetch(`/api/documents/${d.id}`).catch(() => null)
            if (!res) return { id: d.id, data: null, missing: false }
            if (res.status === 404) return { id: d.id, data: null, missing: true }
            return { id: d.id, data: res.ok ? await res.json() : null, missing: false }
          })
        )

        const missingIds = new Set(results.filter(r => r.missing).map(r => r.id))

        setDocuments(prev =>
          prev
            .filter(d => !missingIds.has(d.id))
            .map(d => {
              const result = results.find(r => r.id === d.id)
              const update = result?.data as DocumentDetail | null
              if (update) {
                return {
                  ...d,
                  status: update.status,
                  _count: { chunks: update._count?.chunks ?? 0 }
                }
              }
              return d
            })
        )
      } catch (err) {
        console.error('Polling error', err)
      }
    }, 3000)

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [documents])

  // Get Detail
  const fetchDetail = useCallback(async (id: string) => {
    setLoadingDetail(true)
    try {
      const res = await fetch(`/api/documents/${id}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedDoc(data)
      }
    } catch (err) {
      console.error('Failed to load document details', err)
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => {
      if (selectedDocId) {
        fetchDetail(selectedDocId)
      } else {
        setSelectedDoc(null)
      }
    })
  }, [selectedDocId, fetchDetail])

  // Actions
  const handleDocClick = (doc: Document) => {
    setSelectedDocId(doc.id)
    setIsDrawerOpen(true)
  }

  const handleReEmbed = async () => {
    if (!selectedDocId) return
    setReEmbedding(true)
    try {
      const res = await fetch(`/api/documents/${selectedDocId}/re-embed`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        alert(data.message)
        // Refresh detail so nullEmbedCount updates
        fetchDetail(selectedDocId)
        // Mark as processing in list
        setDocuments(prev => prev.map(d => d.id === selectedDocId ? { ...d, status: 'processing' } : d))
      } else {
        alert('Re-embed request failed')
      }
    } catch (err) {
      console.error('Re-embed error', err)
    } finally {
      setReEmbedding(false)
    }
  }

  const handleDeleteDoc = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const confirm = window.confirm('Are you sure you want to delete this document? This will purge all its vector chunks.')
    if (!confirm) return

    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id))
        if (selectedDocId === id) {
          setIsDrawerOpen(false)
          setSelectedDocId(null)
        }
      }
    } catch (err) {
      console.error('Failed to delete document', err)
    }
  }

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pasteTitle.trim() || !pasteContent.trim()) return

    setPasting(true)
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pasteTitle.trim(),
          content: pasteContent.trim(),
          fileType: 'manual',
          domain: pasteDomain,
        })
      })

      if (res.ok) {
        const newDoc = await res.json()
        setDocuments(prev => [
          {
            id: newDoc.id,
            title: newDoc.title,
            status: 'processing',
            fileType: 'manual',
            domain: pasteDomain,
            createdAt: new Date().toISOString(),
            _count: { chunks: 0 }
          },
          ...prev
        ])
        setPasteTitle('')
        setPasteContent('')
        alert('Document queued for ingestion!')
      } else {
        alert('Failed to submit document')
      }
    } catch (err) {
      console.error('Submit failed', err)
    } finally {
      setPasting(false)
    }
  }

  // File parsing & uploading logic
  const parseFileContent = async (file: File): Promise<string> => {
    if (file.name.toLowerCase().endsWith('.pdf')) {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString()
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const pages: string[] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ')
        if (pageText.trim()) pages.push(`[PAGE ${i}]\n${pageText}`)
      }
      return pages.join('\n\n')
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = () => reject(new Error('FileReader failed'))
      reader.readAsText(file)
    })
  }

  const processFiles = async (files: File[]) => {
    const validExtensions = ['txt', 'md', 'json', 'csv', 'pdf']

    const newQueueItems: QueueItem[] = files.map(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      const isValid = validExtensions.includes(ext)
      return {
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: file.size,
        type: ext,
        status: isValid ? 'pending' : 'failed',
        content: '',
        error: isValid ? undefined : 'Unsupported file type. Use .txt, .md, .json, or .csv'
      }
    })

    setQueue(prev => [...prev, ...newQueueItems])

    // Parse files that are pending
    for (const item of newQueueItems) {
      if (item.status === 'failed') continue

      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'parsing' } : q))
      try {
        const text = await parseFileContent(item.file)
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'ready', content: text } : q))
      } catch {
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'failed', error: 'Failed to read file contents' } : q))
      }
    }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files))
    }
  }

  const removeQueueItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id))
  }

  const clearQueue = () => {
    setQueue([])
  }

  const uploadQueue = async () => {
    const itemsToUpload = queue.filter(item => item.status === 'ready')
    if (itemsToUpload.length === 0) return

    // Mark them as uploading
    setQueue(prev =>
      prev.map(q =>
        itemsToUpload.some(u => u.id === q.id) ? { ...q, status: 'uploading' } : q
      )
    )

    // Parallel upload
    await Promise.all(
      itemsToUpload.map(async (item) => {
        try {
          const res = await fetch('/api/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: item.name,
              content: item.content,
              fileType: item.type,
              domain: uploadDomain,
            })
          })

          if (res.ok) {
            const newDoc = await res.json()
            setDocuments(prev => [
              {
                id: newDoc.id,
                title: newDoc.title,
                status: 'processing',
                fileType: item.type,
                domain: uploadDomain,
                createdAt: new Date().toISOString(),
                _count: { chunks: 0 }
              },
              ...prev
            ])
            setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'success' } : q))
          } else {
            setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'failed', error: 'API Error' } : q))
          }
        } catch {
          setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'failed', error: 'Upload Failed' } : q))
        }
      })
    )
  }

  // Stats calculation
  const totalDocs = documents.length
  const totalChunks = documents.reduce((sum, d) => sum + (d._count?.chunks || 0), 0)
  const readyCount = documents.filter(d => d.status === 'ready').length
  const processingCount = documents.filter(d => d.status === 'processing').length
  const failedCount = documents.filter(d => d.status === 'failed').length

  // Filter & search documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Manual Paste Words / Chunk Estimation
  const pasteWords = pasteContent.trim() ? pasteContent.trim().split(/\s+/).length : 0
  const estimatedChunks = Math.max(1, Math.ceil(pasteWords / 400))

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
              className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-[12px] font-medium transition-colors duration-150 cursor-pointer text-[#A8B4C8] hover:text-[#EEE9DF] hover:bg-[#2D4070]/30"
            >
              <IconChat /> Chat Assistant
            </Link>
            <Link
              href="/ingest"
              className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-[12px] font-medium transition-colors duration-150 cursor-pointer bg-[#2D4070] text-[#EEE9DF]"
            >
              <IconDoc /> Data Ingestion
            </Link>
          </div>
        </div>

        {/* Quick Help */}
        <div className="p-5 mt-auto text-[11px] leading-relaxed text-[#A8B4C8]/80 border-t border-[#2D4070]">
          <p className="font-semibold text-[#EEE9DF] mb-1">Knowledge Ingest</p>
          <p>Upload laws, acts, or contracts. They will be parsed, chunked, and embedded into vector space automatically for context-grounded AI responses.</p>
        </div>
      </aside>

      {/* ════════════════════ MAIN PANEL */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#FAF8F4] overflow-y-auto scroll-area">
        
        {/* Header */}
        <header className="h-14 shrink-0 flex items-center justify-between px-8 border-b border-app-border bg-app-surface">
          <h2 className="text-[17px] font-semibold text-app-text font-display">
            Data Ingestion Dashboard
          </h2>
          <div className="text-[11px] text-app-text-subtle font-mono">
            RAG Admin Panel
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full space-y-8">

          {/* ════════════════════ STATS OVERVIEW */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-app-surface border border-app-border rounded-sm p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold tracking-widest text-app-text-subtle uppercase">Total Docs</span>
              <span className="text-2xl font-bold text-app-text font-display mt-2">{totalDocs}</span>
            </div>
            <div className="bg-app-surface border border-app-border rounded-sm p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold tracking-widest text-app-text-subtle uppercase">Total Chunks</span>
              <span className="text-2xl font-bold text-app-text font-display mt-2">{totalChunks}</span>
            </div>
            <div className="bg-app-surface border border-app-border rounded-sm p-4 shadow-sm flex flex-col justify-between border-l-4 border-l-emerald-500">
              <span className="text-[10px] font-bold tracking-widest text-app-text-subtle uppercase">Ready</span>
              <span className="text-2xl font-bold text-emerald-600 font-display mt-2">{readyCount}</span>
            </div>
            <div className="bg-app-surface border border-app-border rounded-sm p-4 shadow-sm flex flex-col justify-between border-l-4 border-l-amber-500">
              <span className="text-[10px] font-bold tracking-widest text-app-text-subtle uppercase">Indexing</span>
              <span className="text-2xl font-bold text-amber-600 font-display mt-2">{processingCount}</span>
            </div>
            <div className="bg-app-surface border border-app-border rounded-sm p-4 shadow-sm flex flex-col justify-between border-l-4 border-l-red-500">
              <span className="text-[10px] font-bold tracking-widest text-app-text-subtle uppercase">Failed</span>
              <span className="text-2xl font-bold text-red-600 font-display mt-2">{failedCount}</span>
            </div>
          </div>

          {/* ════════════════════ INGESTION PANEL */}
          <div className="bg-app-surface border border-app-border rounded-sm shadow-sm overflow-hidden">
            {/* Tabs Bar */}
            <div className="flex border-b border-app-border bg-[#FDFCFB]">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-3.5 text-xs font-semibold tracking-wide border-r border-app-border transition-colors cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-app-surface border-t-2 border-t-app-accent text-app-text'
                    : 'text-app-text-muted hover:bg-app-surface-hover hover:text-app-text'
                }`}
              >
                Upload Documents
              </button>
              <button
                onClick={() => setActiveTab('paste')}
                className={`px-6 py-3.5 text-xs font-semibold tracking-wide border-r border-app-border transition-colors cursor-pointer ${
                  activeTab === 'paste'
                    ? 'bg-app-surface border-t-2 border-t-app-accent text-app-text'
                    : 'text-app-text-muted hover:bg-app-surface-hover hover:text-app-text'
                }`}
              >
                Paste Plain Text
              </button>
            </div>

            {/* Tab: Upload */}
            {activeTab === 'upload' && (
              <div className="p-6 space-y-6">
                {/* Domain selector */}
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-bold uppercase tracking-widest text-app-text-subtle">Legal Domain Namespace</label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {DOMAINS.map((d) => (
                      <button
                        key={d.slug}
                        type="button"
                        onClick={() => setUploadDomain(d.slug)}
                        className={`px-3 py-2 rounded-sm text-[11px] font-medium border transition-all cursor-pointer text-center ${
                          uploadDomain === d.slug
                            ? 'border-[#1E2E4F] bg-[#1E2E4F] text-[#EEE9DF]'
                            : 'border-app-border bg-[#FDFCFB] text-app-text-muted hover:border-app-border-strong hover:text-app-text'
                        }`}
                      >
                        <span className="text-[14px] block mb-0.5">{d.icon}</span>
                        <span>{d.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-app-text-subtle">All files in this upload batch will be indexed into the selected namespace.</p>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-sm p-8 text-center transition-all cursor-pointer ${
                    isDragOver
                      ? 'border-app-accent bg-app-accent-light/40'
                      : 'border-app-border hover:border-app-border-strong bg-[#FDFCFB]'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    multiple
                    accept=".txt,.md,.json,.csv,.pdf"
                    className="hidden"
                  />
                  <IconUpload />
                  <p className="text-xs font-semibold text-app-text mb-1">
                    Drag and drop your files here, or <span className="text-app-accent hover:underline">browse files</span>
                  </p>
                  <p className="text-[10px] text-app-text-subtle">
                    Supports .pdf, .txt, .md, .json, and .csv files. Larger documents will be chunked automatically.
                  </p>
                </div>

                {/* Queue list */}
                {queue.length > 0 && (
                  <div className="border border-app-border rounded-sm overflow-hidden bg-[#FDFCFB] space-y-0">
                    <div className="px-4 py-2 border-b border-app-border bg-[#F5F1EB] flex justify-between items-center">
                      <span className="text-[10.5px] font-bold text-app-text-muted uppercase tracking-wider">Upload Queue ({queue.length})</span>
                      <div className="flex gap-2">
                        <button
                          onClick={clearQueue}
                          className="text-[10.5px] font-semibold text-app-text-muted hover:text-red-600 transition-colors"
                        >
                          Clear Queue
                        </button>
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-app-border">
                      {queue.map((item) => (
                        <div key={item.id} className="p-3 flex items-center justify-between hover:bg-app-surface transition-all text-xs">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="px-2 py-0.5 rounded-sm font-mono text-[9px] uppercase font-bold shrink-0" style={{ backgroundColor: '#E8ECF4', color: '#1E2E4F' }}>
                              {item.type}
                            </span>
                            <span className="font-medium text-app-text truncate max-w-sm">{item.name}</span>
                            <span className="text-[10px] text-app-text-subtle shrink-0">({(item.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          
                          <div className="flex items-center gap-4 shrink-0 ml-4">
                            {item.status === 'pending' && <span className="text-[10px] text-app-text-subtle font-medium">Pending</span>}
                            {item.status === 'parsing' && <span className="text-[10px] text-amber-500 font-medium animate-pulse">Parsing…</span>}
                            {item.status === 'ready' && <span className="text-[10px] text-emerald-600 font-medium">Ready</span>}
                            {item.status === 'uploading' && <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1.5"><IconLoading /> Uploading…</span>}
                            {item.status === 'success' && <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><IconCheck /> Ingested</span>}
                            {item.status === 'failed' && (
                              <span className="text-[10px] text-red-500 font-medium flex items-center gap-1" title={item.error}>
                                <IconAlert /> Failed
                              </span>
                            )}
                            
                            <button
                              onClick={() => removeQueueItem(item.id)}
                              disabled={item.status === 'uploading'}
                              className="text-app-text-subtle hover:text-red-500 disabled:opacity-35 transition-colors p-1"
                            >
                              <IconX />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3 bg-[#FAF8F4] border-t border-app-border flex justify-end">
                      <button
                        onClick={uploadQueue}
                        disabled={queue.filter(q => q.status === 'ready').length === 0}
                        className="px-4 py-2 bg-app-accent hover:bg-app-accent-hover disabled:opacity-40 text-[#EEE9DF] text-xs font-semibold rounded-sm transition-all cursor-pointer shadow-sm disabled:cursor-not-allowed"
                      >
                        Ingest {queue.filter(q => q.status === 'ready').length} Ready Files
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Paste Plain Text */}
            {activeTab === 'paste' && (
              <form onSubmit={handlePasteSubmit} className="p-6 space-y-4">
                {/* Domain selector */}
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-bold uppercase tracking-widest text-app-text-subtle">Legal Domain Namespace</label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
                    {DOMAINS.map((d) => (
                      <button
                        key={d.slug}
                        type="button"
                        onClick={() => setPasteDomain(d.slug)}
                        className={`px-3 py-2 rounded-sm text-[11px] font-medium border transition-all cursor-pointer text-center ${
                          pasteDomain === d.slug
                            ? 'border-[#1E2E4F] bg-[#1E2E4F] text-[#EEE9DF]'
                            : 'border-app-border bg-[#FDFCFB] text-app-text-muted hover:border-app-border-strong hover:text-app-text'
                        }`}
                      >
                        <span className="text-[14px] block mb-0.5">{d.icon}</span>
                        <span>{d.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold uppercase tracking-widest text-app-text-subtle">Document Title</label>
                  <input
                    value={pasteTitle}
                    onChange={(e) => setPasteTitle(e.target.value)}
                    required
                    placeholder="e.g. Labor Act 2074 - Section 3"
                    className="w-full px-4 py-2.5 border border-app-border bg-[#FDFCFB] text-xs rounded-sm outline-none focus:border-app-border-strong text-app-text"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold uppercase tracking-widest text-app-text-subtle">Text Content</label>
                  <textarea
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    required
                    rows={8}
                    placeholder="Paste the raw text of the document here..."
                    className="w-full px-4 py-3 border border-app-border bg-[#FDFCFB] text-xs rounded-sm outline-none resize-none focus:border-app-border-strong text-app-text leading-relaxed font-sans"
                  />
                  <div className="flex justify-between items-center text-[10px] text-app-text-subtle pt-1 font-mono">
                    <span>{pasteWords} words · {pasteContent.length} chars</span>
                    <span>Est. Chunks: ~{estimatedChunks} (400 words/chunk)</span>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={pasting || !pasteTitle.trim() || !pasteContent.trim()}
                    className="px-4 py-2 bg-app-accent hover:bg-app-accent-hover disabled:opacity-45 text-[#EEE9DF] text-xs font-semibold rounded-sm transition-all cursor-pointer shadow-sm flex items-center gap-2"
                  >
                    {pasting ? <IconLoading /> : <IconPlus />} {pasting ? 'Ingesting…' : 'Add to Knowledge Base'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ════════════════════ DOCUMENT CATALOG */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-app-text font-display">Document Catalog</h3>
              <button
                onClick={loadDocuments}
                className="text-xs text-app-text-subtle hover:text-app-text flex items-center gap-1 transition-colors"
              >
                Refresh
              </button>
            </div>

            {/* Catalog Filters */}
            <div className="flex items-center gap-4 bg-app-surface border border-app-border p-3 rounded-sm shadow-sm">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <IconSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search documents by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-transparent text-xs outline-none text-app-text placeholder:text-app-text-subtle"
                />
              </div>

              <div className="h-6 w-[1px] bg-app-border" />

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold text-app-text-subtle uppercase tracking-wider mr-2">Filter:</span>
                {['all', 'ready', 'processing', 'failed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-sm text-[11px] font-medium uppercase tracking-wide transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-app-accent text-[#EEE9DF] shadow-sm'
                        : 'bg-app-accent-light text-app-accent hover:bg-app-accent-light/80'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog List */}
            <div className="bg-app-surface border border-app-border rounded-sm shadow-sm overflow-hidden">
              {loadingDocs ? (
                <div className="p-16 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-app-accent border-t-transparent" />
                  <p className="text-xs text-app-text-subtle mt-3 font-medium">Loading catalog...</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="p-16 text-center bg-[#FDFCFB]">
                  <p className="text-xs text-app-text-subtle italic">No documents found matching the search/filter criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F5F1EB] border-b border-app-border text-app-text-muted uppercase text-[9.5px] font-bold tracking-wider">
                        <th className="py-3 px-5">Document Title</th>
                        <th className="py-3 px-4 w-28">Domain</th>
                        <th className="py-3 px-4 w-24">Type</th>
                        <th className="py-3 px-4 w-32">Status</th>
                        <th className="py-3 px-4 w-24 text-center">Chunks</th>
                        <th className="py-3 px-4 w-40">Upload Date</th>
                        <th className="py-3 px-4 w-24 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border bg-[#FDFCFB]">
                      {filteredDocuments.map((doc) => {
                        const domainConfig = DOMAINS.find(d => d.slug === doc.domain)
                        return (
                        <tr
                          key={doc.id}
                          onClick={() => handleDocClick(doc)}
                          className="hover:bg-app-surface transition-all cursor-pointer group"
                        >
                          <td className="py-3.5 px-5 font-medium text-app-text truncate max-w-xs">{doc.title}</td>
                          <td className="py-3.5 px-4">
                            {domainConfig ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: '#E8ECF4', color: '#1E2E4F' }}>
                                {domainConfig.icon} {domainConfig.label}
                              </span>
                            ) : (
                              <span className="text-[10px] text-app-text-subtle font-mono">general</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[10px] uppercase font-bold text-app-text-subtle">{doc.fileType || 'text'}</td>
                          <td className="py-3.5 px-4">
                            {doc.status === 'ready' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ready
                              </span>
                            )}
                            {doc.status === 'processing' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Indexing…
                              </span>
                            )}
                            {doc.status === 'failed' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Failed
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-medium text-app-text-muted">
                            {doc.status === 'ready' ? doc._count.chunks : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-app-text-subtle">
                            {new Date(doc.createdAt).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={(e) => handleDeleteDoc(doc.id, e)}
                              className="text-app-text-subtle hover:text-red-600 transition-colors p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Delete document"
                            >
                              <IconTrash />
                            </button>
                          </td>
                        </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* ════════════════════ SLIDE-OUT DETAIL DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer content panel */}
          <div className="relative w-full max-w-2xl h-full bg-[#FAF8F4] shadow-2xl flex flex-col z-10 border-l border-app-border animate-slide-in">
            {/* Drawer Header */}
            <div className="h-16 px-6 border-b border-app-border flex items-center justify-between bg-app-surface">
              <div className="min-w-0">
                <span className="text-[9.5px] font-bold text-app-text-subtle uppercase tracking-widest">Document Details</span>
                <h3 className="text-sm font-semibold text-app-text truncate font-display mt-0.5">
                  {selectedDoc?.title || 'Loading...'}
                </h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-app-text-subtle hover:text-app-text transition-colors cursor-pointer"
              >
                <IconX />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto scroll-area p-6 space-y-6">
              {loadingDetail ? (
                <div className="h-full flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-app-accent border-t-transparent" />
                </div>
              ) : selectedDoc ? (
                <>
                  {/* Meta Cards Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-app-surface border border-app-border rounded-sm p-4 text-xs">
                      <p className="text-[9.5px] font-bold text-app-text-subtle uppercase tracking-wider mb-2">Ingestion Status</p>
                      <div className="flex items-center gap-2">
                        {selectedDoc.status === 'ready' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Ready</span>
                        )}
                        {selectedDoc.status === 'processing' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 animate-pulse">Indexing</span>
                        )}
                        {selectedDoc.status === 'failed' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800">Failed</span>
                        )}
                        <span className="text-[10px] text-app-text-subtle">({selectedDoc.fileType})</span>
                      </div>
                    </div>
                    <div className="bg-app-surface border border-app-border rounded-sm p-4 text-xs">
                      <p className="text-[9.5px] font-bold text-app-text-subtle uppercase tracking-wider mb-2">Vector Statistics</p>
                      <p className="font-semibold text-app-text">{selectedDoc.chunks?.length || 0} Total Chunks</p>
                      {selectedDoc.nullEmbedCount > 0 && (
                        <p className="text-[10px] text-amber-600 font-semibold mt-0.5">{selectedDoc.nullEmbedCount} missing embeddings</p>
                      )}
                      <p className="text-[10px] text-app-text-subtle mt-0.5">Model: gemini-embedding-2 (768d)</p>
                    </div>
                    <div className="bg-app-surface border border-app-border rounded-sm p-4 text-xs col-span-2">
                      <p className="text-[9.5px] font-bold text-app-text-subtle uppercase tracking-wider mb-1">Database Identifier</p>
                      <code className="text-[10px] font-mono text-app-accent select-all">{selectedDoc.id}</code>
                    </div>
                  </div>

                  {/* Chunks List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-app-text-muted">Splits & Embedding Preview</h4>
                    
                    {selectedDoc.chunks && selectedDoc.chunks.length > 0 ? (
                      <div className="space-y-4">
                        {selectedDoc.chunks.map((chunk, idx) => (
                          <div key={chunk.id} className="bg-app-surface border border-app-border rounded-sm p-4 shadow-sm space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-mono text-app-text-subtle border-b border-app-border pb-1.5">
                              <span>Chunk {idx + 1} of {selectedDoc.chunks.length}</span>
                              <span>ID: {chunk.id}</span>
                            </div>
                            
                            <p className="text-xs text-app-text leading-relaxed whitespace-pre-wrap font-sans bg-[#FDFCFB] p-3 rounded-sm border border-app-border">
                              {chunk.content}
                            </p>

                            <div className="space-y-1.5 pt-1">
                              <span className="text-[9px] font-bold text-app-text-subtle uppercase tracking-wider block">Simulated Vector Embedding (768 Dimensions)</span>
                              <div className="flex flex-wrap gap-1 font-mono text-[9px] bg-app-accent-light p-2 rounded-sm text-app-accent border border-app-border-strong select-none">
                                <span>[</span>
                                {[...Array(12)].map((_, i) => {
                                  // Seed a deterministic pseudo-random float based on chunk.id + dimension index
                                  const seed = chunk.id.charCodeAt(i % chunk.id.length) * (i + 1)
                                  const val = ((Math.sin(seed) * 10000) % 1).toFixed(4)
                                  return (
                                    <span key={i} className="text-app-accent font-medium">
                                      {val},
                                    </span>
                                  )
                                })}
                                <span className="opacity-50 font-semibold italic">... 756 more dimensions]</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-app-surface border border-app-border rounded-sm p-8 text-center text-xs text-app-text-subtle italic">
                        {selectedDoc.status === 'processing' ? 'Splits and embeddings are being generated...' : 'No chunks generated for this document.'}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-app-text-subtle italic">
                  Document detail could not be loaded.
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="h-16 px-6 border-t border-app-border flex items-center justify-between bg-[#F5F1EB] shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteDoc(selectedDocId!)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-sm border border-red-300 hover:border-red-500 bg-transparent text-red-700 hover:bg-red-50 text-xs font-semibold transition-all cursor-pointer"
                >
                  <IconTrash /> Delete Document
                </button>
                {selectedDoc && selectedDoc.nullEmbedCount > 0 && (
                  <button
                    onClick={handleReEmbed}
                    disabled={reEmbedding}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-sm border border-amber-400 hover:border-amber-600 bg-transparent text-amber-700 hover:bg-amber-50 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {reEmbedding ? <IconLoading /> : null}
                    {reEmbedding ? 'Re-embedding…' : `Re-embed ${selectedDoc.nullEmbedCount} chunks`}
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 bg-app-accent hover:bg-app-accent-hover text-[#EEE9DF] text-xs font-semibold rounded-sm transition-all cursor-pointer shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Animations Helper CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

    </div>
  )
}
