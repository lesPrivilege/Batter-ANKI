// Shared hook for ReadingHome and ReadingHomeContent
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  getCollections, addCollection, deleteCollection,
  getDocumentsByCollection, getRecentDocuments, getContinueReading,
} from '../lib/storage'
import { searchDocuments } from '../lib/search'
import { getReadingStats } from '../lib/stats'

export function useReadingHome() {
  const [collections, setCollections] = useState([])
  const [showNewCol, setShowNewCol] = useState(false)
  const [newColName, setNewColName] = useState('')
  const [sortBy, setSortBy] = useState('order')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [recentDocs, setRecentDocs] = useState([])
  const [continueDoc, setContinueDoc] = useState(null)
  const [stats, setStats] = useState({ totalMinutes: 0, docsCompleted: 0, streakDays: 0 })
  const debounceRef = useRef(null)

  const refresh = useCallback(() => {
    setCollections(getCollections())
    setRecentDocs(getRecentDocuments(5))
    setContinueDoc(getContinueReading())
    setStats(getReadingStats())
  }, [])

  useEffect(refresh, [])

  // ── Search ──────────────────────────────────────────

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!query.trim()) { setSearchResults([]); return }
      setSearchResults(searchDocuments(query))
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  // ── Collection CRUD ─────────────────────────────────

  const handleAddCollection = (e) => {
    e.preventDefault()
    if (!newColName.trim()) return
    addCollection(newColName.trim())
    setNewColName('')
    setShowNewCol(false)
    refresh()
  }

  const handleDeleteCollection = (id, name) => {
    if (!confirm(`删除集合「${name}」及其所有文档？`)) return
    deleteCollection(id)
    refresh()
  }

  // ── Sort collections ────────────────────────────────

  const sorted = [...collections]
  if (sortBy === 'recent') {
    sorted.sort((a, b) => {
      const aDocs = getDocumentsByCollection(a.id)
      const bDocs = getDocumentsByCollection(b.id)
      const aMax = aDocs.reduce((max, d) => d.lastReadAt > max ? d.lastReadAt : max, '')
      const bMax = bDocs.reduce((max, d) => d.lastReadAt > max ? d.lastReadAt : max, '')
      return bMax.localeCompare(aMax)
    })
  } else if (sortBy === 'created') {
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  return {
    collections, sorted, showNewCol, newColName,
    sortBy, setSortBy,
    query, setQuery, searchResults,
    recentDocs, continueDoc, stats,
    setShowNewCol, setNewColName,
    refresh,
    handleAddCollection, handleDeleteCollection,
  }
}
