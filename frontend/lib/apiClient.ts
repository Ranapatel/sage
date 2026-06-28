/**
 * Central apiClient utility wrapping fetch.
 * - Automatically prepends process.env.NEXT_PUBLIC_API_URL (or defaults to http://localhost:4000) for relative paths.
 * - Injects 'Authorization: Bearer <token>' by reading 'tripsage-auth' from localStorage.
 * - Injects 'x-session-id' from sessionStorage if available.
 * - Intercepts 401 Unauthorized status, clears 'tripsage-auth' token, and redirects to '/auth'.
 */

const getBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  return 'http://localhost:4000'
}

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('tripsage-auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed?.state?.token || null
    }
  } catch {
    // Ignore parse errors
  }
  return null
}

const getSessionId = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem('sessionId')
  } catch {
    return null
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

export async function customFetch<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const isAbsolute = url.startsWith('http://') || url.startsWith('https://')
  const baseUrl = getBaseUrl()
  const fullUrl = isAbsolute ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`

  // Build query parameters if provided
  let finalUrl = fullUrl
  if (options.params) {
    const queryParams = new URLSearchParams()
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value))
      }
    })
    const separator = finalUrl.includes('?') ? '&' : '?'
    finalUrl = `${finalUrl}${separator}${queryParams.toString()}`
  }

  // Set default headers
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  // Inject authentication header
  const token = getAuthToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Inject session header
  const sessionId = getSessionId()
  if (sessionId && !headers.has('x-session-id')) {
    headers.set('x-session-id', sessionId)
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  }

  const response = await fetch(finalUrl, fetchOptions)

  if (response.status === 401) {
    const path = new URL(finalUrl, typeof window !== 'undefined' ? window.location.origin : undefined).pathname
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('tripsage-auth')
      } catch {
        // Ignore storage errors
      }
      // Only redirect on 401 if it's an explicit booking endpoint
      if (path.includes('/api/booking')) {
        window.location.href = '/auth'
      }
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP error! Status: ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData?.message || errorData?.error || errorMessage
    } catch {
      // Keep fallback status message if json parsing fails
    }
    throw new Error(errorMessage)
  }

  // Return parsed JSON response or text
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }
  return response.text() as unknown as T
}

export const apiClient = {
  get: <T = any>(url: string, options?: RequestOptions) =>
    customFetch<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    customFetch<T>(url, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    customFetch<T>(url, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    customFetch<T>(url, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T = any>(url: string, options?: RequestOptions) =>
    customFetch<T>(url, { ...options, method: 'DELETE' }),
}
