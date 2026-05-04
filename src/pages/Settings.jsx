import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  clearAllProgress, clearQuestions,
  deleteSubject, clearSubjectProgress, getStorageStats,
  getSubjectList, exportData as exportQuizData,
} from '../quiz/lib/storage'
import { getSubjectDisplayName } from '../quiz/lib/subjectNames'
import { SUBJECT_HUE } from '../quiz/lib/subjectMeta'
import { DAILY_LIMIT_KEY, exportData as exportFlashcardData } from '../lib/storage'
import { getAllDeckStats } from '../lib/scheduler'
import { localToday } from '../lib/dateUtils'
import { exportReadingData } from '../reading/lib/backup'
import { BackIcon, SunIcon, MoonIcon, DownloadIcon, MnemosMark } from '../components/Icons'
import { useBackButton } from '../lib/useBackButton'
import { downloadBlob } from '../lib/utils'
import pkg from '../../package.json'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export default function Settings() {
  const navigate = useNavigate()
  const { goBack } = useBackButton()
  const [showConfirm, setShowConfirm] = useState(null)
  const [subjectConfirm, setSubjectConfirm] = useState(null)
  const [storageStats, setStorageStats] = useState(null)
  const [subjects, setSubjects] = useState([])

  const [dark, setDark] = useState(() => {
    const legacy = localStorage.getItem('mini-srs-theme')
    const current = localStorage.getItem('mnemos-theme')
    return current === 'dark' || (!current && legacy === 'dark') ||
      (!current && !legacy && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('mnemos-theme', dark ? 'dark' : 'light')
  }, [dark])

  // Flashcard state
  const [flashcardStats, setFlashcardStats] = useState(null)
  const [dailyLimit, setDailyLimit] = useState(() => {
    const v = localStorage.getItem(DAILY_LIMIT_KEY)
    return v ?? ''
  })

  useEffect(() => {
    if (dailyLimit === '' || dailyLimit === null) {
      localStorage.removeItem(DAILY_LIMIT_KEY)
    } else {
      localStorage.setItem(DAILY_LIMIT_KEY, dailyLimit)
    }
  }, [dailyLimit])

  const refresh = () => {
    setStorageStats(getStorageStats())
    setSubjects(getSubjectList())
    setFlashcardStats(getAllDeckStats())
  }

  useEffect(() => { refresh() }, [])

  const handleExportFlashcard = () => {
    const json = exportFlashcardData()
    const blob = new Blob([json], { type: 'application/json' })
    downloadBlob(blob, `mnemos-backup-${localToday()}.json`)
  }

  const handleExportAll = () => {
    const flashcardJson = exportFlashcardData()
    const quizJson = exportQuizData()
    const reading = exportReadingData()
    const merged = {
      version: 1,
      exportedAt: new Date().toISOString(),
      flashcard: JSON.parse(flashcardJson),
      quiz: JSON.parse(quizJson),
      reading,
    }
    const blob = new Blob([JSON.stringify(merged, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `mnemos-full-backup-${localToday()}.json`)
  }

  const handleClearProgress = () => {
    if (showConfirm === 'progress') {
      clearAllProgress()
      setShowConfirm(null)
      refresh()
    } else {
      setShowConfirm('progress')
    }
  }

  const handleClearQuestions = () => {
    if (showConfirm === 'questions') {
      clearQuestions()
      clearAllProgress()
      setShowConfirm(null)
      refresh()
      navigate('/')
    } else {
      setShowConfirm('questions')
    }
  }

  const handleDeleteSubject = (subject) => {
    if (subjectConfirm === `delete-${subject}`) {
      deleteSubject(subject)
      setSubjectConfirm(null)
      refresh()
    } else {
      setSubjectConfirm(`delete-${subject}`)
    }
  }

  const handleClearSubjectProgress = (subject) => {
    if (subjectConfirm === `clear-${subject}`) {
      clearSubjectProgress(subject)
      setSubjectConfirm(null)
      refresh()
    } else {
      setSubjectConfirm(`clear-${subject}`)
    }
  }

  return (
    <div className="page-fill">
      {/* Topbar */}
      <header className="topbar">
        <button onClick={goBack} className="tb-btn">
          <BackIcon />
        </button>
        <h1 className="flex-1 font-zh text-[17px] font-medium text-ink pl-1">设置</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-4">
        {/* Appearance */}
        <div className="settings-card">
          <div className="lbl">外观 · APPEARANCE</div>
          <div className="seg">
            <button onClick={() => setDark(false)} className={!dark ? 'on' : ''}>
              <SunIcon size={16} /> Light
            </button>
            <button onClick={() => setDark(true)} className={dark ? 'on' : ''}>
              <MoonIcon size={16} /> Dark
            </button>
          </div>
        </div>

        {/* Flashcard stats */}
        {flashcardStats && flashcardStats.length > 0 && (
          <div className="settings-card">
            <div className="lbl">记忆卡 · CARDS</div>
            <div className="kv-row">
              <span className="k">卡组</span>
              <span className="v">{flashcardStats.length}</span>
            </div>
            <div className="kv-row">
              <span className="k">总卡片</span>
              <span className="v">{flashcardStats.reduce((s, d) => s + d.totalCards, 0)}</span>
            </div>
            <div className="kv-row">
              <span className="k">待复习</span>
              <span className="v" style={{ color: 'var(--accent)' }}>{flashcardStats.reduce((s, d) => s + d.dueCount, 0)}</span>
            </div>
          </div>
        )}

        {/* Flashcard daily limit */}
        <div className="settings-card">
          <div className="lbl">每日上限 · DAILY LIMIT</div>
          <input type="number" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)}
            placeholder="不限" min="1"
            className="w-full py-[9px] px-3 rounded-md border bg-bg text-ink font-mono text-sm outline-none focus:border-accent"
            style={{ borderColor: 'var(--border)' }} />
          <div className="text-[11px] text-ink-3 font-zh tracking-[0.04em]">限定每日复习的最大数量</div>
        </div>

        {/* Quiz storage statistics */}
        {storageStats && (
          <div className="settings-card">
            <div className="lbl">练习 · QUIZ</div>
            <div className="kv-row">
              <span className="k">总题数</span>
              <span className="v">{storageStats.totalQuestions}</span>
            </div>
            <div className="kv-row">
              <span className="k">已练习</span>
              <span className="v">{storageStats.totalProgress}</span>
            </div>
            <div className="kv-row">
              <span className="k">收藏</span>
              <span className="v">{storageStats.totalStarred}</span>
            </div>
            <div className="kv-row">
              <span className="k">存储占用</span>
              <span className="v">{formatBytes(storageStats.storage.totalSize)}</span>
            </div>
          </div>
        )}

        {/* Subject management */}
        {subjects.length > 0 && (
          <div className="settings-card">
            <div className="lbl">科目 · SUBJECTS</div>
            {subjects.map(subject => {
              const subjStats = storageStats?.bySubject[subject]
              const hue = SUBJECT_HUE[subject] || 0
              const progressCount = storageStats?.progressBySubject[subject] || 0

              return (
                <div key={subject} className="border-b py-3 flex items-center gap-3" style={{ borderColor: 'var(--border-soft)' }}>
                  <div style={{
                    width: 4, height: 36, borderRadius: 2,
                    background: `oklch(60% 0.10 ${60 + hue * 55})`,
                    flexShrink: 0,
                  }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-zh text-[14px] font-medium text-ink truncate">
                      {getSubjectDisplayName(subject)}
                    </div>
                    <div className="font-mono text-[11px] text-ink-3">
                      {subjStats ? `${subjStats.total}题` : ''}
                      {progressCount > 0 && ` · ${progressCount}条进度`}
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {progressCount > 0 && (
                      <button onClick={() => handleClearSubjectProgress(subject)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                          subjectConfirm === `clear-${subject}`
                            ? 'bg-warn text-white'
                            : 'text-warn'
                        }`}
                        style={subjectConfirm !== `clear-${subject}` ? { background: 'var(--warn-soft)' } : {}}>
                        {subjectConfirm === `clear-${subject}` ? '确认重置' : '重置'}
                      </button>
                    )}
                    <button onClick={() => handleDeleteSubject(subject)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                        subjectConfirm === `delete-${subject}`
                          ? 'bg-danger text-white'
                          : 'text-danger'
                      }`}
                      style={subjectConfirm !== `delete-${subject}` ? { background: 'var(--danger-soft)' } : {}}>
                      {subjectConfirm === `delete-${subject}` ? '确认删除' : '删除'}
                    </button>
                  </div>
                </div>
              )
            })}
            {subjectConfirm && (
              <div className="mt-2 p-3 rounded-md font-zh text-xs leading-relaxed"
                style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
                此操作不可撤销，请确认是否继续？
              </div>
            )}
          </div>
        )}

        {/* Data export */}
        <div className="settings-card">
          <div className="lbl">导出 · EXPORT</div>
          <div className="flex gap-2">
            <button onClick={handleExportFlashcard}
              className="btn btn-ghost flex-1 inline-flex items-center justify-center gap-1.5">
              <DownloadIcon size={16} /> 记忆卡
            </button>
            <button onClick={handleExportAll}
              className="flex-1 py-2.5 rounded-md font-body text-sm font-medium bg-ink text-bg inline-flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform">
              <DownloadIcon size={16} /> 全部
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="settings-card" style={{ borderColor: 'color-mix(in oklch, var(--danger) 30%, transparent)' }}>
          <div className="lbl" style={{ color: 'var(--danger)' }}>危险操作 · DANGER ZONE</div>
          <div className="kv-row">
            <span className="k">清除练习进度</span>
            <button onClick={handleClearProgress}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                showConfirm === 'progress' ? 'bg-danger text-white' : 'text-danger'
              }`}
              style={showConfirm !== 'progress' ? { background: 'var(--danger-soft)' } : {}}>
              {showConfirm === 'progress' ? '确认清除' : '清除'}
            </button>
          </div>
          <div className="kv-row">
            <span className="k">清除全部题库</span>
            <button onClick={handleClearQuestions}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                showConfirm === 'questions' ? 'bg-danger text-white' : 'text-danger'
              }`}
              style={showConfirm !== 'questions' ? { background: 'var(--danger-soft)' } : {}}>
              {showConfirm === 'questions' ? '确认删除' : '删除'}
            </button>
          </div>
          {showConfirm && (
            <div className="mt-2 p-3 rounded-md font-zh text-xs leading-relaxed"
              style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
              此操作不可撤销，请确认是否继续？
            </div>
          )}
        </div>

        {/* About */}
        <div className="settings-card">
          <div className="lbl">关于 · ABOUT</div>
          <div className="flex flex-col items-center gap-2 py-3.5">
            <MnemosMark size={36} accent="var(--accent)" />
            <div className="font-display text-[26px] tracking-wide text-ink">Mnemos</div>
            <div className="font-mono text-[10px] text-ink-3 tracking-[0.18em]">VERSION {pkg.version}</div>
          </div>
          <div className="kv-row">
            <span className="k">间隔算法</span>
            <span className="v">SM-2</span>
          </div>
          <div className="kv-row">
            <span className="k">显示字体</span>
            <span className="v">Instrument · Noto Serif SC</span>
          </div>
        </div>
      </main>
    </div>
  )
}
