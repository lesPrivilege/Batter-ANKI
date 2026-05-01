import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { getCards } from '../lib/storage'
import renderMarkdown from '../lib/renderMarkdown'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Browse() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const cardRef = useRef(null)
  const touchStartX = useRef(null)

  useEffect(() => {
    setCards(shuffle(getCards(id)))
  }, [id])

  useEffect(() => {
    setFlipped(false)
  }, [currentIndex])

  const goNext = useCallback(() => {
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((i) => i + 1)
    }
  }, [currentIndex, cards.length])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
    }
  }, [currentIndex])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight') goNext()
    else if (e.key === 'ArrowLeft') goPrev()
    else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      setFlipped((f) => !f)
    }
  }, [goNext, goPrev])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 60) {
      if (dx > 0) goPrev()
      else goNext()
    }
    touchStartX.current = null
  }

  if (!cards.length) {
    return (
      <div className="flex flex-col min-h-screen bg-bg">
        <header className="sticky top-0 z-10 flex items-center px-4 h-12
          bg-bg-card border-b border-border">
          <button onClick={() => navigate(-1)} className="text-ink-2 text-sm mr-3">←</button>
          <h1 className="flex-1 text-lg font-serif font-bold text-ink">Browse</h1>
        </header>
        <div className="flex-1 flex items-center justify-center text-ink-2 text-sm">
          No cards in this deck.
        </div>
      </div>
    )
  }

  const card = cards[currentIndex]
  const isEnd = currentIndex === cards.length - 1 && flipped

  return (
    <div className="flex flex-col min-h-screen bg-bg page-enter">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 h-12
        bg-bg-card border-b border-border">
        <button onClick={() => navigate(-1)} className="text-ink-2 text-sm mr-3">←</button>
        <span className="text-xs text-ink-2 font-serif">
          {currentIndex + 1} / {cards.length}
        </span>
        <span className="w-6" />
      </header>

      {/* Breadcrumb */}
      {(card.chapter || card.section) && (
        <div className="text-xs text-ink-2 text-center">
          {card.chapter}{card.section && ` > ${card.section}`}
        </div>
      )}

      {/* Card area */}
      <div
        className="flex-1 flex items-center justify-center p-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          ref={cardRef}
          onClick={() => setFlipped((f) => !f)}
          className="w-full max-w-md min-h-[240px] rounded-lg border border-border bg-bg-card
            p-6 flex items-center justify-center
            text-center text-base font-ui cursor-pointer select-none
            transition-transform duration-300 ease-in-out"
          style={{
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          <span
            className="pointer-events-none"
            style={{
              backfaceVisibility: 'hidden',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div className="card-content" style={{ textAlign: 'center' }}>
              {flipped ? (
                <div className="text-accent" dangerouslySetInnerHTML={{ __html: renderMarkdown(card.back) }} />
              ) : (
                <div className="text-ink" dangerouslySetInnerHTML={{ __html: renderMarkdown(card.front) }} />
              )}
            </div>
          </span>
        </button>
      </div>

      {/* Tap hint */}
      {!flipped && (
        <p className="text-center text-xs text-ink-2 pb-2">Tap to flip</p>
      )}

      {/* End of cards */}
      {isEnd && (
        <div className="flex justify-center pb-6">
          <Link
            to={`/deck/${id}`}
            className="px-6 py-2 rounded-lg border border-border text-ink-2 font-medium text-sm font-ui
              active:scale-[0.97] transition-transform"
          >
            Back to deck
          </Link>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-2 px-4 pb-4 max-w-[480px] w-full mx-auto">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex-1 py-3 rounded-lg font-medium text-sm font-ui
            border border-border text-ink-2 active:scale-[0.97] transition-all
            disabled:opacity-30"
        >
          ← Prev
        </button>
        <button
          onClick={goNext}
          disabled={isEnd}
          className="flex-1 py-3 rounded-lg font-medium text-sm font-ui
            border border-border text-ink-2 active:scale-[0.97] transition-all
            disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
