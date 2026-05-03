// Reading module storage — isolated from flashcard (mnemos-*) and quiz (examprep-*)
// localStorage keys: reading-collections, reading-documents, reading-settings
import { load, save } from './storageUtils'

const KEYS = {
  COLLECTIONS: 'reading-collections',
  DOCUMENTS: 'reading-documents',
  SETTINGS: 'reading-settings',
}

// ── Collections ──────────────────────────────────────

export function getCollections() {
  return load(KEYS.COLLECTIONS, [])
}

export function getCollection(id) {
  return getCollections().find(c => c.id === id) || null
}

export function addCollection(name, icon = '📖') {
  const collections = getCollections()
  const collection = {
    id: crypto.randomUUID(),
    name,
    icon,
    order: collections.length,
    createdAt: new Date().toISOString(),
  }
  collections.push(collection)
  save(KEYS.COLLECTIONS, collections)
  return collection
}

export function updateCollection(id, fields) {
  const collections = getCollections()
  const col = collections.find(c => c.id === id)
  if (col) Object.assign(col, fields)
  save(KEYS.COLLECTIONS, collections)
  return col
}

/**
 * Delete collection and its documents atomically (single read, two saves)
 */
export function deleteCollection(id) {
  const collections = getCollections()
  const docs = getDocuments()
  save(KEYS.COLLECTIONS, collections.filter(c => c.id !== id))
  save(KEYS.DOCUMENTS, docs.filter(d => d.collectionId !== id))
}

// ── Documents ────────────────────────────────────────

export function getDocuments() {
  return load(KEYS.DOCUMENTS, [])
}

export function getDocument(id) {
  return getDocuments().find(d => d.id === id) || null
}

export function getDocumentsByCollection(collectionId) {
  return getDocuments().filter(d => d.collectionId === collectionId)
}

export function addDocument(collectionId, title, content, format = 'md') {
  const docs = getDocuments()
  const doc = {
    id: crypto.randomUUID(),
    collectionId,
    title,
    content,
    format,
    createdAt: new Date().toISOString(),
    lastReadAt: null,
    scrollPct: 0,
  }
  docs.push(doc)
  save(KEYS.DOCUMENTS, docs)
  return doc
}

export function updateDocument(id, fields) {
  const docs = getDocuments()
  const doc = docs.find(d => d.id === id)
  if (doc) Object.assign(doc, fields)
  save(KEYS.DOCUMENTS, docs)
  return doc
}

export function deleteDocument(id) {
  save(KEYS.DOCUMENTS, getDocuments().filter(d => d.id !== id))
}

// ── Reading Progress ─────────────────────────────────

export function updateReadingProgress(id, scrollPct) {
  updateDocument(id, {
    scrollPct,
    lastReadAt: new Date().toISOString(),
  })
}

// ── Recent / Continue Reading ────────────────────────

export function getRecentDocuments(limit = 5) {
  return getDocuments()
    .filter(d => d.lastReadAt)
    .sort((a, b) => b.lastReadAt.localeCompare(a.lastReadAt))
    .slice(0, limit)
}

export function getContinueReading() {
  return getDocuments()
    .find(d => d.lastReadAt && d.scrollPct > 0 && d.scrollPct < 100) || null
}

// ── Collection Reorder ───────────────────────────────

export function moveCollectionUp(id) {
  const collections = getCollections()
  const idx = collections.findIndex(c => c.id === id)
  if (idx <= 0) return
  const temp = collections[idx]
  collections[idx] = collections[idx - 1]
  collections[idx - 1] = temp
  save(KEYS.COLLECTIONS, collections)
}

export function moveCollectionDown(id) {
  const collections = getCollections()
  const idx = collections.findIndex(c => c.id === id)
  if (idx < 0 || idx >= collections.length - 1) return
  const temp = collections[idx]
  collections[idx] = collections[idx + 1]
  collections[idx + 1] = temp
  save(KEYS.COLLECTIONS, collections)
}

// ── Settings ─────────────────────────────────────────

const DEFAULT_SETTINGS = {
  fontSize: 18,
  lineHeight: 1.8,
  margins: 24,
}

export function getReadingSettings() {
  return load(KEYS.SETTINGS, DEFAULT_SETTINGS)
}

export function updateReadingSettings(fields) {
  const current = getReadingSettings()
  const updated = { ...current, ...fields }
  save(KEYS.SETTINGS, updated)
  return updated
}
