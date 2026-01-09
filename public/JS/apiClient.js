import { getToken, setToken } from './authState.js'

export async function apiFetch(url, options = {}) {
    // 1️⃣ Ensure we have an access token
    if (!getToken()) {
        const refreshRes = await fetch('/api/refresh', {
            method: 'POST',
            credentials: 'include'
        })

        if (!refreshRes.ok) {
            return null
        }

        const refreshData = await refreshRes.json()
        setToken(refreshData.accessToken)
    }

    // 2️⃣ Make the actual API request with token
    let res = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${getToken()}`
        },
        credentials: 'include'
    })

    // 3️⃣ If token expired between steps, refresh once more
    if (res.status === 401) {
        const refreshRes = await fetch('/api/refresh', {
            method: 'POST',
            credentials: 'include'
        })

        if (!refreshRes.ok) {
            window.location.href = '/login.html'
            return
        }

        const refreshData = await refreshRes.json()
        setToken(refreshData.accessToken)

        // 🔁 Retry original request WITH NEW TOKEN
        res = await fetch(url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization: `Bearer ${getToken()}`
            },
            credentials: 'include'
        })
    }

    return res
}
