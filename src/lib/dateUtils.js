// Format a local Date as "YYYY-MM-DD".
// All YYYY-MM-DD formatting in the codebase should use this, not inline string templates.
function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function localToday() {
  return fmt(new Date())
}

// Convert a UTC ISO string (with time component) to local YYYY-MM-DD.
// `new Date(isoString)` correctly handles full ISO datetime strings like "2026-05-03T10:30:00Z"
// by converting to local timezone. This helper wraps that + formatting.
//
// ⚠️ Does NOT handle date-only ISO strings ("2026-05-03") correctly in negative UTC offsets
// (Date constructor interprets them as UTC midnight). If you have a date-only string, use
// `parseLocalDate().getTime()` or pass through `parseLocalDate()` and `fmt()` separately.
export function isoToLocalDate(isoString) {
  return fmt(new Date(isoString))
}

// Parse a "YYYY-MM-DD" string as a local-time Date.
// `new Date("2026-05-03")` parses as UTC midnight, giving wrong weekday
// in negative-UTC timezones. Use this for any date-only string.
export function parseLocalDate(dateStr) {
  const [y, m, d] = String(dateStr).split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function localDow(dateStr) {
  return parseLocalDate(dateStr).getDay()
}

// Format a Date as local YYYY-MM-DD. Use in place of inline
// `${d.getFullYear()}-${...padStart...}` patterns.
export function formatLocalDate(d) {
  return fmt(d)
}
