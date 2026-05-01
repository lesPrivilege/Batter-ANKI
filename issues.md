# Issues

## 1. Duplicate rating buttons in Review mode

**Severity:** High (UX bug)

When a card is flipped in Review mode, users see **two sets of rating buttons**:

1. **ReviewCard.jsx lines 56–91**: Again / Hard / Good / Easy (no interval preview)
2. **Review.jsx lines 97–130**: Again / Hard / Good / Easy (with interval preview like "3d")

Both call `handleRate()` and are visible simultaneously. The user sees 8 buttons total. The Review.jsx bottom bar is more useful (has interval predictions), so the ReviewCard.jsx buttons are redundant.

**Suggested fix:** Remove the rating buttons from ReviewCard.jsx, or remove the bottom bar from Review.jsx. Given that Review.jsx's buttons show interval previews (more informative), removing the buttons from ReviewCard.jsx is the cleaner path.

## 2. KaTeX $...$ only works inside backtick code spans

**Severity:** Medium (limitation)

`renderMarkdown.js` handles `$...$` (inline) and `$$...$$` (display) KaTeX math, but **only** within markdown code spans (`$...$`) and fenced code blocks (`$$...$$`). If a user writes `$x^2$` directly in card text without wrapping in backticks, marked treats it as plain text and it will not be rendered as KaTeX.

This means users must write `` `$x^2$` `` instead of just `$x^2$` to get inline math rendering. This is not documented anywhere and may confuse users who expect standard LaTeX syntax to work.

**Suggested fix:** Add a preprocess step in `renderMarkdown.js` that wraps unbackticked `$...$` and `$$...$$` in appropriate delimiters before passing to `marked.parse()`.
