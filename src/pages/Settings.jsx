import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DAILY_LIMIT_KEY, exportData } from '../lib/storage'
import { BackIcon, SunIcon, MoonIcon, DownloadIcon, UploadIcon, MnemosMark } from '../components/Icons'
import pkg from '../../package.json'

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

  const handleExport = () => {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
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
      <header className="sticky top-0 z-10 flex items-center px-[18px] h-[52px] bg-bg border-b" style={{ borderColor: 'var(--border-soft)' }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors">
          <BackIcon />
        </button>
        <h1 className="flex-1 font-zh text-[17px] font-medium text-ink pl-1">设置</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-4">
        {/* Appearance */}
        <div className="bg-bg-card rounded-md p-4 flex flex-col gap-2.5" style={{ border: '1px solid var(--border-soft)' }}>
          <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-3">外观 · APPEARANCE</div>
          <div className="inline-flex p-0.5 rounded-lg" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-soft)' }}>
            <button onClick={() => setDark(false)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-[7px] px-2.5 text-[12px] font-medium rounded-md transition-all ${!dark ? 'bg-bg-card text-ink shadow-sm' : 'text-ink-2'}`}>
              <SunIcon size={16} /> Light
            </button>
            <button onClick={() => setDark(true)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-[7px] px-2.5 text-[12px] font-medium rounded-md transition-all ${dark ? 'bg-bg-card text-ink shadow-sm' : 'text-ink-2'}`}>
              <MoonIcon size={16} /> Dark
            </button>
          </div>
        </div>

        {/* Daily limit */}
        <div className="bg-bg-card rounded-md p-4 flex flex-col gap-2.5" style={{ border: '1px solid var(--border-soft)' }}>
          <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-3">每日复习上限 · DAILY LIMIT</div>
          <input type="number" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)}
            placeholder="不限" min="1"
            className="w-full py-[9px] px-3 rounded-md border bg-bg text-ink font-mono text-sm outline-none focus:border-accent"
            style={{ borderColor: 'var(--border)' }} />
          <div className="text-[11px] text-ink-3 font-mono tracking-wide">设置后普通复习将限制今日队列数量</div>
        </div>

        {/* Data */}
        <div className="bg-bg-card rounded-md p-4 flex flex-col gap-2.5" style={{ border: '1px solid var(--border-soft)' }}>
          <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-3">数据 · DATA</div>
          <button onClick={handleExport}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-md font-body text-sm bg-bg-card border text-ink-2 active:scale-[0.97] transition-transform hover:bg-bg-raised"
            style={{ borderColor: 'var(--border)' }}>
            <DownloadIcon size={16} /> 导出 JSON
          </button>
        </div>

        {/* About */}
        <div className="bg-bg-card rounded-md p-4 flex flex-col gap-2.5" style={{ border: '1px solid var(--border-soft)' }}>
          <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-3">关于 · ABOUT</div>
          <div className="flex flex-col items-center gap-2 py-3.5">
            <MnemosMark size={36} accent="var(--accent)" />
            <div className="font-display text-[26px] tracking-wide text-ink">Mnemos</div>
            <div className="font-mono text-[10px] text-ink-3 tracking-[0.18em]">VERSION {pkg.version}</div>
          </div>
          <div className="flex justify-between items-baseline py-1.5 border-b" style={{ borderColor: 'var(--border-soft)' }}>
            <span className="font-zh text-xs text-ink-2">间隔算法</span>
            <span className="font-mono text-xs text-ink">SM-2</span>
          </div>
          <div className="flex justify-between items-baseline py-1.5">
            <span className="font-zh text-xs text-ink-2">中文字体</span>
            <span className="font-mono text-xs text-ink">Noto Serif SC</span>
          </div>
        </div>
      </main>
    </div>
  )
}
