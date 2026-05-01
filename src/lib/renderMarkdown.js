import { marked } from 'marked'
import katex from 'katex'
import DOMPurify from 'dompurify'
import 'katex/dist/katex.min.css'

marked.use({ breaks: true, gfm: true })

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderKatex(latex, displayMode = false) {
  try {
    return katex.renderToString(latex, { displayMode, output: 'html', throwOnError: false })
  } catch {
    return `<code class="katex-error">${escapeHtml(latex)}</code>`
  }
}

marked.use({
  extensions: [
    {
      name: 'mathBlock',
      level: 'block',
      start(src) {
        return src.match(/\$\$/)?.index
      },
      tokenizer(src) {
        const match = src.match(/^\$\$[ \t]*\n?([\s\S]+?)\n?\$\$(?:\n|$)/)
        if (!match) return false
        const latex = match[1].trim()
        if (!latex) return false
        return {
          type: 'mathBlock',
          raw: match[0],
          text: latex,
        }
      },
      renderer(token) {
        return `<div class="katex-display">${renderKatex(token.text, true)}</div>`
      },
    },
    {
      name: 'mathInline',
      level: 'inline',
      start(src) {
        return src.match(/\$/)?.index
      },
      tokenizer(src) {
        if (src.startsWith('$$')) return false

        const match = src.match(/^\$([^\s$](?:\\.|[^$])*?)\$(?![\d])/)
        if (!match) return false

        const latex = match[1].trim()
        if (!latex) return false

        return {
          type: 'mathInline',
          raw: match[0],
          text: latex,
        }
      },
      renderer(token) {
        return renderKatex(token.text)
      },
    },
  ],
  renderer: {
    codespan({ text }) {
      const trimmed = text.trim()
      if (trimmed.startsWith('$') && trimmed.endsWith('$') && trimmed.length >= 2) {
        const latex = trimmed.slice(1, -1).trim()
        return renderKatex(latex)
      }
      return `<code>${escapeHtml(text)}</code>`
    },
    code({ text, lang }) {
      const trimmed = text.trim()
      if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length >= 4) {
        const latex = trimmed.slice(2, -2).trim()
        return `<div class="katex-display">${renderKatex(latex, true)}</div>`
      }
      const language = lang ? String(lang).replace(/[^a-zA-Z0-9_-]/g, '') : ''
      return `<pre><code${language ? ` class="language-${language}"` : ''}>${escapeHtml(text)}</code></pre>`
    },
  },
})

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['p','br','strong','em','code','pre','ul','ol','li','table','thead','tbody','tr','th','td','blockquote','hr','span','div','a','h1','h2','h3','h4'],
  ALLOWED_ATTR: ['class','href','target','rel'],
}

export default function renderMarkdown(raw) {
  const html = marked.parse(raw)
  return DOMPurify.sanitize(html, SANITIZE_CONFIG)
}
