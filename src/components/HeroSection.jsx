/**
 * HeroSection — shared dashboard hero used by both flashcard and quiz tabs.
 *
 * Props:
 *   label     – string, e.g. "今日 · TODAY"
 *   right     – array of { icon, text } for the streak/star area
 *   metrics   – array of { value, label, zhLabel, accent? }
 *   chartData – array of { count, isToday, label }
 *   chartColor – "" | "teal"
 */
import { FlameIcon, SparkIcon, StarIcon } from './Icons'

function HeroMetrics({ metrics }) {
  return (
    <div className="hero-row">
      {metrics.map((m, i) => (
        <div key={i} style={{ display: 'contents' }}>
          {i > 0 && <div className="hero-divider" />}
          <div className="hero-col">
            <span className={`num ${m.accent ? 'accent' : ''}`}>{m.value}</span>
            <span className="label">{m.label}</span>
            <span className="zh-label">{m.zhLabel}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function HeroChart({ data, color, chartMax }) {
  const max = chartMax ?? Math.max(1, ...data.map(d => d.count))
  return (
    <div className="hero-chart">
      {data.map((d, i) => (
        <div key={i} className={`hero-bar ${color} ${d.count === 0 ? 'empty' : ''} ${d.isToday ? 'today' : ''}`}>
          <div className="b" style={{ height: d.count === 0 ? 2 : Math.max(4, Math.min(24, (d.count / max) * 32)) }} />
          <span className="day">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export function HeroSection({ label, right, metrics, chartData, chartColor, chartMax }) {
  if (!right) right = []
  return (
    <div className="hero">
      <div className="hero-head">
        <span className="lbl">{label}</span>
        <div className="hero-head-right">
          {right.map((r, i) => (
            <span key={i} className={`streak ${r.warn ? 'warn' : ''}`}>
              {r.icon}
              <span>{r.text}</span>
            </span>
          ))}
        </div>
      </div>
      <HeroMetrics metrics={metrics} />
      <HeroChart data={chartData} color={chartColor} chartMax={chartMax} />
    </div>
  )
}
