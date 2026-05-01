# Issues

## ~~1. Duplicate rating buttons in Review mode~~ (Fixed in v0.7.3)

**Severity:** High (UX bug)

Fixed in v0.7.3 — rating buttons removed from ReviewCard.jsx, only Review.jsx bottom bar remains.

## 2. KaTeX $...$ only works inside backtick code spans

**Severity:** Medium (limitation)

`renderMarkdown.js` handles `$...$` (inline) and `$$...$$` (display) KaTeX math, but **only** within markdown code spans (`$...$`) and fenced code blocks (`$$...$$`). If a user writes `$x^2$` directly in card text without wrapping in backticks, marked treats it as plain text and it will not be rendered as KaTeX.

This means users must write `` `$x^2$` `` instead of just `$x^2$` to get inline math rendering. This is not documented anywhere and may confuse users who expect standard LaTeX syntax to work.

**Suggested fix:** Add a preprocess step in `renderMarkdown.js` that wraps unbackticked `$...$` and `$$...$$` in appropriate delimiters before passing to `marked.parse()`.
