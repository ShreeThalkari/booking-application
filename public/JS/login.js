import { setToken } from './authState.js'

document.addEventListener('DOMContentLoaded', () => {
    const register_success_msg = document.getElementById('register_success_msg')
    const form = document.getElementById('form')
    const errors = document.getElementById('errors')

    const successMessage = sessionStorage.getItem('successMessage')
    if (successMessage) {
        register_success_msg.textContent = successMessage
        register_success_msg.style.color = 'green'
        sessionStorage.removeItem('successMessage')
    } else {
        register_success_msg.classList.add('no_msg')
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        errors.innerHTML = ''

        const formData = new FormData(form)

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(Object.fromEntries(formData))
        })

        const result = await response.json()

        if (!response.ok) {
            const ul = document.createElement('ul')
            result.errors?.forEach(err => {
                const li = document.createElement('li')
                li.textContent = err.message
                li.style.color = 'red'
                ul.appendChild(li)
            })
            errors.appendChild(ul)
            return
        }

        // ✅ industry standard: store in memory
        setToken(result.accessToken)

        window.location.href = '/home.html'
    })
})
