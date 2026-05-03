// Reading file import utilities
// Handles .md, .tex, .txt file reading and format detection

/**
 * Supported file extensions for reading import
 */
export const ACCEPT = '.md,.tex,.txt'

/**
 * Detect document format from filename extension
 * @param {string} filename
 * @returns {'md'|'tex'|'txt'}
 */
export function detectFormat(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  if (ext === 'tex' || ext === 'latex') return 'tex'
  if (ext === 'txt') return 'txt'
  return 'md'
}

/**
 * Derive a clean title from filename (strip extension)
 * @param {string} filename
 * @returns {string}
 */
export function titleFromFilename(filename) {
  return filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
}

/**
 * Read a File object and return document data
 * @param {File} file
 * @returns {Promise<{title: string, content: string, format: string}>}
 */
export function readFileAsDocument(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        title: titleFromFilename(file.name),
        content: reader.result,
        format: detectFormat(file.name),
      })
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
