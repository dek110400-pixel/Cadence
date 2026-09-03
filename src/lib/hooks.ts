import { useEffect, useRef } from 'preact/hooks'

export function useInterval(fn: () => void, ms: number) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    const id = setInterval(() => ref.current(), ms)
    return () => clearInterval(id)
  }, [ms])
}

/** Il pulsante Indietro / swipe di sistema chiude il pannello aperto. */
export function useBackClose(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return
    history.pushState({ sheet: true }, '')
    const onPop = () => close()
    addEventListener('popstate', onPop)
    return () => {
      removeEventListener('popstate', onPop)
      if (history.state?.sheet) history.back()
    }
  }, [open])
}

/** Espone l'altezza della tastiera software in --kb per non coprire i campi. */
export function useKeyboardInset() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const inset = Math.max(0, innerHeight - vv.height - vv.offsetTop)
      document.documentElement.style.setProperty('--kb', inset + 'px')
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])
}

export function isStandalone(): boolean {
  return (
    (navigator as unknown as { standalone?: boolean }).standalone === true ||
    matchMedia('(display-mode: standalone)').matches
  )
}

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}
