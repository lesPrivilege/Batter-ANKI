// 到期判定 + 排序逻辑
import { getDailyLimit, loadData } from './storage'
import { localToday, isoToLocalDate } from './dateUtils'
import { isRecall } from './cardUtils'

function dateAfterDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function getFutureDistribution(cards) {
  const futureDistribution = []
  for (let i = 1; i <= 7; i++) {
    const dateStr = dateAfterDays(i)
    const count = cards.filter((c) => c.dueDate === dateStr).length
    futureDistribution.push({ date: dateStr, count })
  }
  return futureDistribution
}

// 判断卡片是否到期（dueDate <= today）
export function isDue(card) {
  return card.dueDate <= localToday()
}

// 获取某个牌组中所有到期卡片，按 dueDate 升序
// 只返回 recall 类型（reference 卡片不参与复习调度）
export function getDueCards(deckId) {
  const data = loadData()
  const cards = data.cards
    .filter((c) => c.deckId === deckId && isRecall(c) && isDue(c))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const dailyLimit = getDailyLimit()
  return dailyLimit ? cards.slice(0, dailyLimit) : cards
}

// 获取某个牌组的统计信息
export function getDeckStats(deckId) {
  const data = loadData()
  const cards = data.cards.filter((c) => c.deckId === deckId)
  const recallCards = cards.filter((c) => isRecall(c))
  const t = localToday()

  const dueCount = recallCards.filter((c) => c.dueDate <= t).length
  const reviewedToday = recallCards.filter(
    (c) => c.updatedAt && isoToLocalDate(c.updatedAt) === t && c.repetitions > 0
  ).length

  return {
    total: cards.length,
    dueCount,
    reviewedToday,
    futureDistribution: getFutureDistribution(recallCards),
  }
}

// 获取所有牌组概览（首页用）
export function getAllDeckStats() {
  const data = loadData()
  const t = localToday()

  return data.decks.map((deck) => {
    const cards = data.cards.filter((c) => c.deckId === deck.id)
    const recallCards = cards.filter((c) => isRecall(c))
    const dueCount = recallCards.filter((c) => c.dueDate <= t).length
    const reviewedToday = recallCards.filter(
      (c) => c.updatedAt && isoToLocalDate(c.updatedAt) === t && c.repetitions > 0
    ).length
    return {
      ...deck,
      totalCards: cards.length,
      dueCount,
      reviewedToday,
      futureDistribution: getFutureDistribution(recallCards),
    }
  }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
}
