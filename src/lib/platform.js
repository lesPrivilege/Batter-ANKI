let _isNative = null

export function isNative() {
  if (_isNative === null) {
    _isNative = typeof window !== 'undefined' &&
      window.Capacitor !== undefined &&
      window.Capacitor.isNativePlatform()
  }
  return _isNative
}
