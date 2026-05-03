// Shared hook for ReadingHome and ReadingHomeContent
// Extracts all common state, handlers, and logic

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  getCollections, addCollection, deleteCollection,
  getDocumentsByCollection, addDocument, deleteDocument,
  getRecentDocuments, getContinueReading,
  moveCollectionUp, moveCollectionDown,
} from '../lib/storage'
import { readFileAsDocument, ACCEPT } from '../lib/importer'
import { searchDocuments } from '../lib/search'
import { getReadingStats } from '../lib/stats'

export function useReadingHome() {
  const [collections, setCollections] = useState([])
  const [showNewCol, setShowNewCol] = useState(false)
  const [newColName, setNewColName] = useState('')
  const [expandedCol, setExpandedCol] = useState(null)
  const [showNewDoc, setShowNewDoc] = useState(null)
  const [newDocTitle, setNewDocTitle] = useState('')
  const [newDocContent, setNewDocContent] = useState('')
  const [newDocFormat, setNewDocFormat] = useState('md')
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

  // ── File import ─────────────────────────────────────

  const [importTarget, setImportTarget] = useState(null)

  const handleFileImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !importTarget) return
    try {
      const { title, content, format } = await readFileAsDocument(file)
      addDocument(importTarget, title, content, format)
      refresh()
    } catch { alert('文件导入失败，请检查文件格式') }
    e.target.value = ''
  }

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
    if (expandedCol === id) setExpandedCol(null)
    refresh()
  }

  // ── Document CRUD ───────────────────────────────────

  const handleAddDocument = (e) => {
    e.preventDefault()
    if (!newDocTitle.trim() || !newDocContent.trim()) return
    addDocument(showNewDoc, newDocTitle.trim(), newDocContent.trim(), newDocFormat)
    setNewDocTitle('')
    setNewDocContent('')
    setShowNewDoc(null)
    refresh()
  }

  const handleDeleteDocument = (id) => {
    if (!confirm('删除这篇文档？')) return
    deleteDocument(id)
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
    // State
    collections, sorted, showNewCol, newColName, expandedCol,
    showNewDoc, newDocTitle, newDocContent, newDocFormat,
    sortBy, setSortBy,
    query, setQuery, searchResults,
    recentDocs, continueDoc, stats,
    // Refs
    fileInputRef: useRef(null),
    // Setters
    setShowNewCol, setNewColName, setExpandedCol,
    setShowNewDoc, setNewDocTitle, setNewDocContent, setNewDocFormat,
    setImportTarget,
    // Handlers
    refresh,
    handleAddCollection, handleDeleteCollection,
    handleAddDocument, handleDeleteDocument,
    handleFileImport,
  }
}
