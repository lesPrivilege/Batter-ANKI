import { marked } from 'marked'
import katex from 'katex'
import 'katex/dist/katex.min.css'

marked.use({ breaks: true, gfm: true })

marked.use({
  renderer: {
    codespan({ text }) {
      const trimmed = text.trim()
      if (trimmed.startsWith('$') && trimmed.endsWith('$') && trimmed.length >= 2) {
        const latex = trimmed.slice(1, -1).trim()
        try {
          return katex.renderToString(latex, { output: 'html', throwOnError: false })
        } catch {
          return `<code class="katex-error">${latex}</code>`
        }
      }
      return `<code>${text}</code>`
    },
    code({ text, lang }) {
      const trimmed = text.trim()
      if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length >= 4) {
        const latex = trimmed.slice(2, -2).trim()
        try {
          return `<div class="katex-display">${katex.renderToString(latex, { displayMode: true, throwOnError: false })}</div>`
        } catch {
          return `<pre><code class="katex-error">${latex}</code></pre>`
        }
      }
      return `<pre><code${lang ? ` class="language-${lang}"` : ''}>${text}</code></pre>`
    },
  },
})

export default function renderMarkdown(raw) {
  return marked.parse(raw)
}
