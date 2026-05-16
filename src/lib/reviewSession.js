// Mid-review session persistence
// Saved on Review unmount, cleared on completion or explicit dismiss.
// Simple: only saves deck identity + count — enough to show a "continue" card.
// Actual queue is re-pulled via getDueCards() on resume (SM-2 scores are already persisted).

const KEY = 'mnemos-review-session'

export function saveReviewSession(session) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...session, savedAt: Date.now() }))
  } catch { /* storage full — non-critical */ }
}

export function loadReviewSession() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    // Expire after 24h — stale sessions are misleading
    if (Date.now() - s.savedAt > 86400000) {
      clearReviewSession()
      return null
    }
    return s
  } catch { return null }
}

export function clearReviewSession() {
  localStorage.removeItem(KEY)
}
