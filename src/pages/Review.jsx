import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ReviewCard from '../components/ReviewCard'
import { BackIcon, CheckIcon } from '../components/Icons'
import { getDueCards } from '../lib/scheduler'
import { getCards, updateCardSM2, toggleStar } from '../lib/storage'
import { sm2 } from '../lib/sm2'
import { shuffle } from '../lib/utils'
import { isRecall } from '../lib/cardUtils'
import { useBackButton } from '../lib/useBackButton'

function predictInterval(card, quality) {
  const result = sm2(card, quality)
  return result.interval
}

export default function Review() {
  const { id } = useParams()
  const { goBack } = useBackButton()
  const [searchParams] = useSearchParams()
  const reviewAll = searchParams.get('all') === 'true'
  const [dueCards, setDueCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 })

  useEffect(() => {
    if (reviewAll) {
      const allCards = getCards(id).filter(c => isRecall(c))
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
        <header className="sticky top-0 z-10 flex items-center px-[18px] h-[52px] bg-bg border-b" style={{ borderColor: 'var(--border-soft)' }}>
          <button onClick={goBack} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors">
            <BackIcon />
          </button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-[18px] p-6 text-center">
          <div className="w-[76px] h-[76px] rounded-full inline-flex items-center justify-center"
            style={{ background: 'var(--good-soft)', border: '1px solid color-mix(in oklch, var(--good) 30%, transparent)', color: 'var(--good)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-12"/></svg>
          </div>
          <div className="font-display text-[32px] text-ink mt-1">Mnēmosúnē</div>
          <div className="font-zh text-sm text-ink-2 tracking-wider -mt-2">— 今日已记 —</div>

          {total > 0 && (
            <>
              <div className="flex gap-[18px] font-mono text-xs text-ink-3 mt-1">
                <span>已复习 <span className="text-ink font-semibold">{total}</span></span>
                <span>正确率 <span className="text-ink font-semibold">{correctRate}%</span></span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 w-full mt-2">
                <div className="py-2 px-1 rounded-sm font-mono text-[11px] flex flex-col items-center gap-0.5 text-danger" style={{ background: 'var(--danger-soft)' }}>
                  <span className="text-base font-semibold">{stats.again}</span><span>Again</span>
                </div>
                <div className="py-2 px-1 rounded-sm font-mono text-[11px] flex flex-col items-center gap-0.5 text-warn" style={{ background: 'var(--warn-soft)' }}>
                  <span className="text-base font-semibold">{stats.hard}</span><span>Hard</span>
                </div>
                <div className="py-2 px-1 rounded-sm font-mono text-[11px] flex flex-col items-center gap-0.5 text-accent" style={{ background: 'var(--accent-soft)' }}>
                  <span className="text-base font-semibold">{stats.good}</span><span>Good</span>
                </div>
                <div className="py-2 px-1 rounded-sm font-mono text-[11px] flex flex-col items-center gap-0.5 text-good" style={{ background: 'var(--good-soft)' }}>
                  <span className="text-base font-semibold">{stats.easy}</span><span>Easy</span>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2 w-full mt-2">
            <Link to={`/deck/${id}`}
              className="flex-1 py-2.5 rounded-md bg-bg-card border text-ink-2 font-medium text-sm font-body text-center active:scale-[0.97] transition-transform"
              style={{ borderColor: 'var(--border)' }}>
              返回卡组
            </Link>
            <Link to="/"
              className="flex-1 py-2.5 rounded-md bg-ink text-bg font-medium text-sm font-body text-center active:scale-[0.97] transition-transform">
              主页
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
      <header className="sticky top-0 z-10 flex items-center justify-between px-[18px] h-[52px]
        bg-bg border-b" style={{ borderColor: 'var(--border-soft)' }}>
        <button onClick={goBack} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors">
          <BackIcon />
        </button>
        <span className="font-mono text-[11px]">
          <span className="text-ink font-semibold">{currentIndex + 1}</span>
          <span className="text-ink-3"> / {dueCards.length}</span>
        </span>
        <button onClick={() => {
          toggleStar(card.id)
          setDueCards(prev => prev.map((c, i) => i === currentIndex ? { ...c, starred: !c.starred } : c))
        }}
          className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-bg-raised transition-colors"
          style={{ color: card.starred ? 'var(--accent)' : 'var(--ink-3)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={card.starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M12 3l2.7 5.9 6.3.6-4.8 4.5 1.5 6.5L12 17l-5.7 3.5 1.5-6.5L3 9.5l6.3-.6z"/>
          </svg>
        </button>
      </header>

      {/* Progress bar */}
      <div className="h-1 w-full" style={{ background: 'var(--bg-raised)' }}>
        <div className="h-full transition-all duration-200" style={{ background: 'var(--accent)', width: `${(currentIndex / dueCards.length) * 100}%` }} />
      </div>

      {/* Breadcrumb */}
      {(card.chapter || card.section) && (
        <div className="px-[18px] pt-2.5 flex items-center justify-between font-mono text-[11px] text-ink-3">
          <span className="font-zh text-ink-2 text-xs">
            {card.chapter}{card.section && <><span className="text-ink-4 mx-1">›</span>{card.section}</>}
          </span>
          <span className="tracking-wider"><span className="text-ink font-semibold">REVIEW</span></span>
        </div>
      )}

      {/* Card */}
      <ReviewCard card={card} />

      {/* Rating buttons */}
      <div className="grid grid-cols-4 gap-1.5 px-[18px] pb-[18px]">
        <button onClick={() => handleRate(1)}
          className="flex flex-col items-center gap-0.5 py-3 px-1 rounded-md border font-body font-medium text-[13px] active:scale-[0.96] transition-transform"
          style={{ background: 'var(--danger-soft)', color: 'var(--danger)', borderColor: 'color-mix(in oklch, var(--danger) 22%, transparent)' }}>
          <span>Again</span>
          <span className="font-mono text-[10px] opacity-70 tracking-wide">{predictInterval(card, 1)}d</span>
        </button>
        <button onClick={() => handleRate(2)}
          className="flex flex-col items-center gap-0.5 py-3 px-1 rounded-md border font-body font-medium text-[13px] active:scale-[0.96] transition-transform"
          style={{ background: 'var(--warn-soft)', color: 'var(--warn)', borderColor: 'color-mix(in oklch, var(--warn) 22%, transparent)' }}>
          <span>Hard</span>
          <span className="font-mono text-[10px] opacity-70 tracking-wide">{predictInterval(card, 2)}d</span>
        </button>
        <button onClick={() => handleRate(4)}
          className="flex flex-col items-center gap-0.5 py-3 px-1 rounded-md border font-body font-medium text-[13px] active:scale-[0.96] transition-transform"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent-line)' }}>
          <span>Good</span>
          <span className="font-mono text-[10px] opacity-70 tracking-wide">{predictInterval(card, 4)}d</span>
        </button>
        <button onClick={() => handleRate(5)}
          className="flex flex-col items-center gap-0.5 py-3 px-1 rounded-md border font-body font-medium text-[13px] active:scale-[0.96] transition-transform"
          style={{ background: 'var(--good-soft)', color: 'var(--good)', borderColor: 'color-mix(in oklch, var(--good) 22%, transparent)' }}>
          <span>Easy</span>
          <span className="font-mono text-[10px] opacity-70 tracking-wide">{predictInterval(card, 5)}d</span>
        </button>
      </div>
    </div>
  )
}
