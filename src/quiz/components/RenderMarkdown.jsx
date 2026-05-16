import { useState, useEffect } from 'react'
import { renderMarkdownAsync } from '../../lib/renderMarkdown'

export default function RenderMarkdown({ content, className = '' }) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    if (!content) {
      setHtml('')
      return
    }

    let cancelled = false

    renderMarkdownAsync(content)
      .then((result) => { if (!cancelled) setHtml(result) })
      .catch(() => { if (!cancelled) setHtml('') })

    return () => { cancelled = true }
  }, [content])

  if (!content) return null

  return (
    <div
      className={`card-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}