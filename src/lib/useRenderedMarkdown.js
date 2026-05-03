import { useState, useEffect } from 'react'
import { renderMarkdownAsync } from './renderMarkdown'

export function useRenderedMarkdown(raw) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    let cancelled = false
    renderMarkdownAsync(raw)
      .then((result) => { if (!cancelled) setHtml(result) })
      .catch(() => { if (!cancelled) setHtml('') })
    return () => { cancelled = true }
  }, [raw])

  return html
}
