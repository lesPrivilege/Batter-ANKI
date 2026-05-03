import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useCallback, useRef } from 'react'
import { App } from '@capacitor/app'
import { isNative } from './platform'

const PARENT_MAP = {
  '/': null,
  '/settings': '/',
  '/import': '/',
  '/prompt-guide': '/import',
  '/wrong': '/',
  '/starred': '/',
  '/search': '/',
}

function getParent(pathname, searchParams) {
  if (pathname.startsWith('/deck/')) return '/'
  if (pathname.startsWith('/review/')) {
    const id = pathname.split('/')[2]
    return `/deck/${id}`
  }
  if (pathname.startsWith('/browse/')) {
    const id = pathname.split('/')[2]
    return `/deck/${id}`
  }
  if (pathname.startsWith('/quiz/') || pathname.startsWith('/quiz-review/')) return '/'
  if (pathname.startsWith('/set/')) return '/'
  if (pathname.startsWith('/reading/doc/')) return '/reading'
  if (pathname.startsWith('/collection/')) return '/reading'
  if (pathname === '/reading') return '/'
  if (pathname === '/import' && searchParams) {
    const deckId = searchParams.get('deckId')
    if (deckId) return `/deck/${deckId}`
  }
  return PARENT_MAP[pathname] ?? '/'
}

export function useBackButton() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const parent = getParent(pathname, searchParams)

  // Use refs so the native listener (registered once) always reads current values
  const parentRef = useRef(parent)
  parentRef.current = parent
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  const goBack = useCallback(() => {
    if (parent) {
      navigate(parent)
    }
  }, [parent, navigate])

  useEffect(() => {
    if (!isNative()) return

    let removed = false
    let handle = null

    App.addListener('backButton', () => {
      if (removed) return
      const p = parentRef.current
      if (p) {
        // Use history back to respect actual navigation flow, not route hierarchy.
        // This fixes: Home(Tab) → /collection/:id → back → Home (not /reading).
        navigateRef.current(-1)
      } else {
        App.exitApp()
      }
    }).then(h => {
      if (!removed) handle = h
    })

    return () => {
      removed = true
      if (handle) handle.remove()
    }
  }, []) // register once — refs keep values current

  return { goBack, parent }
}
