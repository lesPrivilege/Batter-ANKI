/**
 * 複習日誌 — 獨立模組，不改動 card 數據結構
 * localStorage key: mnemos-review-log
 * 格式: { entries: ReviewEntry[] }
 *
 * ReviewEntry = {
 *   id: string,
 *   timestamp: number,       // Date.now()
 *   type: 'flashcard' | 'quiz',
 *   quality?: number,         // flashcard: 1/2/4/5
 *   correct?: boolean,        // quiz: true/false
 *   itemId: string,           // card.id 或 question.id
 *   deckId?: string,          // flashcard
 *   subject?: string,         // quiz
 * }
 */

const LOG_KEY = 'mnemos-review-log'
const MAX_AGE_DAYS = 90

function loadLog() {
  try {
    const raw = localStorage.getItem(LOG_KEY)
    return raw ? JSON.parse(raw) : { entries: [] }
  } catch {
    return { entries: [] }
  }
}

function saveLog(data) {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(data))
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      // log 滿了，先清理舊的再試
      pruneOld(30)
      try { localStorage.setItem(LOG_KEY, JSON.stringify(data)) } catch {}
    }
  }
}

function pruneOld(maxDays = MAX_AGE_DAYS) {
  const data = loadLog()
  const cutoff = Date.now() - maxDays * 86400000
  data.entries = data.entries.filter(e => e.timestamp >= cutoff)
  saveLog(data)
}

// ─── 公開 API ────────────────────────────────────────

/**
 * 記錄一條複習日誌
 * @param {object} entry - { type, quality?, correct?, itemId, deckId?, subject? }
 */
export function addReviewEntry(entry) {
  const data = loadLog()
  data.entries.push({
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...entry,
  })
  // prune inline — 不調用 pruneOld()，避免 loadLog() 丟失剛 push 的 entry
  const cutoff = Date.now() - MAX_AGE_DAYS * 86400000
  data.entries = data.entries.filter(e => e.timestamp >= cutoff)
  saveLog(data)
}
