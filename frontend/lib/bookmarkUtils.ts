import axios from 'axios'

export interface SavedItem {
  id: string
  type: string
  referenceId: string
  createdAt: string
}

export async function addBookmark(type: string, referenceId: string, token?: string | null) {
  try {
    const itemData = { type, referenceId, createdAt: new Date().toISOString() }
    localStorage.setItem(`bookmark_${referenceId}`, JSON.stringify(itemData))
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    await axios.post(`${apiUrl}/api/profile/saved`, { type, referenceId }, { headers })
  } catch (err) {
    console.error('Failed to save bookmark API call:', err)
  }
}

export async function removeBookmark(id: string, referenceId?: string, token?: string | null) {
  try {
    if (referenceId) {
      localStorage.removeItem(`bookmark_${referenceId}`)
      localStorage.removeItem(id)
    } else if (id.startsWith('bookmark_')) {
      localStorage.removeItem(id)
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    await axios.delete(`${apiUrl}/api/profile/saved/${id}`, { headers })
  } catch (err) {
    console.error('Failed to remove bookmark API call:', err)
  }
}

export function getLocalBookmarks(): SavedItem[] {
  if (typeof window === 'undefined') return []
  const items: SavedItem[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('bookmark_')) {
      const refId = key.replace('bookmark_', '')
      try {
        const val = localStorage.getItem(key)
        if (val && val.startsWith('{')) {
          const parsed = JSON.parse(val)
          items.push({
            id: key,
            type: parsed.type || 'activity',
            referenceId: parsed.referenceId || refId,
            createdAt: parsed.createdAt || new Date().toISOString()
          })
        } else {
          items.push({
            id: key,
            type: 'activity',
            referenceId: refId,
            createdAt: new Date().toISOString()
          })
        }
      } catch {
        items.push({
          id: key,
          type: 'activity',
          referenceId: refId,
          createdAt: new Date().toISOString()
        })
      }
    }
  }
  return items
}
