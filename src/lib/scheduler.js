// 到期判定 + 排序逻辑
import { loadData } from './storage'
import { localToday } from './dateUtils'

// 获取今天日期字符串 YYYY-MM-DD
function today() {
  return localToday()
}

// 判断卡片是否到期（dueDate <= today）
export function isDue(card) {
  return card.dueDate <= today()
}

// 获取某个牌组中所有到期卡片，按 dueDate 升序
// 只返回 recall 类型（reference 卡片不参与复习调度）
export function getDueCards(deckId) {
  const data = loadData()
  return data.cards
    .filter((c) => c.deckId === deckId && (c.type || 'recall') === 'recall' && isDue(c))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

// 获取某个牌组的统计信息
export function getDeckStats(deckId) {
  const data = loadData()
  const cards = data.cards.filter((c) => c.deckId === deckId)
  const recallCards = cards.filter((c) => (c.type || 'recall') === 'recall')
  const t = today()

  const dueCount = recallCards.filter((c) => c.dueDate <= t).length
  const reviewedToday = recallCards.filter(
    (c) => c.updatedAt && c.updatedAt.startsWith(t) && c.repetitions > 0
  ).length

  // 未来 7 天到期分布
  const futureDistribution = []
  for (let i = 1; i <= 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const count = recallCards.filter((c) => c.dueDate === dateStr).length
    futureDistribution.push({ date: dateStr, count })
  }

  return {
    total: cards.length,
    dueCount,
    reviewedToday,
    futureDistribution,
  }
}

// 获取所有牌组概览（首页用）
export function getAllDeckStats() {
  const data = loadData()
  const t = today()

  return data.decks.map((deck) => {
    const cards = data.cards.filter((c) => c.deckId === deck.id)
    const recallCards = cards.filter((c) => (c.type || 'recall') === 'recall')
    const dueCount = recallCards.filter((c) => c.dueDate <= t).length
    const reviewedToday = recallCards.filter(
      (c) => c.updatedAt && c.updatedAt.startsWith(t) && c.repetitions > 0
    ).length
    return {
      ...deck,
      totalCards: cards.length,
      dueCount,
      reviewedToday,
    }
  })
}
