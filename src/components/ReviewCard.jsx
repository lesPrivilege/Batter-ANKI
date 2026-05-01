import { useState, useEffect, useRef } from 'react'

// Props: card, onRate(quality)
export default function ReviewCard({ card, onRate }) {
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
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {/* Card with flip */}
      <button
        ref={cardRef}
        onClick={handleClick}
        className="w-full min-h-[240px] rounded-lg border border-border bg-bg-surface
          p-6 flex items-center justify-center
          text-center text-base font-body cursor-pointer select-none
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
          {flipped ? (
            <span className="text-accent">{card.back}</span>
          ) : (
            <span className="text-text-primary">{card.front}</span>
          )}
        </span>
      </button>

      {/* Rating buttons only show when flipped */}
      {flipped && (
        <div className="flex gap-2 w-full">
          <button
            onClick={() => handleRate(1)}
            className="flex-1 py-3 rounded-lg font-medium text-sm font-body
              bg-danger/15 text-danger border border-danger/30
              active:scale-[0.97] transition-all"
          >
            Again
          </button>
          <button
            onClick={() => handleRate(2)}
            className="flex-1 py-3 rounded-lg font-medium text-sm font-body
              bg-warning/15 text-warning border border-warning/30
              active:scale-[0.97] transition-all"
          >
            Hard
          </button>
          <button
            onClick={() => handleRate(4)}
            className="flex-1 py-3 rounded-lg font-medium text-sm font-body
              bg-accent/15 text-accent border border-accent/30
              active:scale-[0.97] transition-all"
          >
            Good
          </button>
          <button
            onClick={() => handleRate(5)}
            className="flex-1 py-3 rounded-lg font-medium text-sm font-body
              bg-success/15 text-success border border-success/30
              active:scale-[0.97] transition-all"
          >
            Easy
          </button>
        </div>
      )}

      {!flipped && (
        <p className="text-xs text-text-secondary">Tap to flip</p>
      )}
    </div>
  )
}
