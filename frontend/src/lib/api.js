// Tiny API helpers. Centralised so swapping environments is one edit.
//
// VITE_API_URL is set in .env.local for local-against-local dev, in
// Netlify env vars for production. Falls back to the live Render dyno.

export const API_URL =
  import.meta.env.VITE_API_URL || 'https://pazhamozhi-api.onrender.com'

export function imageSrc(path) {
  if (!path) return ''
  // The API already returns paths like "/image/PP001.jpeg".
  return `${API_URL}${path}`
}

export async function searchByText(query, topK = 8) {
  const res = await fetch(`${API_URL}/search/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: topK }),
  })
  if (!res.ok) throw new Error(`Search failed (${res.status})`)
  return res.json()
}

export async function searchByImage(file, topK = 8) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('top_k', String(topK))
  const res = await fetch(`${API_URL}/search/image`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`Image search failed (${res.status})`)
  return res.json()
}

export async function pingHealth() {
  return fetch(`${API_URL}/health`).catch(() => null)
}

export function formatPrice(p) {
  return `₹${Number(p).toLocaleString('en-IN')}`
}
