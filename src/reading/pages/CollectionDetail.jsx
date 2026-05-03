import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { getCollection, getDocumentsByCollection, addDocument, deleteDocument, deleteCollection } from '../lib/storage'
import { readFileAsDocument } from '../lib/importer'
import { BackIcon, UploadIcon, PlusIcon, TrashIcon, MoreIcon } from '../../components/Icons'
import { useBackButton } from '../../lib/useBackButton'

export default function CollectionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { goBack } = useBackButton()
  const fileInputRef = useRef(null)

  const [col, setCol] = useState(null)
  const [docs, setDocs] = useState([])
  const [sortBy, setSortBy] = useState('recent')
  const [showNewDoc, setShowNewDoc] = useState(false)
  const [newDocTitle, setNewDocTitle] = useState('')
  const [newDocContent, setNewDocContent] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  const refresh = () => {
    setCol(getCollection(id))
    setDocs(getDocumentsByCollection(id))
  }

  useEffect(() => { refresh() }, [id])

  // ── Sort ───────────────────────────────────────────

  const sorted = [...docs]
  if (sortBy === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortBy === 'created') {
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } else {
    // recent: by lastReadAt descending (unread docs first via createdAt fallback)
    sorted.sort((a, b) => (b.lastReadAt || b.createdAt).localeCompare(a.lastReadAt || a.createdAt))
  }

  // ── Handlers ───────────────────────────────────────

  const handleFileImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { title, content, format } = await readFileAsDocument(file)
      addDocument(id, title, content, format)
      refresh()
    } catch { alert('文件导入失败，请检查文件格式') }
    e.target.value = ''
  }

  const handleAddDocument = (e) => {
    e.preventDefault()
    if (!newDocTitle.trim() || !newDocContent.trim()) return
    addDocument(id, newDocTitle.trim(), newDocContent.trim(), 'md')
    setNewDocTitle('')
    setNewDocContent('')
    setShowNewDoc(false)
    refresh()
  }

  const handleDeleteDocument = (docId) => {
    if (!confirm('删除这篇文档？此操作不可撤销。')) return
    deleteDocument(docId)
    refresh()
  }

  const handleDeleteCollection = () => {
    setShowMenu(false)
    if (!confirm(`删除集合「${col?.name}」及其所有文档？此操作不可撤销。`)) return
    deleteCollection(id)
    navigate('/reading')
  }

  // ── Not found ──────────────────────────────────────

  if (!col) {
    return (
      <div className="page-fill items-center justify-center text-ink-2">
        Collection not found
      </div>
    )
  }

  return (
    <div className="page-fill">
      {/* Topbar */}
      <header className="topbar">
        <button onClick={goBack} className="tb-btn"><BackIcon /></button>
        <h1 className="flex-1 font-zh text-[17px] font-medium text-ink truncate pl-1">{col.name}</h1>
        <div className="tb-actions">
          <div className="relative">
            <button onClick={() => setShowMenu(o => !o)} className="tb-btn" aria-haspopup="menu" aria-expanded={showMenu}>
              <MoreIcon />
            </button>
            {showMenu && (
              <>
                <button className="fixed inset-0 z-10 cursor-default" onClick={() => setShowMenu(false)} aria-label="Close menu" />
                <div className="absolute right-0 top-9 z-20 min-w-[168px] rounded-md bg-bg-card shadow-lg overflow-hidden"
                  role="menu" style={{ border: '1px solid var(--border-soft)' }}>
                  <button onClick={handleDeleteCollection}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-body text-danger hover:bg-bg-raised transition-colors" role="menuitem">
                    <TrashIcon size={15} /> 删除集合
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Stats */}
        <div style={{ padding: '14px 0 0' }}>
          <div className="dd-head">
            <div className="dd-meta">
              <span>{docs.length} 篇文档</span>
            </div>
          </div>
        </div>

        {/* Sort chips */}
        <div style={{ padding: '10px 0 0' }}>
          <div className="filters">
            {[{ key: 'recent', label: '最近' }, { key: 'title', label: '标题' }, { key: 'created', label: '创建' }].map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key)} className={`chip ${sortBy === s.key ? 'on' : ''}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Document list */}
        <div style={{ padding: '8px 0 24px' }}>
          {docs.length === 0 ? (
            <div className="empty">
              <div className="glyph">∅</div>
              <div className="msg">暂无文档</div>
              <div className="motto-zh">导入或新建文档</div>
            </div>
          ) : (
            <div className="card-list">
              {sorted.map(doc => (
                <div key={doc.id} className="card-row group"
                  onClick={() => navigate(`/reading/doc/${doc.id}`)}>
                  <span className="dot-bullet" />
                  <span className="front">{doc.title}</span>
                  <span className="font-mono text-[10px] text-ink-3 shrink-0">{doc.format.toUpperCase()}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id) }}
                    className="hidden group-hover:inline-flex items-center justify-center w-6 h-6 rounded text-ink-3 hover:text-danger transition-colors">
                    <TrashIcon size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New document form */}
        {showNewDoc && (
          <div className="mx-[18px] mb-4 p-4 rounded-md border bg-bg-card flex flex-col gap-3"
            style={{ borderColor: 'var(--border-soft)' }}>
            <div className="font-mono text-[10px] text-ink-3 tracking-wider uppercase">新建文档</div>
            <input value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)}
              placeholder="文档标题" autoFocus
              className="w-full py-[9px] px-3 rounded-md border bg-bg text-ink font-zh text-sm outline-none focus:border-accent"
              style={{ borderColor: 'var(--border)' }} />
            <textarea value={newDocContent} onChange={e => setNewDocContent(e.target.value)}
              placeholder="文档内容（Markdown）" rows={6}
              className="w-full p-3 rounded-md border bg-bg text-ink font-zh text-sm outline-none focus:border-accent resize-none"
              style={{ borderColor: 'var(--border)' }} />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowNewDoc(false)} className="btn btn-ghost">取消</button>
              <button onClick={handleAddDocument} disabled={!newDocTitle.trim() || !newDocContent.trim()}
                className="btn btn-primary disabled:opacity-40">创建</button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom bar */}
      <div className="flex-shrink-0 px-[18px] pb-[14px] flex flex-col gap-2" style={{ background: 'var(--bg)' }}>
        <div className="bottom-actions">
          <button onClick={() => fileInputRef.current?.click()} className="btn btn-ghost">
            <UploadIcon size={16} /> 导入文档
          </button>
          <button onClick={() => setShowNewDoc(v => !v)} className="btn btn-primary">
            <PlusIcon size={16} /> 新建文档
          </button>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept=".md,.tex,.txt" onChange={handleFileImport} className="hidden" />
    </div>
  )
}
