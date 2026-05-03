// Shared body for ReadingHome and ReadingHomeContent
// Accepts h (useReadingHome return) as props so both wrappers share one hook instance
import { useNavigate } from 'react-router-dom'
import { getDocumentsByCollection, moveCollectionUp, moveCollectionDown } from '../lib/storage'
import { PlusIcon, TrashIcon, UploadIcon, LayersIcon } from '../../components/Icons'

export default function ReadingHomeBody({ h }) {
  const navigate = useNavigate()

  return (
    <>
      {/* Search results */}
      {h.query.trim() && (
        h.searchResults.length === 0 ? (
          <div className="text-center text-ink-3 py-6 font-zh text-sm">没有匹配的文档</div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="section-title">搜索结果</div>
            {h.searchResults.map(({ doc, snippet }) => (
              <div key={doc.id} className="bg-bg-card rounded-lg p-3 border cursor-pointer hover:border-accent transition-colors"
                style={{ borderColor: 'var(--border-soft)' }}
                onClick={() => navigate(`/reading/doc/${doc.id}`)}>
                <div className="font-zh text-[14px] text-ink font-medium truncate">{doc.title}</div>
                {snippet && <div className="font-zh text-[11px] text-ink-3 mt-1 line-clamp-2">{snippet}</div>}
              </div>
            ))}
          </div>
        )
      )}

      {!h.query.trim() && (
        <>
          {h.continueDoc && (
            <div className="bg-bg-card rounded-lg p-4 border cursor-pointer"
              style={{ borderColor: 'var(--accent-line)' }}
              onClick={() => navigate(`/reading/doc/${h.continueDoc.id}`)}>
              <div className="font-mono text-[10px] text-accent tracking-wider mb-1">继续阅读</div>
              <div className="font-zh text-[15px] text-ink font-medium">{h.continueDoc.title}</div>
              <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                <div className="h-full rounded-full" style={{ width: `${h.continueDoc.scrollPct}%`, background: 'var(--accent)' }} />
              </div>
            </div>
          )}

          {(h.stats.totalMinutes > 0 || h.stats.docsCompleted > 0) && (
            <div className="bg-bg-card rounded-lg p-3 flex items-center justify-center gap-8 text-center"
              style={{ border: '1px solid var(--border-soft)' }}>
              <div><div className="font-disp text-xl text-ink">{h.stats.totalMinutes}</div><div className="font-mono text-[9px] text-ink-3">分钟</div></div>
              <div style={{ width: 1, height: 32, background: 'var(--border-soft)' }} />
              <div><div className="font-disp text-xl text-ink">{h.stats.docsCompleted}</div><div className="font-mono text-[9px] text-ink-3">完成</div></div>
              <div style={{ width: 1, height: 32, background: 'var(--border-soft)' }} />
              <div><div className="font-disp text-xl text-accent">{h.stats.streakDays}</div><div className="font-mono text-[9px] text-ink-3">连续天</div></div>
            </div>
          )}

          {h.collections.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="seg" style={{ display: 'inline-flex', width: 'auto' }}>
                {[{ key: 'order', label: '默认' }, { key: 'recent', label: '最近' }, { key: 'created', label: '创建' }].map(s => (
                  <button key={s.key} onClick={() => h.setSortBy(s.key)} className={h.sortBy === s.key ? 'on' : ''}>{s.label}</button>
                ))}
              </div>
            </div>
          )}

          {h.sorted.length === 0 && !h.showNewCol && (
            <div className="empty"><LayersIcon size={48} style={{ color: 'var(--ink-4)' }} /><div className="msg">还没有阅读集合</div><div className="motto-zh">新建集合以开始阅读</div></div>
          )}

          {h.sorted.map((col, colIdx) => {
            const docs = getDocumentsByCollection(col.id)
            const isExpanded = h.expandedCol === col.id
            return (
              <div key={col.id} className="settings-card">
                <div className="flex items-center justify-between cursor-pointer"
                  onClick={() => h.setExpandedCol(isExpanded ? null : col.id)}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{col.icon}</span>
                    <span className="font-zh text-[15px] font-medium text-ink">{col.name}</span>
                    <span className="font-mono text-[11px] text-ink-3">{docs.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {colIdx > 0 && <button onClick={(e) => { e.stopPropagation(); moveCollectionUp(col.id); h.refresh() }} className="text-ink-3 text-xs">↑</button>}
                    {colIdx < h.sorted.length - 1 && <button onClick={(e) => { e.stopPropagation(); moveCollectionDown(col.id); h.refresh() }} className="text-ink-3 text-xs">↓</button>}
                    <button onClick={(e) => { e.stopPropagation(); h.setImportTarget(col.id); h.fileInputRef.current?.click() }} className="text-ink-3 hover:text-ink"><UploadIcon size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); h.setShowNewDoc(col.id) }} className="text-ink-3 hover:text-ink"><PlusIcon size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); h.handleDeleteCollection(col.id, col.name) }} className="text-ink-3 hover:text-danger"><TrashIcon size={14} /></button>
                    <span className={`ch-caret ${isExpanded ? 'open' : ''}`}>›</span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-3 flex flex-col gap-1">
                    {docs.length === 0 ? <div className="text-center text-ink-3 text-xs py-3">暂无文档</div> : docs.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-bg-raised cursor-pointer group"
                        onClick={() => navigate(`/reading/doc/${doc.id}`)}>
                        <div className="flex-1 min-w-0"><div className="font-zh text-[14px] text-ink truncate">{doc.title}</div></div>
                        <button onClick={(e) => { e.stopPropagation(); h.handleDeleteDocument(doc.id) }}
                          className="hidden group-hover:inline-flex text-ink-3 hover:text-danger"><TrashIcon size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* New document form */}
          {h.showNewDoc && (
            <form onSubmit={h.handleAddDocument} className="bg-bg-card rounded-lg p-4 border flex flex-col gap-3"
              style={{ borderColor: 'var(--border-soft)' }}>
              <div className="font-mono text-[10px] text-ink-3 tracking-wider uppercase">新建文档</div>
              <input value={h.newDocTitle} onChange={e => h.setNewDocTitle(e.target.value)}
                placeholder="文档标题" autoFocus
                className="w-full py-[9px] px-3 rounded-md border bg-bg text-ink font-zh text-sm outline-none focus:border-accent"
                style={{ borderColor: 'var(--border)' }} />
              <textarea value={h.newDocContent} onChange={e => h.setNewDocContent(e.target.value)}
                placeholder="文档内容（Markdown）" rows={8}
                className="w-full p-3 rounded-md border bg-bg text-ink font-zh text-sm outline-none focus:border-accent resize-none"
                style={{ borderColor: 'var(--border)' }} />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => h.setShowNewDoc(null)}
                  className="btn btn-ghost">取消</button>
                <button type="submit" disabled={!h.newDocTitle.trim() || !h.newDocContent.trim()}
                  className="btn btn-primary disabled:opacity-40">创建</button>
              </div>
            </form>
          )}

          {h.showNewCol ? (
            <form onSubmit={h.handleAddCollection} className="flex gap-2">
              <input value={h.newColName} onChange={e => h.setNewColName(e.target.value)} placeholder="集合名称" autoFocus
                className="flex-1 px-3 py-2.5 rounded-md border bg-bg-card text-ink font-zh text-sm outline-none focus:border-accent"
                style={{ borderColor: 'var(--border)' }} />
              <button type="submit" disabled={!h.newColName.trim()} className="btn btn-primary disabled:opacity-40">创建</button>
              <button type="button" onClick={() => { h.setShowNewCol(false); h.setNewColName('') }} className="btn btn-ghost">取消</button>
            </form>
          ) : (
            <button onClick={() => h.setShowNewCol(true)} className="btn btn-primary"><PlusIcon size={16} /> 新建集合</button>
          )}
        </>
      )}

      <input ref={h.fileInputRef} type="file" accept=".md,.tex,.txt" onChange={h.handleFileImport} className="hidden" />
    </>
  )
}
