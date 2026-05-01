// SM-2 间隔重复算法
// quality 映射: Again=1, Hard=2, Good=4, Easy=5

export function sm2(card, quality) {
  const { easiness, interval, repetitions } = card

  let newE, newInterval, newReps

  if (quality < 3) {
    // 失败：重置
    newReps = 0
    newInterval = 1
    newE = easiness
  } else {
    // 成功
    if (repetitions === 0) {
      newInterval = 1
    } else if (repetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * easiness)
    }
    newReps = repetitions + 1
    newE = easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  }

  newE = Math.max(1.3, newE)

  const today = new Date()
  today.setDate(today.getDate() + newInterval)

  return {
    easiness: newE,
    interval: newInterval,
    repetitions: newReps,
    dueDate: today.toISOString().split('T')[0],
    updatedAt: new Date().toISOString(),
  }
}

// 评分常量
export const RATING = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 4,
  EASY: 5,
}
