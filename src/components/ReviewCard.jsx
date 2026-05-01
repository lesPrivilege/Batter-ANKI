import { useState, useEffect } from 'react'
import renderMarkdown from '../lib/renderMarkdown'
import '../styles/markdown.css'

export default function ReviewCard({ card }) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    setFlipped(false)
  }, [card.id])

  return (
    <div className="flex-1 min-h-0 flex flex-col p-[18px] gap-3.5">
      <div style={{ perspective: 1400 }} className="flex-1 min-h-0">
        <div className="w-full h-full relative transition-transform duration-[480ms]"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transitionTimingFunction: 'cubic-bezier(.4,.2,.2,1)',
          }}>
          {/* FRONT */}
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
            <div onClick={() => setFlipped(true)}
              className="h-full bg-bg-card rounded-lg p-5 pb-4 relative flex flex-col cursor-pointer"
              style={{ border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-md)' }}>
              <div className="absolute top-3.5 left-4 font-mono text-[9px] tracking-[0.18em] text-ink-3 uppercase flex gap-1.5 items-center">
                <span style={{ color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.02em' }}>Q</span>
                <span>QUESTION</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3.5 p-2">
                <div className="font-zh text-[22px] font-medium leading-relaxed tracking-wide"
                  style={{ color: 'var(--ink)' }}>
                  {card.front}
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, var(--ink-4), transparent)' }} />
            </div>
          </div>

          {/* BACK */}
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="h-full bg-bg-card rounded-lg p-5 pb-4 relative flex flex-col"
              style={{ border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-md)' }}>
              <div className="absolute top-3.5 left-4 font-mono text-[9px] tracking-[0.18em] text-ink-3 uppercase flex gap-1.5 items-center">
                <span style={{ color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.02em' }}>A</span>
                <span>ANSWER</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-start text-center gap-3.5 p-2 pt-8">
                <div className="font-zh text-[18px] text-ink-2">{card.front}</div>
                <div className="w-full px-2 flex items-center gap-2.5 font-mono text-[9px] text-ink-3 tracking-[0.18em] uppercase">
                  <span className="flex-1 h-px" style={{ background: 'var(--border-soft)' }} />
                  REVERSO
                  <span className="flex-1 h-px" style={{ background: 'var(--border-soft)' }} />
                </div>
                <div className="card-content font-zh text-base leading-[1.85] text-teal text-left self-stretch tracking-wide"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(card.back) }} />
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, var(--ink-4), transparent)' }} />
            </div>
          </div>
        </div>
      </div>

      {!flipped && (
        <div className="text-center font-mono text-[10px] text-ink-3 tracking-[0.16em] uppercase">
          TAP TO REVEAL · 点击翻转
        </div>
      )}
    </div>
  )
}
