// localStorage 读写封装
// 数据结构: { decks: Deck[], cards: Card[] }
import { localToday } from './dateUtils'

const STORAGE_KEY = 'mnemos-data'
export const DAILY_LIMIT_KEY = 'mnemos-daily-limit'

function getDefaultData() {
  return { decks: [], cards: [] }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : getDefaultData()
  } catch {
    return getDefaultData()
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function normalizeData(data) {
  if (!data || !Array.isArray(data.decks) || !Array.isArray(data.cards)) {
    throw new Error('Invalid format')
  }
  return {
    decks: data.decks,
    cards: data.cards,
  }
}

export function getDailyLimit() {
  const value = localStorage.getItem(DAILY_LIMIT_KEY)
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

// --- Deck CRUD ---

export function getDecks() {
  return loadData().decks
}

export function getDeck(id) {
  const deck = loadData().decks.find((d) => d.id === id)
  return deck ? { ...deck, pinned: deck.pinned ?? false } : deck
}

export function addDeck(name) {
  const data = loadData()
  const deck = {
    id: crypto.randomUUID(),
    name,
    pinned: false,
    createdAt: new Date().toISOString(),
  }
  data.decks.push(deck)
  saveData(data)
  return deck
}

export function updateDeck(id, name) {
  const data = loadData()
  const deck = data.decks.find((d) => d.id === id)
  if (deck) deck.name = name
  saveData(data)
  return deck
}

export function deleteDeck(id) {
  const data = loadData()
  data.decks = data.decks.filter((d) => d.id !== id)
  data.cards = data.cards.filter((c) => c.deckId !== id)
  saveData(data)
}

export function deleteDecks(ids) {
  const idSet = new Set(ids)
  const data = loadData()
  data.decks = data.decks.filter((d) => !idSet.has(d.id))
  data.cards = data.cards.filter((c) => !idSet.has(c.deckId))
  saveData(data)
}

// --- Card CRUD ---

export function getCards(deckId) {
  return loadData().cards.filter((c) => c.deckId === deckId).map(c => ({ ...c, starred: c.starred ?? false }))
}

export function getCard(id) {
  const card = loadData().cards.find((c) => c.id === id)
  return card ? { ...card, starred: card.starred ?? false } : card
}

export function addCard(deckId, front, back, type = 'recall', chapter = '', section = '') {
  const data = loadData()
  const today = localToday()
  const card = {
    id: crypto.randomUUID(),
    deckId,
    front,
    back,
    type,
    chapter,
    section,
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
    starred: false,
    dueDate: today,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  data.cards.push(card)
  saveData(data)
  return card
}

export function updateCard(id, fields) {
  const data = loadData()
  const card = data.cards.find((c) => c.id === id)
  if (card) Object.assign(card, fields)
  saveData(data)
  return card
}

export function updateCardSM2(id, sm2Result) {
  return updateCard(id, sm2Result)
}

export function deleteCard(id) {
  const data = loadData()
  data.cards = data.cards.filter((c) => c.id !== id)
  saveData(data)
}

export function deleteCards(ids) {
  const idSet = new Set(ids)
  const data = loadData()
  data.cards = data.cards.filter((c) => !idSet.has(c.id))
  saveData(data)
}

// --- 导入/导出 ---

export function exportData() {
  return JSON.stringify(loadData(), null, 2)
}

export function exportDeck(deckId) {
  const data = loadData()
  const deck = data.decks.find((d) => d.id === deckId)
  if (!deck) return null
  const cards = data.cards.filter((c) => c.deckId === deckId)
  return JSON.stringify({ decks: [deck], cards }, null, 2)
}

export function importData(jsonString) {
  const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString
  saveData(normalizeData(data))
}

export function parseImportData(jsonString) {
  return normalizeData(JSON.parse(jsonString))
}

export function mergeData(importedData) {
  const imported = normalizeData(importedData)
  const data = loadData()
  const now = new Date().toISOString()
  const existingDeckIds = new Set(data.decks.map((deck) => deck.id))
  const existingCardIds = new Set(data.cards.map((card) => card.id))
  const deckIdMap = new Map()

  for (const deck of imported.decks) {
    const sourceId = deck.id || crypto.randomUUID()
    const id = existingDeckIds.has(sourceId) ? crypto.randomUUID() : sourceId
    existingDeckIds.add(id)
    deckIdMap.set(sourceId, id)
    data.decks.push({
      ...deck,
      id,
      name: deck.name || 'Imported Deck',
      pinned: deck.pinned ?? false,
      createdAt: deck.createdAt || now,
    })
  }

  for (const card of imported.cards) {
    const sourceId = card.id || crypto.randomUUID()
    const id = existingCardIds.has(sourceId) ? crypto.randomUUID() : sourceId
    const deckId = deckIdMap.get(card.deckId) || card.deckId
    if (!existingDeckIds.has(deckId)) continue
    existingCardIds.add(id)
    data.cards.push({
      ...card,
      id,
      deckId,
      type: card.type || 'recall',
      easiness: card.easiness ?? 2.5,
      interval: card.interval ?? 0,
      repetitions: card.repetitions ?? 0,
      starred: card.starred ?? false,
      dueDate: card.dueDate || localToday(),
      createdAt: card.createdAt || now,
      updatedAt: card.updatedAt || now,
    })
  }

  saveData(data)
}

export function togglePin(id) {
  const d = loadData()
  const deck = d.decks.find(x => x.id === id)
  if (deck) deck.pinned = !deck.pinned
  saveData(d)
}

export function toggleStar(id) {
  const d = loadData()
  const card = d.cards.find(x => x.id === id)
  if (card) card.starred = !card.starred
  saveData(d)
}
