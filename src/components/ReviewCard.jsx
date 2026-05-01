import { useState, useEffect, useRef } from 'react'
import renderMarkdown from '../lib/renderMarkdown'
import '../styles/markdown.css'

// Props: card, onRate(quality), starred, onToggleStar
export default function ReviewCard({ card, onRate, starred, onToggleStar }) {
  const [flipped, setFlipped] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    setFlipped(false)
  }, [card.id])

  const handleClick = () => {
    if (!flipped) setFlipped(true)
  }

  const handleRate = (quality) => {
    setFlipped(false)
    onRate(quality)
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto relative">
      {/* Star button */}
      {onToggleStar && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleStar() }}
          className="absolute top-2 right-2 z-10 text-lg leading-none"
        >
          {starred ? '★' : '☆'}
        </button>
      )}
      {/* Card with flip */}
      <button
        ref={cardRef}
        onClick={handleClick}
        className="w-full min-h-[240px] rounded-lg border border-border bg-bg-card
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

      {!flipped && (
        <p className="text-xs text-ink-2">Tap to flip</p>
      )}
    </div>
  )
}
