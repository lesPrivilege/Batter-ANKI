import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { getCards, toggleStar } from '../lib/storage'
import renderMarkdown from '../lib/renderMarkdown'
import { shuffle } from '../lib/utils'
import { BackIcon, ArrowLIcon, ArrowRIcon } from '../components/Icons'

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
        <header className="sticky top-0 z-10 flex items-center px-[18px] h-[52px] bg-bg border-b" style={{ borderColor: 'var(--border-soft)' }}>
          <button onClick={() => navigate(-1)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors">
            <BackIcon />
          </button>
          <h1 className="flex-1 font-zh text-[17px] font-medium text-ink pl-1">Browse</h1>
        </header>
        <div className="flex-1 flex items-center justify-center text-ink-2 text-sm">No cards in this deck.</div>
      </div>
    )
  }

  const card = cards[currentIndex]
  const isEnd = currentIndex === cards.length - 1 && flipped

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-[18px] h-[52px]
        bg-bg border-b" style={{ borderColor: 'var(--border-soft)' }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors">
          <BackIcon />
        </button>
        <span className="font-mono text-[11px]">
          <span className="text-ink font-semibold">{currentIndex + 1}</span>
          <span className="text-ink-3"> / {cards.length}</span>
        </span>
        <button onClick={() => {
          toggleStar(card.id)
          setCards(prev => prev.map((c, i) => i === currentIndex ? { ...c, starred: !c.starred } : c))
        }}
          className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-bg-raised transition-colors"
          style={{ color: card.starred ? 'var(--accent)' : 'var(--ink-3)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={card.starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M12 3l2.7 5.9 6.3.6-4.8 4.5 1.5 6.5L12 17l-5.7 3.5 1.5-6.5L3 9.5l6.3-.6z"/>
          </svg>
        </button>
      </header>

      {/* Breadcrumb */}
      {(card.chapter || card.section) && (
        <div className="px-[18px] pt-3 flex items-center justify-between font-mono text-[11px] text-ink-3">
          <span className="font-zh text-ink-2 text-xs">
            {card.chapter}{card.section && <><span className="text-ink-4 mx-1">›</span>{card.section}</>}
          </span>
          <span className="tracking-wider">BROWSE</span>
        </div>
      )}

      {/* Card */}
      <div className="flex-1 min-h-0 flex flex-col p-[18px] gap-3.5"
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div style={{ perspective: 1400 }} className="flex-1 min-h-0">
          <div className="w-full h-full relative transition-transform duration-[480ms]"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transitionTimingFunction: 'cubic-bezier(.4,.2,.2,1)',
            }}>
            {/* FRONT */}
            <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
              <div ref={cardRef} onClick={() => setFlipped(f => !f)}
                className="h-full bg-bg-card rounded-lg p-6 flex items-center justify-center text-center font-zh text-xl text-ink cursor-pointer"
                style={{ border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-md)' }}>
                <div className="absolute top-3.5 left-4 font-mono text-[9px] tracking-[0.18em] text-ink-3 uppercase flex gap-1.5 items-center">
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Q</span><span>FRONT</span>
                </div>
                {card.front}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, var(--ink-4), transparent)' }} />
              </div>
            </div>
            {/* BACK */}
            <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <div onClick={() => setFlipped(f => !f)}
                className="h-full bg-bg-card rounded-lg p-6 flex items-center justify-center text-center cursor-pointer"
                style={{ border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-md)' }}>
                <div className="absolute top-3.5 left-4 font-mono text-[9px] tracking-[0.18em] text-ink-3 uppercase flex gap-1.5 items-center">
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>A</span><span>BACK</span>
                </div>
                <div className="card-content font-zh text-base leading-[1.85] text-teal"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(card.back) }} />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, var(--ink-4), transparent)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* End of cards */}
      {isEnd && (
        <div className="flex justify-center pb-3">
          <Link to={`/deck/${id}`}
            className="px-6 py-2 rounded-md border text-ink-2 font-medium text-sm font-body active:scale-[0.97] transition-transform"
            style={{ borderColor: 'var(--border)' }}>
            Back to deck
          </Link>
        </div>
      )}

      {/* Navigation */}
      <div className="grid grid-cols-2 gap-2 px-[18px] pb-[18px]">
        <button onClick={goPrev} disabled={currentIndex === 0}
          className="inline-flex items-center justify-center gap-1.5 py-3 rounded-md font-medium text-sm font-body border text-ink-2 active:scale-[0.97] transition-all disabled:opacity-30"
          style={{ borderColor: 'var(--border)' }}>
          <ArrowLIcon size={16} /> 上一张
        </button>
        <button onClick={goNext} disabled={isEnd}
          className="inline-flex items-center justify-center gap-1.5 py-3 rounded-md font-medium text-sm font-body border text-ink-2 active:scale-[0.97] transition-all disabled:opacity-30"
          style={{ borderColor: 'var(--border)' }}>
          下一张 <ArrowRIcon size={16} />
        </button>
      </div>
    </div>
  )
}
