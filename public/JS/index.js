import { checkAuth } from './checkAuth.js'

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('.properties-grid');
    const property_count = document.querySelector('.property-count')
    const loginBtn = document.getElementById('login-btn')   // Login / Signup
    const signupBtn = document.getElementById('sign-up-btn')   // Login / Signup
    const profileBtn = document.getElementById('profileBtn') // Profile / Avatar
    const avatar = document.querySelector('.profile-btn')
    const profileDropdown = document.querySelector('.profile-dropdown');
    const logout_btn = document.getElementById('logout-btn')
    const auth = await checkAuth()
    if (!container) return;

    try {
        if (auth.authenticated) {
            loginBtn.style.display = 'none'
            signupBtn.style.display = 'none'
            profileBtn.style.display = 'block'
            if (avatar) {
                avatar.textContent = auth.user.username[0].toUpperCase();
            }
        } else {
            profileBtn.style.display = 'none'
            loginBtn.style.display = 'block'
            signupBtn.style.display = 'block'
        }
        const response = await fetch('/api/index', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch listings');
        }

        const listing_data = await response.json();

        property_count.querySelector('span').textContent = listing_data.properties.length;

        let html = '';
        listing_data.properties.forEach(property => {
            html += createPropertyCard(property);
        });

        container.innerHTML = html;

        logout_btn.addEventListener('click', async () => {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            })
            window.location.href = '/login.html'
        })

        // Toggle dropdown
        profileBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('show');
            }
        });

        // Close dropdown on escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && profileDropdown.classList.contains('show')) {
                profileDropdown.classList.remove('show');
            }
        });

    } catch (err) {
        console.error(err);
    }
});

function createPropertyCard(property) {
    return `
        <a href="/property.html?id=${property.id}" class="property-link">
            <div class="property-card" id="${property.id}">
                <div class="property-image">
                    <div class="image-placeholder">
                        <img src="${property.image_url}" alt="property image">
                    </div>
                    <div class="property-badge">${toTitleCase(property.property_type)}</div>
                </div>

                <div class="property-details">
                    <div class="property-header">
                        <div>
                            <h3 class="property-title">${property.title}</h3>
                            <div class="property-location">
                                <i class="fas fa-map-marker-alt"></i>
                                ${property.loc_city}, ${property.loc_country}
                            </div>
                        </div>
                        <div class="property-price">
                            ₹${property.property_rate}<span>/night</span>
                        </div>
                    </div>

                    <div class="property-features">
                        <div class="feature">
                            <i class="fas fa-bed"></i>
                            <span>${property.bedrooms} Bedrooms</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-bath"></i>
                            <span>${property.bathrooms} Bathroom</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-user-friends"></i>
                            <span>${property.guests} Guests</span>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    `;
}

function toTitleCase(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

