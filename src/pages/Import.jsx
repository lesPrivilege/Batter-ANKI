import { useState, useRef, useMemo } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { addQuestions } from '../quiz/lib/storage'
import { parseQuestionsJson, getQuestionsStats } from '../quiz/lib/questionParser'
import { getSubjectDisplayName } from '../quiz/lib/subjectNames'
import { addDeck, addCard, getCards, getDecks, importData, mergeData, parseImportData, loadData } from '../lib/storage'
import { parseMdToCards } from '../lib/mdParser'
import { BackIcon, UploadIcon, PasteIcon } from '../components/Icons'
import { useBackButton } from '../lib/useBackButton'

export default function Import() {
  const navigate = useNavigate()
  const { goBack } = useBackButton()
  const [searchParams] = useSearchParams()
  const fileInputRef = useRef(null)
  const [importTab, setImportTab] = useState(() => {
    const tab = searchParams.get('tab')
    return tab === 'md' ? 'md' : 'json'
  })
  const [dragging, setDragging] = useState(false)

  // ---- JSON (quiz) state ----
  const [previewData, setPreviewData] = useState(null)
  const [errors, setErrors] = useState([])

  // ---- MD (flashcard) state ----
  const [pasteMd, setPasteMd] = useState('')
  const [mdPreview, setMdPreview] = useState(null)
  const [mdDeckName, setMdDeckName] = useState('')
  const [jsonPreviewData, setJsonPreviewData] = useState(null)
  const [jsonMode, setJsonMode] = useState('merge')
  const [skipDup, setSkipDup] = useState(false)

  const dedup = useMemo(() => {
    if (!mdPreview) return { count: 0, filtered: [] }
    const trimmedName = mdDeckName.trim() || mdPreview.defaultName
    const decks = getDecks()
    const existingDeck = decks.find(d => d.name === trimmedName)
    const existingCards = existingDeck ? getCards(existingDeck.id) : []
    if (existingCards.length === 0) return { count: 0, filtered: mdPreview.cards }
    const existingFronts = new Set(existingCards.map(c => c.front.trim()))
    const duplicates = mdPreview.cards.filter(c => existingFronts.has(c.front.trim()))
    return {
      count: duplicates.length,
      filtered: mdPreview.cards.filter(c => !existingFronts.has(c.front.trim()))
    }
  }, [mdPreview, mdDeckName])

  const handleFileDrop = (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ext === 'json') {
        try {
          const result = parseQuestionsJson(ev.target.result)
          setPreviewData(result.questions)
          setErrors(result.errors)
        } catch {
          try {
            setJsonPreviewData(parseImportData(ev.target.result))
            setJsonMode('merge')
          } catch {
            alert('导入失败: JSON 格式错误')
          }
        }
      } else if (ext === 'md') {
        processMd(ev.target.result, file.name.replace(/\.md$/i, ''))
      }
    }
    reader.readAsText(file)
  }

  const handleDropzoneDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDropzoneDragLeave = () => setDragging(false)
  const handleDropzoneDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileDrop(file)
  }

  const reset = () => {
    setPreviewData(null)
    setErrors([])
    setMdPreview(null)
    setMdDeckName('')
    setPasteMd('')
    setJsonPreviewData(null)
    setJsonMode('merge')
    setSkipDup(false)
  }

  // ---- JSON handlers (quiz) ----
  const handleJsonFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const result = parseQuestionsJson(ev.target.result)
        setPreviewData(result.questions)
        setErrors(result.errors)
      } catch {
        alert('导入失败: JSON 格式错误')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleConfirmJson = () => {
    if (!previewData || previewData.length === 0) return
    const result = addQuestions(previewData)
    alert(`导入完成！\n新增: ${result.added}\n重复跳过: ${result.duplicates}`)
    reset()
    navigate('/')
  }

  // ---- MD handlers (flashcard) ----
  const handleMdFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      processMd(ev.target.result, file.name.replace(/\.md$/i, ''))
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handlePasteSubmit = () => {
    if (!pasteMd.trim()) return
    processMd(pasteMd, 'Pasted Notes')
  }

  const processMd = (content, defaultName) => {
    const { cards, deckName } = parseMdToCards(content, defaultName)
    if (cards.length === 0) {
      alert('未识别到卡片。请确认 .md 格式是否正确。')
      return
    }
    setMdPreview({ cards, defaultName: deckName || defaultName })
    setMdDeckName(deckName || defaultName)
  }

  const handleConfirmMd = () => {
    if (!mdPreview || mdPreview.cards.length === 0) return
    const name = mdDeckName.trim() || mdPreview.defaultName
    const cardsToImport = skipDup ? dedup.filtered : mdPreview.cards
    const deck = addDeck(name)
    for (const card of cardsToImport) {
      addCard(deck.id, card.front, card.back, card.type, card.chapter, card.section)
    }
    alert(`导入完成！\n卡组: ${name}\n卡片: ${cardsToImport.length}${skipDup && dedup.count > 0 ? `\n跳过重复: ${dedup.count}` : ''}`)
    reset()
    navigate('/')
  }

  // ---- JSON backup handlers (flashcard) ----
  const handleJsonBackupFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        setJsonPreviewData(parseImportData(ev.target.result))
        setJsonMode('merge')
      } catch {
        alert('导入失败: JSON 格式错误')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleConfirmJsonBackup = () => {
    if (!jsonPreviewData) return
    if (jsonMode === 'replace') {
      if (!confirm('替换全部会覆盖当前所有卡组和卡片，此操作不可撤销。')) return
      importData(jsonPreviewData)
    } else {
      mergeData(jsonPreviewData)
    }
    reset()
    navigate('/')
  }

  // ---- Preview mode: JSON quiz ----
  if (previewData) {
    const stats = getQuestionsStats(previewData)
    return (
      <div className="page-fill">
        <header className="topbar">
          <button onClick={reset} className="tb-btn">
            <BackIcon />
          </button>
          <h1 className="flex-1 font-zh text-[17px] font-medium text-ink pl-1">JSON 导入预览</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-4">
          <div className="settings-card">
            <div className="lbl">题库统计</div>
            <div className="kv-row"><span className="k">总题数</span><span className="v">{stats.total}</span></div>
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="kv-row">
                <span className="k">{type === 'choice' ? '选择' : '解答'}</span>
                <span className="v">{count}</span>
              </div>
            ))}
          </div>
          <div className="settings-card">
            <div className="lbl">科目分布</div>
            {Object.entries(stats.bySubject).map(([subject, count]) => (
              <div key={subject} className="kv-row">
                <span className="k">{getSubjectDisplayName(subject)}</span>
                <span className="v">{count} 题</span>
              </div>
            ))}
          </div>
          {errors.length > 0 && (
            <div className="settings-card" style={{ borderColor: 'color-mix(in oklch, var(--warn) 30%, transparent)' }}>
              <div className="lbl" style={{ color: 'var(--warn)' }}>警告 ({errors.length})</div>
              <div className="max-h-40 overflow-y-auto">
                {errors.slice(0, 10).map((err, i) => <div key={i} className="font-zh text-xs text-ink-2 py-1">{err}</div>)}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={reset}
              className="btn btn-ghost btn-block">
              取消
            </button>
            <button onClick={handleConfirmJson}
              className="btn btn-primary btn-block">
              确认导入
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ---- Preview mode: JSON backup ----
  if (jsonPreviewData) {
    const currentData = loadData()
    const importedDecks = jsonPreviewData.decks.length
    const importedCards = jsonPreviewData.cards.length
    const currentDecks = currentData.decks.length
    const currentCards = currentData.cards.length

    return (
      <div className="page-fill">
        <header className="topbar">
          <button onClick={reset} className="tb-btn">
            <BackIcon />
          </button>
          <h1 className="flex-1 font-zh text-[17px] font-medium text-ink pl-1">JSON 导入预览</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-4">
          <div className="settings-card">
            <div className="lbl">导入方式</div>
            <div className="seg">
              <button onClick={() => setJsonMode('merge')} className={jsonMode === 'merge' ? 'on' : ''}>
                合并数据
              </button>
              <button onClick={() => setJsonMode('replace')} className={jsonMode === 'replace' ? 'on' : ''}>
                替换全部
              </button>
            </div>
            <div className="kv-row">
              <span className="k">当前卡组</span>
              <span className="v">{currentDecks}</span>
            </div>
            <div className="kv-row">
              <span className="k">当前卡片</span>
              <span className="v">{currentCards}</span>
            </div>
            <div className="kv-row">
              <span className="k">导入卡组</span>
              <span className="v" style={{ color: 'var(--accent)' }}>{importedDecks}</span>
            </div>
            <div className="kv-row">
              <span className="k">导入卡片</span>
              <span className="v" style={{ color: 'var(--accent)', fontWeight: 600 }}>{importedCards}</span>
            </div>
            {jsonMode === 'replace' && (
              <div className="rounded-md p-3 font-zh text-xs leading-relaxed"
                style={{ background: 'var(--danger-soft)', color: 'var(--danger)', border: '1px solid color-mix(in oklch, var(--danger) 25%, transparent)' }}>
                替换全部会覆盖当前所有卡组和卡片。确认导入前还会再次询问。
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={reset}
              className="btn btn-ghost btn-block">
              取消
            </button>
            <button onClick={handleConfirmJsonBackup}
              className="btn btn-primary btn-block">
              确认导入
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ---- Preview mode: MD ----
  if (mdPreview) {
    return (
      <div className="page-fill">
        <header className="topbar">
          <button onClick={reset} className="tb-btn">
            <BackIcon />
          </button>
          <h1 className="flex-1 font-zh text-[17px] font-medium text-ink pl-1">MD 导入预览</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-4">
          <div className="settings-card">
            <div className="lbl">卡组名称</div>
            <input value={mdDeckName} onChange={(e) => setMdDeckName(e.target.value)}
              className="w-full py-[9px] px-3 rounded-md border bg-bg text-ink font-zh text-sm outline-none focus:border-accent"
              style={{ borderColor: 'var(--border)' }} />
            <div className="kv-row"><span className="k">解析卡片</span><span className="v">{mdPreview.cards.length}</span></div>
            {dedup.count > 0 && (
              <>
                <div className="kv-row"><span className="k">重复卡片</span><span className="v" style={{ color: 'var(--warn)' }}>{dedup.count}</span></div>
                <div className="seg">
                  <button onClick={() => setSkipDup(true)} className={skipDup ? 'on' : ''}>跳过重复</button>
                  <button onClick={() => setSkipDup(false)} className={!skipDup ? 'on' : ''}>全部导入</button>
                </div>
              </>
            )}
            <div className="kv-row"><span className="k">将导入</span><span className="v" style={{ color: 'var(--accent)', fontWeight: 600 }}>{skipDup ? dedup.filtered.length : mdPreview.cards.length}</span></div>
          </div>
          <div className="settings-card">
            <div className="lbl">卡片预览</div>
            <div className="preview-list max-h-60 overflow-y-auto">
              {mdPreview.cards.slice(0, 10).map((card, i) => (
                <div key={i} className="it">
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  {card.front}
                </div>
              ))}
              {mdPreview.cards.length > 10 && (
                <div className="it" style={{ borderColor: 'var(--border)', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                  <span className="n">···</span>还有 {mdPreview.cards.length - 10} 张
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={reset}
              className="btn btn-ghost btn-block">
              取消
            </button>
            <button onClick={handleConfirmMd}
              className="btn btn-primary btn-block">
              确认导入
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ---- Import mode ----
  return (
    <div className="page-fill">
      <header className="topbar">
        <button onClick={goBack} className="tb-btn">
          <BackIcon />
        </button>
        <h1 className="flex-1 font-zh text-[17px] font-medium text-ink pl-1">导入</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-4">
        {/* Tab toggle */}
        <div className="seg">
          <button onClick={() => setImportTab('json')} className={importTab === 'json' ? 'on' : ''}>
            题库 · JSON
          </button>
          <button onClick={() => setImportTab('md')} className={importTab === 'md' ? 'on' : ''}>
            记忆卡 · MD
          </button>
        </div>

        {importTab === 'json' ? (
          <>
            <div className="settings-card">
              <div className="lbl">文件导入 · FILE</div>
              <div onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDropzoneDragOver} onDragLeave={handleDropzoneDragLeave} onDrop={handleDropzoneDrop}
                className={`dropzone ${dragging ? 'dragging' : ''}`}>
                <div className="icon"><UploadIcon size={18} /></div>
                <div className="label">点击选择 · 或拖入文件</div>
                <div className="ext">.JSON</div>
              </div>
            </div>
            <div className="settings-card">
              <div className="lbl">支持格式 · FORMAT</div>
              <div className="kv-row"><span className="k">questions.json</span><span className="v">题库文件</span></div>
              <div className="kv-row"><span className="k">按章节拆分</span><span className="v">JSON 文件</span></div>
            </div>
            <div className="settings-card">
              <div className="lbl">题目类型 · TYPES</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-3 rounded-md" style={{ background: 'var(--bg-raised)' }}><div className="font-zh text-xs text-ink mt-1">选择</div></div>
                <div className="text-center p-3 rounded-md" style={{ background: 'var(--bg-raised)' }}><div className="font-zh text-xs text-ink mt-1">解答</div></div>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleJsonFile} className="hidden" />
          </>
        ) : (
          <>
            <div className="settings-card">
              <div className="lbl">文件导入 · FILE</div>
              <div onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDropzoneDragOver} onDragLeave={handleDropzoneDragLeave} onDrop={handleDropzoneDrop}
                className={`dropzone ${dragging ? 'dragging' : ''}`}>
                <div className="icon"><UploadIcon size={18} /></div>
                <div className="label">点击选择 · 或拖入文件</div>
                <div className="ext">.MD</div>
              </div>
            </div>
            <div className="settings-card">
              <div className="lbl">粘贴 Markdown</div>
              <textarea className="textarea" value={pasteMd} onChange={(e) => setPasteMd(e.target.value)}
                placeholder="# 章节&#10;## 小节&#10;- 正面&#10;  - 背面" />
              <button onClick={handlePasteSubmit} disabled={!pasteMd.trim()}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-md font-body text-sm font-medium active:scale-[0.97] transition-transform disabled:opacity-40"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent-line)' }}>
                <PasteIcon size={16} /> 解析并预览
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept=".md" onChange={handleMdFile} className="hidden" />
          </>
        )}

        {importTab === 'md' ? (
          <div className="text-[13px] text-ink-2 leading-relaxed font-zh text-center py-2 tracking-[0.04em]">
            不知如何准备？ <Link to="/prompt-guide" style={{ color: 'var(--accent)' }}>查看制卡指南 →</Link>
          </div>
        ) : (
          <div className="text-[13px] text-ink-3 leading-relaxed font-zh text-center py-2 tracking-[0.04em]" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            题库制备指南 · 即将推出
          </div>
        )}
      </main>
    </div>
  )
}
