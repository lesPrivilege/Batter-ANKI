// Reader toolbar — topbar + floating highlight button
import { BackIcon, BookmarkIcon, PencilIcon } from '../../components/Icons'

export default function ReaderToolbar({
  title, showBars, activePanel, bookmarks,
  onBack, onTogglePanel, onAddBookmark, onSaveHighlight, selection,
}) {
  const panels = [
    { key: 'toc', label: 'TOC' },
    { key: 'highlights', icon: 'pencil' },
    { key: 'bookmarks', icon: 'bookmark', count: bookmarks.length },
  ]

  return (
    <>
      {/* Topbar — auto-hide */}
      <div className="topbar" style={{
        transition: 'opacity 200ms, transform 200ms',
        opacity: showBars ? 1 : 0,
        transform: showBars ? 'translateY(0)' : 'translateY(-100%)',
        pointerEvents: showBars ? 'auto' : 'none',
        zIndex: 5,
      }}>
        <button onClick={onBack} className="tb-btn"><BackIcon /></button>
        <span className="tb-text" style={{ flex: 1, textAlign: 'center' }}>{title}</span>

        <button onClick={onAddBookmark} className="tb-btn"
          style={{ color: 'var(--ink-3)' }} title="添加书签">
          <BookmarkIcon size={16} />
        </button>

        {panels.map(p => (
          <button key={p.key}
            onClick={() => onTogglePanel(p.key)}
            className="tb-btn"
            style={{ color: activePanel === p.key ? 'var(--accent)' : 'var(--ink-3)' }}>
            {p.icon === 'pencil' ? (
              <PencilIcon size={16} />
            ) : p.icon === 'bookmark' ? (
              <BookmarkIcon size={16} filled={activePanel === p.key} />
            ) : p.count != null ? (
              <span className="font-mono text-[10px]">{p.count}</span>
            ) : (
              <span className="font-mono text-[11px]">{p.label}</span>
            )}
          </button>
        ))}
      </div>

      {/* Floating highlight save button */}
      {selection && (
        <button
          onClick={onSaveHighlight}
          className="fixed z-50 px-3.5 py-1.5 rounded-md font-zh text-[13px] font-medium shadow-lg"
          style={{
            background: 'var(--ink)', color: 'var(--bg)',
            border: '1px solid var(--border-strong)',
            left: Math.max(8, Math.min(selection.rect.left, window.innerWidth - 130)),
            top: Math.min(selection.rect.bottom + 8, window.innerHeight - 60),
            animation: 'fadeIn 150ms ease-out',
          }}>
          保存高亮
        </button>
      )}
    </>
  )
}
