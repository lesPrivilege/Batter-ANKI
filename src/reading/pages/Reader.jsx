// Reader — slim shell using extracted components
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDocument, updateReadingProgress, getReadingSettings, updateReadingSettings } from '../lib/storage'
import { renderDoc, extractToc } from '../lib/renderDoc'
import { getHighlightsByDoc, addHighlight, deleteHighlight } from '../lib/highlights'
import { getBookmarksByDoc, addBookmark, deleteBookmark } from '../lib/bookmarks'
import { startSession, endSession, markDocCompleted } from '../lib/stats'
import ReaderToolbar from '../components/ReaderToolbar'
import { TocPanel, HighlightsPanel, BookmarksPanel, SettingsPanel } from '../components/ReaderPanels'
import '../../styles/markdown.css'
import '../styles/reader.css'

export default function Reader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(null)
  const [html, setHtml] = useState('')
  const [toc, setToc] = useState([])
  const [settings, setSettings] = useState(getReadingSettings())
  const [activePanel, setActivePanel] = useState(null) // null | 'toc' | 'highlights' | 'bookmarks' | 'settings'
  const [showBars, setShowBars] = useState(true)
  const [scrollPct, setScrollPct] = useState(0)
  const [selection, setSelection] = useState(null)
  const [highlights, setHighlights] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [toast, setToast] = useState(null)
  const scrollRef = useRef(null)
  const hideTimer = useRef(null)
  const toastTimer = useRef(null)

  // ── Load document + session ─────────────────────────

  useEffect(() => {
    const d = getDocument(id)
    if (!d) { navigate('/reading'); return }
    setDoc(d)
    renderDoc(d.content, d.format).then(h => { setHtml(h); setToc(extractToc(h)) })
    setHighlights(getHighlightsByDoc(id))
    setBookmarks(getBookmarksByDoc(id))
    startSession(id)
    return () => endSession()
  }, [id, navigate])

  // ── Restore scroll ──────────────────────────────────

  useEffect(() => {
    if (!doc || !scrollRef.current) return
    const el = scrollRef.current
    el.scrollTop = (doc.scrollPct / 100) * (el.scrollHeight - el.clientHeight || 1)
    setScrollPct(doc.scrollPct || 0)
  }, [html])

  // ── Scroll + completion ─────────────────────────────

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !doc) return
    const el = scrollRef.current
    const pct = el.scrollHeight > el.clientHeight
      ? Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
      : 0
    setScrollPct(pct)
    updateReadingProgress(doc.id, pct)
    if (pct >= 100) markDocCompleted()
  }, [doc])

  // ── Auto-hide bars ──────────────────────────────────

  const resetHideTimer = useCallback(() => {
    setShowBars(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowBars(false), 3000)
  }, [])

  useEffect(() => { resetHideTimer(); return () => clearTimeout(hideTimer.current) }, [])

  // ── Panel management ────────────────────────────────

  const togglePanel = (panel) => {
    setActivePanel(prev => prev === panel ? null : panel)
  }

  const handleTapCenter = (e) => {
    if (e.target.closest('.reader-panel') || e.target.closest('.reader-settings')) return
    setShowBars(v => !v)
    if (!showBars) clearTimeout(hideTimer.current)
  }

  // ── Text selection → highlight ──────────────────────

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 1500)
  }, [])

  const getSelection = useCallback(() => {
    const sel = window.getSelection()
    const text = sel?.toString().trim()
    if (text && text.length > 0) {
      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setSelection({ text, rect })
    } else {
      setSelection(null)
    }
  }, [])

  const handleMouseUp = useCallback(() => setTimeout(getSelection, 10), [getSelection])
  const handleTouchEnd = useCallback(() => setTimeout(getSelection, 150), [getSelection])

  const handleSaveHighlight = () => {
    if (!selection || !doc) return
    // Use DOM textContent so snippet context matches what the reader sees (not raw markdown)
    const rendered = scrollRef.current?.textContent || doc.content || ''
    const idx = rendered.toLowerCase().indexOf(selection.text.toLowerCase())
    const start = Math.max(0, idx - 60)
    const end = Math.min(rendered.length, idx + selection.text.length + 60)
    const snippet = (start > 0 ? '...' : '') + rendered.slice(start, end) + (end < rendered.length ? '...' : '')
    addHighlight(doc.id, selection.text, snippet)
    setHighlights(getHighlightsByDoc(doc.id))
    setSelection(null)
    window.getSelection()?.removeAllRanges()
    showToast('已保存高亮')
  }

  // ── Handlers ────────────────────────────────────────

  const handleJumpToHeading = (headingId) => {
    document.getElementById(headingId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActivePanel(null)
  }

  const handleJumpToBookmark = (bm) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({
      top: (bm.scrollPct / 100) * (scrollRef.current.scrollHeight - scrollRef.current.clientHeight),
      behavior: 'smooth',
    })
    setActivePanel(null)
  }

  const handleDeleteHighlight = (hId) => { deleteHighlight(hId); setHighlights(getHighlightsByDoc(doc.id)) }
  const handleDeleteBookmark = (bId) => { deleteBookmark(bId); setBookmarks(getBookmarksByDoc(doc.id)) }
  const handleAddBookmark = () => { if (!doc) return; addBookmark(doc.id, scrollPct); setBookmarks(getBookmarksByDoc(doc.id)); showToast('已添加书签') }
  const handleUpdateSettings = (f) => { setSettings(updateReadingSettings(f)) }

  if (!doc) return null

  return (
    <div className="page-fixed" style={{ background: 'var(--bg)' }}>
      {/* Top progress bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--bg-raised)', zIndex: 10 }}>
        <div style={{ height: '100%', background: 'var(--accent)', width: `${scrollPct}%`, transition: 'width 150ms' }} />
      </div>

      <ReaderToolbar
        title={doc.title} showBars={showBars} activePanel={activePanel}
        bookmarks={bookmarks} selection={selection}
        onBack={() => navigate('/reading')} onTogglePanel={togglePanel}
        onAddBookmark={handleAddBookmark} onSaveHighlight={handleSaveHighlight}
      />

      {/* Panels */}
      <div className={`reader-panel ${activePanel === 'toc' ? 'open' : ''}`}>
        <TocPanel toc={toc} onJump={handleJumpToHeading} />
      </div>
      <div className={`reader-panel ${activePanel === 'highlights' ? 'open' : ''}`}>
        <HighlightsPanel highlights={highlights} onDelete={handleDeleteHighlight} />
      </div>
      <div className={`reader-panel ${activePanel === 'bookmarks' ? 'open' : ''}`}>
        <BookmarksPanel bookmarks={bookmarks} onJump={handleJumpToBookmark} onDelete={handleDeleteBookmark} />
      </div>
      <div className={`reader-panel right ${activePanel === 'settings' ? 'open' : ''}`} style={{ width: 200 }}>
        <SettingsPanel settings={settings} onUpdate={handleUpdateSettings} />
      </div>

      {/* Backdrop to close panels */}
      <div
        className={`reader-backdrop ${activePanel ? 'visible' : ''}`}
        style={{ position: 'fixed', inset: 0, zIndex: 14, background: 'rgba(0,0,0,0.15)' }}
        onClick={() => setActivePanel(null)}
      />

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto"
        onClick={handleTapCenter} onScroll={handleScroll}
        onMouseUp={handleMouseUp} onTouchEnd={handleTouchEnd}
        onMouseMove={resetHideTimer} onTouchStart={resetHideTimer}
        style={{ paddingBottom: 'max(40px, env(safe-area-inset-bottom))' }}>
        <div className="card-content" style={{
          maxWidth: 680, margin: '0 auto', padding: settings.margins,
          fontSize: settings.fontSize, lineHeight: settings.lineHeight,
        }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {/* Bottom progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: 'var(--bg-raised)', transition: 'opacity 200ms',
        opacity: showBars ? 1 : 0, zIndex: 5,
      }}>
        <div style={{ height: '100%', background: 'var(--accent)', width: `${scrollPct}%`, transition: 'width 200ms' }} />
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--ink)', color: 'var(--bg)',
          padding: '8px 16px', borderRadius: 999, fontSize: 12,
          fontFamily: 'var(--font-zh)', boxShadow: 'var(--shadow-md)', zIndex: 50,
          animation: 'fadeIn 150ms ease-out',
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}
