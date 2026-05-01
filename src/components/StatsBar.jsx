const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function StatsBar({ stats }) {
  if (!stats) return null

  const maxCount = Math.max(1, ...stats.futureDistribution.map((d) => d.count))

  const days = stats.futureDistribution.map((d) => {
    const dow = new Date(d.date).getDay()
    return { ...d, label: DAY_LABELS[dow] }
  })

  return (
    <div className="bg-bg-card border border-soft rounded-lg p-[18px] pt-[18px] relative overflow-hidden shadow-md"
      style={{ borderColor: 'var(--border-soft)' }}>
      <div className="absolute top-0 left-[18px] right-[18px] h-px"
        style={{ background: 'linear-gradient(90deg, transparent, var(--accent-line), transparent)' }} />

      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[10px] tracking-[0.18em] text-ink-3 uppercase">今 · TODAY</div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-line)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)"><path d="M12 2c0 0-5 4.5-5 9a5 5 0 0010 0c0-4.5-5-9-5-9zm0 12a2 2 0 110-4 2 2 0 010 4z"/></svg>
          <span className="font-mono text-[11px] font-semibold text-accent tracking-wide">7 天</span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1px_1fr_1px_1fr] gap-3 items-stretch">
        <div className="flex flex-col gap-1">
          <span className="font-display text-[32px] leading-none text-accent">{stats.dueCount}</span>
          <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-ink-3 mt-0.5">DUE</span>
          <span className="font-zh text-[11px] text-ink-2">待复习</span>
        </div>
        <div className="w-px" style={{ background: 'var(--border-soft)' }} />
        <div className="flex flex-col gap-1">
          <span className="font-display text-[32px] leading-none">{stats.reviewedToday}</span>
          <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-ink-3 mt-0.5">DONE</span>
          <span className="font-zh text-[11px] text-ink-2">已复习</span>
        </div>
        <div className="w-px" style={{ background: 'var(--border-soft)' }} />
        <div className="flex flex-col gap-1">
          <span className="font-display text-[32px] leading-none">{stats.total}</span>
          <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-ink-3 mt-0.5">TOTAL</span>
          <span className="font-zh text-[11px] text-ink-2">卡片总数</span>
        </div>
      </div>

      <div className="mt-3.5 flex items-end gap-1.5 h-9">
        {days.map((day, i) => (
          <div key={day.date} className={`flex-1 flex flex-col items-center gap-1 ${day.count === 0 ? 'opacity-40' : ''}`}>
            <div className="w-full rounded-t-sm transition-all"
              style={{
                height: day.count === 0 ? 2 : Math.max(4, (day.count / maxCount) * 30),
                background: day.count === 0 ? 'var(--border)' : 'var(--accent-soft)',
                borderTop: `1.5px solid ${day.count === 0 ? 'var(--border)' : 'var(--accent)'}`,
              }}
            />
            <span className="font-mono text-[9px] text-ink-3">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
