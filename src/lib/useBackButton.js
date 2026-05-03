import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
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

  const goBack = useCallback(() => {
    if (parent) {
      navigate(parent)
    }
  }, [parent, navigate])

  useEffect(() => {
    if (!isNative()) return

    const listener = App.addListener('backButton', () => {
      if (parent) {
        navigate(parent)
      } else {
        App.exitApp()
      }
    })

    return () => { listener.then(l => l.remove()) }
  }, [parent, navigate])

  return { goBack, parent }
}
