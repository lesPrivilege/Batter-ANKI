import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { exportData } from '../lib/storage'

export default function Settings() {
  const navigate = useNavigate()

  const [dark, setDark] = useState(() => {
    return localStorage.getItem('mini-srs-theme') === 'dark' ||
      (!localStorage.getItem('mini-srs-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('mini-srs-theme', dark ? 'dark' : 'light')
  }, [dark])

  const [dailyLimit, setDailyLimit] = useState(() => {
    const v = localStorage.getItem('mnemos-daily-limit')
    return v ?? ''
  })

  useEffect(() => {
    if (dailyLimit === '' || dailyLimit === null) {
      localStorage.removeItem('mnemos-daily-limit')
    } else {
      localStorage.setItem('mnemos-daily-limit', dailyLimit)
    }
  }, [dailyLimit])

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `mnemos-backup-${date}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 h-12
        bg-bg-card border-b border-border shrink-0">
        <button onClick={() => navigate(-1)} className="text-ink-2 active:scale-[0.97] transition-transform">
          ←
        </button>
        <h1 className="text-lg font-serif font-bold text-ink">Settings</h1>
      </header>

      <main className="flex-1 overflow-y-auto max-w-[480px] w-full mx-auto px-4 py-4 space-y-4">
        {/* Theme */}
        <div className="bg-bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-ui text-ink-2 mb-3">Theme</div>
          <div className="flex gap-2">
            <button
              onClick={() => setDark(false)}
              className={`flex-1 py-2 rounded-lg font-ui text-sm transition-colors
                ${!dark ? 'bg-accent text-white' : 'border border-border text-ink-2 active:scale-[0.97]'}`}
            >
              Light
            </button>
            <button
              onClick={() => setDark(true)}
              className={`flex-1 py-2 rounded-lg font-ui text-sm transition-colors
                ${dark ? 'bg-accent text-white' : 'border border-border text-ink-2 active:scale-[0.97]'}`}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Export */}
        <div className="bg-bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-ui text-ink-2 mb-3">Export Data</div>
          <button
            onClick={handleExport}
            className="w-full py-2.5 rounded-lg font-ui text-sm
              border border-border text-ink-2 active:scale-[0.97] transition-transform"
          >
            Export JSON
          </button>
        </div>

        {/* Daily Review Limit */}
        <div className="bg-bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-ui text-ink-2 mb-3">Daily Review Limit</div>
          <input
            type="number"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
            placeholder="No limit"
            min="1"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-ink
              font-ui text-sm placeholder:text-ink-2/50
              focus:outline-none focus:border-accent"
          />
          <div className="text-xs text-ink-2/60 mt-2">
            设置后首页统计将显示每日目标
          </div>
        </div>

        {/* About */}
        <div className="bg-bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-ui text-ink-2 mb-3">About</div>
          <div className="space-y-1.5 text-sm font-ui text-ink">
            <div className="font-serif font-bold text-base">Mnemos</div>
            <div className="text-ink-2">v0.7.2</div>
            <a
              href="https://github.com/lesPrivilege/Batter-ANKI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              github.com/lesPrivilege/Batter-ANKI
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
