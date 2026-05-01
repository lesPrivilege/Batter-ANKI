import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import CardEditor from '../components/CardEditor'
import { getDeck, getCards, addCard, updateCard, deleteCard, deleteCards, deleteDeck } from '../lib/storage'

function buildOutline(cards) {
  const map = new Map()
  for (const card of cards) {
    const ch = card.chapter || ''
    if (!map.has(ch)) map.set(ch, new Map())
    const secMap = map.get(ch)
    const sec = card.section || ''
    if (!secMap.has(sec)) secMap.set(sec, [])
    secMap.get(sec).push(card)
  }
  return map
}

export default function DeckDetail() {
  const { id } = useParams()
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [showEditor, setShowEditor] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [expandedChapters, setExpandedChapters] = useState(new Set())
  const [expandedSections, setExpandedSections] = useState(new Set())

  const refresh = () => {
    setDeck(getDeck(id))
    setCards(getCards(id))
  }

  useEffect(refresh, [id])

  const outline = useMemo(() => buildOutline(cards), [cards])

  const toggleChapter = (ch) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev)
      if (next.has(ch)) next.delete(ch)
      else next.add(ch)
      return next
    })
  }

  const toggleSection = (key) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleAdd = (front, back) => {
    addCard(id, front, back)
    setShowEditor(false)
    refresh()
  }

  const handleEdit = (front, back) => {
    updateCard(editingCard.id, { front, back })
    setEditingCard(null)
    refresh()
  }

  const handleDelete = (cardId) => {
    deleteCard(cardId)
    refresh()
  }

  const handleDeleteDeck = () => {
    if (confirm('Delete this deck and all cards?')) {
      deleteDeck(id)
      window.location.href = '/'
    }
  }

  const toggleSelect = (cardId) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId)
      else next.add(cardId)
      return next
    })
  }

  const handleBatchDelete = () => {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} card(s)?`)) return
    deleteCards([...selected])
    setSelected(new Set())
    setEditing(false)
    refresh()
  }

  const exitEdit = () => {
    setEditing(false)
    setSelected(new Set())
  }

  if (!deck) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg text-ink-2">
        Deck not found
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center px-4 h-12
        bg-bg-card border-b border-border">
        <Link to="/" className="text-ink-2 text-sm mr-3">←</Link>
        <h1 className="flex-1 text-lg font-serif font-bold text-ink truncate">
          {deck.name}
        </h1>
        {editing ? (
          <button onClick={exitEdit} className="text-sm text-ink-2 shrink-0">
            Done
          </button>
        ) : (
          <button
            onClick={handleDeleteDeck}
            className="text-danger text-sm shrink-0"
          >
            Delete
          </button>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 max-w-[480px] w-full mx-auto space-y-4">
        {/* Actions */}
        {!editing && (
          <div className="flex gap-2">
            <button
              onClick={() => { setShowEditor(!showEditor); setEditingCard(null) }}
              className="flex-1 py-2.5 rounded-lg font-medium text-sm font-ui
                border border-accent text-accent active:scale-[0.97] transition-transform"
            >
              {showEditor ? 'Close' : '+ New Card'}
            </button>
            <Link
              to={`/review/${id}`}
              className="px-4 py-2.5 rounded-lg font-medium text-sm font-ui
                border border-success text-success active:scale-[0.97] transition-transform"
            >
              Review
            </Link>
            {cards.length > 0 && (
              <Link
                to={`/browse/${id}`}
                className="px-4 py-2.5 rounded-lg font-medium text-sm font-ui
                  border border-border text-ink active:scale-[0.97] transition-transform"
              >
                Browse
              </Link>
            )}
            {cards.length > 0 && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2.5 rounded-lg font-medium text-sm font-ui
                  border border-border text-ink-2 active:scale-[0.97] transition-transform"
              >
                Edit
              </button>
            )}
            <Link
              to="/prompt-guide"
              className="px-4 py-2.5 rounded-lg font-medium text-sm font-ui
                border border-border text-ink-2 active:scale-[0.97] transition-transform"
            >
              制卡指南
            </Link>
          </div>
        )}

        {/* Editor */}
        {showEditor && (
          <div className="p-4 rounded-lg border border-border bg-bg-card">
            <CardEditor onSave={handleAdd} onCancel={() => setShowEditor(false)} />
          </div>
        )}

        {/* Batch delete bar — edit mode only */}
        {editing && (
          <div className="flex gap-2">
            {selected.size > 0 && (
              <button
                onClick={handleBatchDelete}
                className="flex-1 py-2.5 rounded-lg font-ui text-sm text-danger
                  border border-danger/30 active:scale-[0.97] transition-transform"
              >
                Delete ({selected.size})
              </button>
            )}
            <button
              onClick={() => {
                if (!confirm(`Delete ALL ${cards.length} cards in this deck?`)) return
                deleteCards(cards.map((c) => c.id))
                setSelected(new Set())
                setEditing(false)
                refresh()
              }}
              className="flex-1 py-2.5 rounded-lg font-ui text-sm text-danger
                border border-danger/30 active:scale-[0.97] transition-transform"
            >
              Delete All
            </button>
          </div>
        )}

        {/* Outline view */}
        {cards.length === 0 ? (
          <p className="text-center text-ink-2 py-8 text-sm">
            No cards yet.
          </p>
        ) : (
          <div className="space-y-1">
            {[...outline.entries()].map(([chapter, secMap]) => {
              const chapterKey = chapter || '__uncategorized__'
              const chapterCount = [...secMap.values()].reduce((sum, arr) => sum + arr.length, 0)
              const isChapterOpen = expandedChapters.has(chapterKey)

              return (
                <div key={chapterKey}>
                  {/* Chapter row */}
                  <button
                    onClick={() => toggleChapter(chapterKey)}
                    className="w-full flex items-center gap-2 py-2 px-2 rounded-lg
                      text-left hover:bg-bg-raised transition-colors"
                  >
                    <span className="text-ink-2 text-xs w-4 text-center shrink-0">
                      {isChapterOpen ? '▼' : '▶'}
                    </span>
                    <span className="font-medium text-ink text-sm font-ui flex-1 truncate">
                      {chapter || '未分类'}
                    </span>
                    <span className="text-xs text-ink-2 font-serif shrink-0">
                      {chapterCount}
                    </span>
                  </button>

                  {/* Chapter content */}
                  {isChapterOpen && (
                    <div className="ml-4 space-y-1">
                      {[...secMap.entries()].map(([section, sectionCards]) => {
                        const sectionKey = `${chapterKey}::${section}`
                        const isSectionOpen = expandedSections.has(sectionKey)

                        if (!section) {
                          // No section — cards hang directly under chapter
                          return (
                            <div key={sectionKey} className="ml-4 space-y-1">
                              {sectionCards.map((card) => (
                                <CardRow
                                  key={card.id}
                                  card={card}
                                  editing={editing}
                                  selected={selected.has(card.id)}
                                  onToggleSelect={() => toggleSelect(card.id)}
                                  onEdit={() => setEditingCard(card)}
                                  onDelete={() => handleDelete(card.id)}
                                  isEditingThis={editingCard?.id === card.id}
                                  onSave={handleEdit}
                                  onCancel={() => setEditingCard(null)}
                                />
                              ))}
                            </div>
                          )
                        }

                        return (
                          <div key={sectionKey}>
                            {/* Section row */}
                            <button
                              onClick={() => toggleSection(sectionKey)}
                              className="w-full flex items-center gap-2 py-1.5 px-2 rounded-lg
                                text-left hover:bg-bg-raised transition-colors"
                            >
                              <span className="text-ink-2 text-xs w-4 text-center shrink-0">
                                {isSectionOpen ? '▼' : '▶'}
                              </span>
                              <span className="text-ink-2 text-sm font-ui flex-1 truncate">
                                {section}
                              </span>
                              <span className="text-xs text-ink-2 font-serif shrink-0">
                                {sectionCards.length}
                              </span>
                            </button>

                            {/* Section cards */}
                            {isSectionOpen && (
                              <div className="ml-4 space-y-1">
                                {sectionCards.map((card) => (
                                  <CardRow
                                    key={card.id}
                                    card={card}
                                    editing={editing}
                                    selected={selected.has(card.id)}
                                    onToggleSelect={() => toggleSelect(card.id)}
                                    onEdit={() => setEditingCard(card)}
                                    onDelete={() => handleDelete(card.id)}
                                    isEditingThis={editingCard?.id === card.id}
                                    onSave={handleEdit}
                                    onCancel={() => setEditingCard(null)}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

function CardRow({ card, editing, selected, onToggleSelect, onEdit, onDelete, isEditingThis, onSave, onCancel }) {
  if (isEditingThis) {
    return (
      <div className="p-2 rounded-lg border border-accent bg-accent/5">
        <CardEditor initial={card} onSave={onSave} onCancel={onCancel} />
      </div>
    )
  }

  if (editing) {
    return (
      <div
        onClick={onToggleSelect}
        className={`flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer transition-colors
          ${selected ? 'bg-accent/5 border border-accent' : 'border border-border hover:bg-bg-raised'}`}
      >
        <div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center
          ${selected ? 'bg-accent border-accent' : 'border-border'}`}>
          {selected && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-sm text-ink truncate flex-1">{card.front}</span>
        {(card.type || 'recall') === 'reference' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-ink-2/30 text-ink-2 shrink-0">ref</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 py-2 px-2 rounded-lg
      hover:bg-bg-raised transition-colors group">
      <span className="text-sm text-ink truncate flex-1">{card.front}</span>
      {(card.type || 'recall') === 'reference' && (
        <span className="text-[10px] px-1.5 py-0.5 rounded border border-ink-2/30 text-ink-2 shrink-0">ref</span>
      )}
      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="text-xs px-1.5 py-0.5 rounded border border-border text-ink-2"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-xs px-1.5 py-0.5 rounded border border-danger/30 text-danger"
        >
          Del
        </button>
      </div>
    </div>
  )
}
