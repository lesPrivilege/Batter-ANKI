import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ReviewCard from '../components/ReviewCard'
import { getDueCards } from '../lib/scheduler'
import { updateCardSM2 } from '../lib/storage'
import { sm2 } from '../lib/sm2'

function predictInterval(card, quality) {
  const result = sm2(card, quality)
  return result.interval
}

export default function Review() {
  const { id } = useParams()
  const [dueCards, setDueCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setDueCards(getDueCards(id))
  }, [id])

  const handleRate = (quality) => {
    const card = dueCards[currentIndex]
    const result = sm2(card, quality)
    updateCardSM2(card.id, result)

    if (currentIndex + 1 < dueCards.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setDueCards([])
    }
  }

  // Done screen
  if (dueCards.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-bg">
        <header className="sticky top-0 z-10 flex items-center px-4 h-12
          bg-bg-card border-b border-border">
          <Link to="/" className="text-ink-2 text-sm">\u2190</Link>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
          <div className="text-4xl text-success">&#10003;</div>
          <h1 className="text-xl font-display font-bold text-ink">
            Done
          </h1>
          <div className="flex gap-2 mt-2">
            <Link
              to={`/deck/${id}`}
              className="px-6 py-2 rounded-lg border border-border text-ink-2 font-medium text-sm font-body
                active:scale-[0.97] transition-transform"
            >
              Back to deck
            </Link>
            <Link
              to="/"
              className="px-6 py-2 rounded-lg bg-accent text-white font-medium text-sm font-body
                active:scale-[0.97] transition-transform"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const card = dueCards[currentIndex]
  const remaining = dueCards.length - currentIndex

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 h-12
        bg-bg-card border-b border-border">
        <Link to="/" className="text-ink-2 text-sm">\u2190</Link>
        <span className="text-xs text-ink-2 font-display">
          {currentIndex + 1} / {dueCards.length}
        </span>
        <span className="w-6" />
      </header>

      {/* Progress bar */}
      <div className="h-[3px] w-full bg-border">
        <div
          className="h-full bg-accent transition-all duration-200"
          style={{ width: `${(currentIndex / dueCards.length) * 100}%` }}
        />
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <ReviewCard card={card} onRate={handleRate} />
      </div>

      {/* Bottom bar with interval previews */}
      <div className="flex gap-2 px-4 pb-4 max-w-[480px] w-full mx-auto">
        <button
          onClick={() => handleRate(1)}
          className="flex-1 py-3 rounded-lg font-medium text-sm font-body border transition-all active:scale-[0.97]
            bg-danger-bg text-danger border-danger/30"
        >
          <span className="block">Again</span>
          <span className="block text-[10px] text-ink-2 mt-0.5">{predictInterval(card, 1)}d</span>
        </button>
        <button
          onClick={() => handleRate(2)}
          className="flex-1 py-3 rounded-lg font-medium text-sm font-body border transition-all active:scale-[0.97]
            bg-warning-bg text-warning border-warning/30"
        >
          <span className="block">Hard</span>
          <span className="block text-[10px] text-ink-2 mt-0.5">{predictInterval(card, 2)}d</span>
        </button>
        <button
          onClick={() => handleRate(4)}
          className="flex-1 py-3 rounded-lg font-medium text-sm font-body border transition-all active:scale-[0.97]
            bg-accent-bg text-accent border-accent/30"
        >
          <span className="block">Good</span>
          <span className="block text-[10px] text-ink-2 mt-0.5">{predictInterval(card, 4)}d</span>
        </button>
        <button
          onClick={() => handleRate(5)}
          className="flex-1 py-3 rounded-lg font-medium text-sm font-body border transition-all active:scale-[0.97]
            bg-success-bg text-success border-success/30"
        >
          <span className="block">Easy</span>
          <span className="block text-[10px] text-ink-2 mt-0.5">{predictInterval(card, 5)}d</span>
        </button>
      </div>
    </div>
  )
}
