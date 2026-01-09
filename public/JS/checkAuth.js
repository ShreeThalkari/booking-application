// public/JS/checkAuth.js
import { apiFetch } from './apiClient.js'

export async function checkAuth() {
    const res = await apiFetch('/api/me')

    if (!res || !res.ok) {
        return { authenticated: false }
    }

    const data = await res.json()
    return { authenticated: true, user: data.user }
}
