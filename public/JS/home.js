// dashboard.js
import { apiFetch } from './apiClient.js'

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const logout_btn = document.getElementById('logoutBtn')
        logout_btn.addEventListener('click', async () => {
            await fetch('/api/logout', {
                method: "POST",
                credentials: "include"
            })
            location.href = '/login.html'
        })

        const response = await apiFetch('/api/home')

        if (!response || !response.ok) {
            // auth failed even after refresh
            window.location.href = '/login.html'
            return
        }

        const data = await response.json()

        // Example DOM usage
        document.getElementById('welcome').textContent =
            `Welcome back, ${data.user.username}`

    } catch (err) {
        console.error('Dashboard error:', err)
        window.location.href = '/login.html'
    }
})
