import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ReviewCard from '../components/ReviewCard'
import { getDueCards } from '../lib/scheduler'
import { getCards, updateCardSM2, toggleStar } from '../lib/storage'
import { sm2 } from '../lib/sm2'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function predictInterval(card, quality) {
  const result = sm2(card, quality)
  return result.interval
}

export default function Review() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reviewAll = searchParams.get('all') === 'true'
  const [dueCards, setDueCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 })

  useEffect(() => {
    if (reviewAll) {
      const allCards = getCards(id).filter(c => (c.type || 'recall') === 'recall')
      setDueCards(shuffle(allCards))
    } else {
      setDueCards(shuffle(getDueCards(id)))
    }
    setStats({ again: 0, hard: 0, good: 0, easy: 0 })
  }, [id, reviewAll])

  const handleRate = (quality) => {
    const card = dueCards[currentIndex]
    const result = sm2(card, quality)
    updateCardSM2(card.id, result)

    setStats(prev => {
      const next = { ...prev }
      if (quality === 1) next.again++
      else if (quality === 2) next.hard++
      else if (quality === 4) next.good++
      else if (quality === 5) next.easy++
      return next
    })

    if (currentIndex + 1 < dueCards.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setDueCards([])
    }
  }

  // Done screen
  if (dueCards.length === 0) {
    const total = stats.again + stats.hard + stats.good + stats.easy
    const correctRate = total > 0 ? Math.round((stats.good + stats.easy) / total * 100) : 0

    return (
      <div className="flex flex-col min-h-screen bg-bg">
        <header className="sticky top-0 z-10 flex items-center px-4 h-12
          bg-bg-card border-b border-border">
          <button onClick={() => navigate(-1)} className="text-ink-2 text-sm">←</button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
          <div className="text-4xl text-success">&#10003;</div>
          <h1 className="text-xl font-display font-bold text-ink">
            Done
          </h1>
          {total > 0 && (
            <div className="text-sm text-ink-2 font-ui space-y-1 text-center">
              <p>Total reviewed: <span className="text-ink font-medium">{total}</span></p>
              <p>Correct rate: <span className="text-success font-medium">{correctRate}%</span></p>
              <p className="text-xs text-ink-2">
                Again: {stats.again} · Hard: {stats.hard} · Good: {stats.good} · Easy: {stats.easy}
              </p>
            </div>
          )}
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
        <button onClick={() => navigate(-1)} className="text-ink-2 text-sm">←</button>
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

      {/* Breadcrumb */}
      {(card.chapter || card.section) && (
        <div className="text-xs text-ink-2 text-center">
          {card.chapter}{card.section && ` > ${card.section}`}
        </div>
      )}

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <ReviewCard card={card} onRate={handleRate} starred={card.starred} onToggleStar={() => { toggleStar(card.id); setDueCards(prev => prev.map((c, i) => i === currentIndex ? { ...c, starred: !c.starred } : c)) }} />
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
