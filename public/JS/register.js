document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form')
    const errors = document.getElementById('errors')

    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const formData = new FormData(form);
        errors.innerHTML = '';

        const response = await fetch('/api/register', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        const result = await response.json()

        if (!result.success) {
            let errorFlash = document.createElement('ul');
            result.errors.forEach(err => {
                const li = document.createElement('li');
                li.textContent = err.message;
                li.style.color = 'red';
                errorFlash.appendChild(li)
            });
            errors.appendChild(errorFlash);
            return;
        }

        if (result.success) {
            sessionStorage.setItem(
                'successMessage',
                'You are now registered. Please log in.'
            );

            window.location.href = '/login.html';
        }

    });
})