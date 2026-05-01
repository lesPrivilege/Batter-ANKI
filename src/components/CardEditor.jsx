import { useState } from 'react'

// Props: initial?, onSave(front, back), onCancel()
export default function CardEditor({ initial, onSave, onCancel }) {
  const [front, setFront] = useState(initial?.front || '')
  const [back, setBack] = useState(initial?.back || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!front.trim() || !back.trim()) return
    onSave(front.trim(), back.trim())
    setFront('')
    setBack('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={front}
        onChange={(e) => setFront(e.target.value)}
        placeholder="Front"
        rows={3}
        className="w-full p-3 rounded-lg border border-border bg-bg-surface text-text-primary
          font-display text-sm placeholder:text-text-secondary/50
          focus:outline-none focus:border-accent resize-none"
      />
      <textarea
        value={back}
        onChange={(e) => setBack(e.target.value)}
        placeholder="Back"
        rows={3}
        className="w-full p-3 rounded-lg border border-border bg-bg-surface text-text-primary
          font-display text-sm placeholder:text-text-secondary/50
          focus:outline-none focus:border-accent resize-none"
      />
      <div className="flex justify-end gap-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg font-medium text-sm font-body
            bg-accent text-white active:scale-[0.97] transition-transform
            disabled:opacity-40"
          disabled={!front.trim() || !back.trim()}
        >
          {initial ? 'Save' : 'Add'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-medium text-sm font-body
              border border-border text-text-secondary
              active:scale-[0.97] transition-transform"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
