// localStorage 读写封装
// 数据结构: { decks: Deck[], cards: Card[] }
import { localToday } from './dateUtils'

const STORAGE_KEY = 'mnemos-data'
const OLD_KEY = 'mini-srs-data'

function getDefaultData() {
  return { decks: [], cards: [] }
}

function migrate() {
  const old = localStorage.getItem(OLD_KEY)
  if (old) {
    localStorage.setItem(STORAGE_KEY, old)
    localStorage.removeItem(OLD_KEY)
    return true
  }
  return false
}

export function loadData() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    if (!raw && migrate()) {
      raw = localStorage.getItem(STORAGE_KEY)
    }
    return raw ? JSON.parse(raw) : getDefaultData()
  } catch {
    return getDefaultData()
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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

export function importData(jsonString) {
  const data = JSON.parse(jsonString)
  if (!data.decks || !data.cards) throw new Error('Invalid format')
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
