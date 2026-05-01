// Props: stats = { total, dueCount, reviewedToday, futureDistribution }
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function StatsBar({ stats }) {
  if (!stats) return null

  const maxCount = Math.max(1, ...stats.futureDistribution.map((d) => d.count))

  // Map future dates to day-of-week labels
  const days = stats.futureDistribution.map((d) => {
    const dow = new Date(d.date).getDay()
    return { ...d, label: DAY_LABELS[dow] }
  })

  return (
    <div className="p-4 rounded-lg border border-border bg-bg-card">
      {/* Summary line */}
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-sm font-ui text-ink-2">
          Today: {stats.reviewedToday} reviewed &middot; {stats.dueCount} due
        </span>
      </div>

      {/* 7-day bar chart */}
      <div className="flex items-end gap-1" style={{ height: '40px' }}>
        {days.map((day) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className="w-full bg-accent-bg rounded-t-sm transition-all"
              style={{
                height: `${(day.count / maxCount) * 100}%`,
                minHeight: day.count > 0 ? '4px' : '0',
              }}
            />
            <span className="text-xs font-ui text-ink-2">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
