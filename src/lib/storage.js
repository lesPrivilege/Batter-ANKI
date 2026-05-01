// localStorage 读写封装
// 数据结构: { decks: Deck[], cards: Card[] }

const STORAGE_KEY = 'mini-srs-data'

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

// --- Deck CRUD ---

export function getDecks() {
  return loadData().decks
}

export function getDeck(id) {
  return loadData().decks.find((d) => d.id === id)
}

export function addDeck(name) {
  const data = loadData()
  const deck = {
    id: crypto.randomUUID(),
    name,
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
  return loadData().cards.filter((c) => c.deckId === deckId)
}

export function getCard(id) {
  return loadData().cards.find((c) => c.id === id)
}

export function addCard(deckId, front, back, type = 'recall', chapter = '', section = '') {
  const data = loadData()
  const today = new Date().toISOString().split('T')[0]
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
