import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSubjectStats, getSubjectList, getChapterList, loadLastSession, loadQuestions, loadProgress, deleteSubject } from '../quiz/lib/storage'
import { getSubjectDisplayName } from '../quiz/lib/subjectNames'
import { SUBJECT_HUE, SUBJECT_GLYPH } from '../quiz/lib/subjectMeta'
import { ArrowRIcon, UploadIcon, SparkIcon } from '../components/Icons'
import { HeroSection } from '../components/HeroSection'

function getTimeAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

function ContinueCard({ subjects }) {
  const session = loadLastSession()
  const navigate = useNavigate()
  if (!session) return null
  // Skip if the session's subject no longer exists (e.g. it was deleted)
  if (subjects && !subjects.includes(session.subject)) return null
  const ago = Math.floor((Date.now() - session.timestamp) / 60000)
  const timeStr = ago < 60 ? `${ago}分钟前` : ago < 1440 ? `${Math.floor(ago / 60)}小时前` : `${Math.floor(ago / 1440)}天前`

  return (
    <div className="deck" onClick={() => navigate(session.route)}>
      <div className={`deck-spine h${SUBJECT_HUE[session.subject] || 0}`}>
        <span className="glyph">{SUBJECT_GLYPH[session.subject] || '继'}</span>
      </div>
      <div className="deck-meta">
        <div className="deck-name">
          {getSubjectDisplayName(session.subject)}
        </div>
        <div className="deck-stats">
          <span className="due">继续</span>
          <span className="dot">·</span>
          <span>{session.chapter || '上次练习'}</span>
          <span className="dot">·</span>
          <span>{timeStr}</span>
        </div>
      </div>
      <div className="deck-cta">
        <ArrowRIcon size={12} style={{ color: 'var(--accent)' }} />
      </div>
    </div>
  )
}

function SubjectCard({ subject, onChange }) {
  const navigate = useNavigate()
  const stats = getSubjectStats(subject)
  const hue = SUBJECT_HUE[subject] || 0
  const glyph = SUBJECT_GLYPH[subject] || '学'
  const lastSession = loadLastSession()
  const isThisSubject = lastSession?.subject === subject
  const timeAgo = isThisSubject ? getTimeAgo(lastSession.timestamp) : null

  const typeCounts = { choice: 0, review: 0 }
  for (const ch of getChapterList(subject)) {
    typeCounts.choice += ch.choice
    typeCounts.review += ch.review
  }

  return (
    <div className="deck group" onClick={() => navigate(`/set/${subject}`)}>
      <div className={`deck-spine h${hue} mono`}>
        <span className="glyph">{glyph}</span>
      </div>
      <div className="deck-meta">
        <div className="deck-name">{getSubjectDisplayName(subject)}</div>
        <div className="deck-stats">
          {stats.wrong > 0 && <><span className="due">{stats.wrong}错</span><span className="dot">·</span></>}
          <span>{stats.total}题</span>
          {stats.done > 0 && <><span className="dot">·</span><span>{Math.round((stats.done / stats.total) * 100)}%</span></>}
          {timeAgo && <><span className="dot">·</span><span style={{ color: 'var(--accent)' }}>{timeAgo}</span></>}
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {typeCounts.choice > 0 && (
            <span className="chip" style={{ fontSize: 10, padding: '2px 7px', pointerEvents: 'none' }}>
              选择 {typeCounts.choice}
            </span>
          )}
          {typeCounts.review > 0 && (
            <span className="chip" style={{ fontSize: 10, padding: '2px 7px', pointerEvents: 'none' }}>
              解答 {typeCounts.review}
            </span>
          )}
        </div>
      </div>
      <div className="deck-cta" style={{ gap: 6 }}>
        <button
          className="hidden group-hover:inline-flex items-center justify-center w-7 h-7 rounded-md text-ink-3 hover:text-danger hover:bg-danger-soft transition-colors flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            if (confirm(`删除科目「${getSubjectDisplayName(subject)}」及其全部题目与进度？`)) {
              deleteSubject(subject)
              onChange?.()
            }
          }}
          title="删除科目">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
          </svg>
        </button>
        <ArrowRIcon size={12} style={{ color: 'var(--ink-3)' }} />
      </div>
    </div>
  )
}

const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

function getWeekStats() {
  const progress = loadProgress()
  const now = Math.floor(Date.now() / 1000)
  const weekAgo = now - 7 * 86400
  let doneThisWeek = 0
  let correctThisWeek = 0
  const dayCounts = Array(7).fill(0)

  for (const [qid, prog] of Object.entries(progress)) {
    if (!prog.last_attempt) continue
    const ts = prog.last_attempt
    if (ts >= weekAgo) {
      doneThisWeek++
      if (prog.status === 'correct') correctThisWeek++
      const dayIndex = new Date(ts * 1000).getDay()
      dayCounts[dayIndex]++
    }
  }

  const todayDow = new Date().getDay()
  const chart = DAY_LABELS.map((d, i) => ({
    d,
    n: dayCounts[i],
    today: i === todayDow,
  }))

  return {
    doneThisWeek,
    correctRate: doneThisWeek > 0 ? Math.round(correctThisWeek / doneThisWeek * 100) : 0,
    chart,
  }
}

export function QuizHomeContent() {
  const [subjects, setSubjects] = useState([])
  const [wrongCount, setWrongCount] = useState(0)
  const [totalQs, setTotalQs] = useState(0)
  const [weekStats, setWeekStats] = useState({ doneThisWeek: 0, correctRate: 0, chart: [] })

  const refresh = () => {
    setSubjects(getSubjectList())
    const progress = loadProgress()
    const questions = loadQuestions()
    setWrongCount(questions.filter(q => progress[q.id]?.status === 'wrong' && (progress[q.id]?.wrongStreak || 0) > 0).length)
    setTotalQs(questions.length)
    setWeekStats(getWeekStats())
  }

  useEffect(() => { refresh() }, [])

  return (
    <div className="scr">
      {/* Hero */}
      <HeroSection
        label="本周 · THIS WEEK"
        right={[{ icon: <SparkIcon size={14} />, text: `正确率 ${weekStats.correctRate}%`, warn: true }]}
        metrics={[
          { value: wrongCount, label: 'WRONG', zhLabel: '错题', accent: true },
          { value: weekStats.doneThisWeek, label: 'DONE', zhLabel: '本周' },
          { value: totalQs, label: 'TOTAL', zhLabel: '总数' },
        ]}
        chartData={weekStats.chart.map(d => ({ count: d.n, isToday: d.today, label: d.d }))}
        chartColor="teal"
      />

      {/* Continue card */}
      <ContinueCard subjects={subjects} />

      {/* Subject list header */}
      {subjects.length > 0 && (
        <div className="list-head">
          <div className="section-title" style={{ flex: 'none' }}>科目 · SUBJECTS</div>
          <span className="count">{subjects.length}</span>
        </div>
      )}

      {/* Subject list */}
      {subjects.length === 0 ? (
        <div className="empty">
          <div className="glyph">?</div>
          <div className="msg">暂无题库</div>
          <div className="motto-zh">导入题库即可开始</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {subjects.map(s => (
            <SubjectCard key={s} subject={s} onChange={refresh} />
          ))}
        </div>
      )}

      {/* Bottom actions */}
      <div className="bottom-actions">
        <Link to="/import?tab=json" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>
          <UploadIcon size={16} /> 导入题库
        </Link>
      </div>
    </div>
  )
}
