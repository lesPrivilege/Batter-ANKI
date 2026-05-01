# Issues

## ~~1. Duplicate rating buttons in Review mode~~ (Fixed in v0.7.3)

**Severity:** High (UX bug)

Fixed in v0.7.3 — rating buttons removed from ReviewCard.jsx, only Review.jsx bottom bar remains.

## ~~2. KaTeX $...$ only works inside backtick code spans~~ (Fixed)

**Severity:** Medium (limitation)

Fixed — `renderMarkdown.js` now registers marked inline/block math extensions so normal `$...$` and `$$...$$` formulas render through KaTeX without requiring Markdown code spans. Existing backtick-wrapped formulas remain supported for compatibility.
