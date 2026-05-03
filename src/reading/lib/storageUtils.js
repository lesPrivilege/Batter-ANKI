// Shared localStorage helpers for reading module
// All reading storage files should import from here

/**
 * Load JSON from localStorage with fallback
 */
export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

/**
 * Save JSON to localStorage with error handling
 */
export function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.warn(`Reading: storage full for key "${key}"`)
    } else {
      throw e
    }
  }
}
