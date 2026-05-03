// Reading stats tracking
// localStorage key: reading-stats
// Fixes: local date for streak, dedup markDocCompleted, persisted session

import { load, save } from './storageUtils'
import { localToday, formatLocalDate } from '../../lib/dateUtils'

const KEY = 'reading-stats'
const SESSION_KEY = 'reading-active-session'
const COMPLETED_KEY = 'reading-completed-docs'

function getDefaultStats() {
  return {
    sessions: [],
    totalMinutes: 0,
    docsCompleted: 0,
    streakDays: 0,
    lastReadDate: null,
  }
}

// ── Session tracking ─────────────────────────────────

/**
 * Start a reading session. Persists to localStorage so it survives app kill.
 */
export function startSession(docId) {
  // If there's a persisted session from a previous app kill, finalize it
  const persisted = load(SESSION_KEY, null)
  if (persisted) {
    finalizeSession(persisted)
  }

  const session = {
    startedAt: Date.now(),
    docId,
  }
  save(SESSION_KEY, session)
}

/**
 * End the current reading session and update stats
 */
export function endSession() {
  const session = load(SESSION_KEY, null)
  if (!session) return
  finalizeSession(session)
  localStorage.removeItem(SESSION_KEY)
}

function finalizeSession(session) {
  const minutesRead = Math.max(1, Math.round((Date.now() - session.startedAt) / 60000))
  const stats = load(KEY, getDefaultStats())

  stats.sessions.push({
    startedAt: session.startedAt,
    endedAt: Date.now(),
    docId: session.docId,
    minutesRead,
  })

  // Keep only last 90 days of sessions
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000
  stats.sessions = stats.sessions.filter(s => s.startedAt >= cutoff)

  stats.totalMinutes += minutesRead

  // Update streak using local date (consistent with rest of codebase)
  const today = localToday()
  if (stats.lastReadDate !== today) {
    const yesterday = formatLocalDate(new Date(Date.now() - 24 * 60 * 60 * 1000))
    if (stats.lastReadDate === yesterday) {
      stats.streakDays += 1
    } else if (stats.lastReadDate !== today) {
      stats.streakDays = 1
    }
    stats.lastReadDate = today
  }

  save(KEY, stats)
}

// ── Document completion ──────────────────────────────

/**
 * Mark a document as completed (dedup per doc)
 */
export function markDocCompleted() {
  const completed = load(COMPLETED_KEY, [])
  // Dedup: don't count the same doc twice in a session
  // (scroll can fire 100% multiple times)
  const session = load(SESSION_KEY, null)
  if (session && completed.includes(session.docId)) return

  const stats = load(KEY, getDefaultStats())
  stats.docsCompleted += 1
  save(KEY, stats)

  if (session) {
    completed.push(session.docId)
    // Keep only last 100 completed doc IDs
    save(COMPLETED_KEY, completed.slice(-100))
  }
}

// ── Query ────────────────────────────────────────────

export function getReadingStats() {
  const stats = load(KEY, getDefaultStats())
  return {
    totalMinutes: stats.totalMinutes,
    docsCompleted: stats.docsCompleted,
    streakDays: stats.streakDays,
  }
}

const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

export function getWeeklyMinutes() {
  const stats = load(KEY, getDefaultStats())
  const now = Date.now()
  const daySlots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return { dayKey, dow: d.getDay(), minutes: 0, isToday: i === 6 }
  })

  for (const s of stats.sessions) {
    const d = new Date(s.startedAt)
    const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const slot = daySlots.find(sl => sl.dayKey === dayKey)
    if (slot) slot.minutes += s.minutesRead || 0
  }

  return {
    totalThisWeek: daySlots.reduce((sum, s) => sum + s.minutes, 0),
    chart: daySlots.map(s => ({
      count: s.minutes,
      isToday: s.isToday,
      label: DAY_LABELS[s.dow],
    })),
  }
}
