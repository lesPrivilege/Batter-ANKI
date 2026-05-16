// Reading module backup — export all data, import (replace or merge)
import { load, save } from './storageUtils'

const ALL_KEYS = [
  'reading-collections',
  'reading-documents',
  'reading-highlights',
  'reading-bookmarks',
  'reading-stats',
  'reading-settings',
]

export function exportReadingData() {
  const data = {}
  for (const key of ALL_KEYS) {
    data[key] = load(key, null)
  }
  return data
}

export function importReadingData(data) {
  if (!data || typeof data !== 'object') return
  for (const key of ALL_KEYS) {
    if (key in data) save(key, data[key])
  }
}

export function mergeReadingData(data) {
  if (!data || typeof data !== 'object') return
  for (const key of ALL_KEYS) {
    if (!(key in data)) continue
    const incoming = data[key]
    const existing = load(key, null)

    // Collections + Documents: merge by id, skip duplicates
    if (key === 'reading-collections' || key === 'reading-documents') {
      if (!Array.isArray(incoming) || !Array.isArray(existing)) {
        save(key, incoming)
        continue
      }
      const ids = new Set(existing.map(item => item.id))
      for (const item of incoming) {
        if (!ids.has(item.id)) existing.push(item)
      }
      save(key, existing)
      continue
    }

    // Stats: keep existing if already present (don't overwrite real stats with backup)
    if (key === 'reading-stats') {
      if (!existing || !existing.totalMinutes) save(key, incoming)
      continue
    }

    // Highlights, Bookmarks, Settings: simple merge by id where applicable, else replace
    if ((key === 'reading-highlights' || key === 'reading-bookmarks') && Array.isArray(incoming) && Array.isArray(existing)) {
      const ids = new Set(existing.map(item => item.id))
      for (const item of incoming) {
        if (!ids.has(item.id)) existing.push(item)
      }
      save(key, existing)
      continue
    }

    // Settings: keep existing, import only if missing
    if (key === 'reading-settings') {
      if (!existing) save(key, incoming)
      continue
    }

    save(key, incoming)
  }
}
