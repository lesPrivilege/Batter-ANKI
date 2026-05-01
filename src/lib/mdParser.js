/**
 * Parse structured markdown into Card objects.
 * Input: .md string following FORMAT.md conventions
 * Output: { cards: Card[], deckName: string | null }
 */
import { localToday } from './dateUtils'

export function parseMdToCards(mdContent, deckName) {
  const lines = mdContent.split('\n')
  const cards = []

  let extractedDeckName = null
  for (const line of lines) {
    const h1 = line.match(/^# (.+)/)
    if (h1) { extractedDeckName = h1[1].trim(); break }
  }

  let currentH2 = ''
  let currentH3 = ''
  let currentItem = ''
  let currentBody = ''

  function flush() {
    if (currentItem.trim()) {
      cards.push({
        id: crypto.randomUUID(),
        deckId: '',
        front: currentItem.trim(),
        back: currentBody.trim(),
        type: 'recall',
        chapter: currentH2 || deckName,
        section: currentH3,
        easiness: 2.5,
        interval: 0,
        repetitions: 0,
        dueDate: localToday(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
    currentItem = ''
    currentBody = ''
  }

  for (const line of lines) {
    const h1Match = line.match(/^# (.+)/)
    const h2Match = line.match(/^## (.+)/)
    const h3Match = line.match(/^### (.+)/)
    const bulletMatch = line.match(/^- (.+)/)
    const isIndented = /^[ \t]/.test(line) && line.trim().length > 0
    const isEmpty = line.trim() === ''

    if (h1Match && !line.match(/^## /)) {
      continue
    }

    if (h2Match) {
      flush()
      currentH2 = h2Match[1].trim()
      currentH3 = ''
      continue
    }

    if (h3Match) {
      flush()
      currentH3 = h3Match[1].trim()
      continue
    }

    if (bulletMatch && !isIndented) {
      flush()
      currentItem = bulletMatch[1].trim()
      continue
    }

    if (isIndented) {
      if (currentItem) {
        currentBody += (currentBody ? '\n' : '') + line.trim()
      }
      continue
    }

    if (isEmpty) {
      continue
    }

    // Plain text line after a bullet — treat as body continuation
    if (currentItem) {
      currentBody += (currentBody ? '\n' : '') + line.trim()
    }
  }

  flush()
  return { cards, deckName: extractedDeckName }
}
