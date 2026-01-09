import { apiFetch } from './apiClient.js'

document.addEventListener('DOMContentLoaded', async () => {
    const profileBtn = document.querySelector('.profile-btn');
    const profileDropdown = document.querySelector('.profile-dropdown');
    const response = await apiFetch('/api/home')
    const logout_btn = document.getElementById('logout-btn')
    const container = document.querySelector('.properties-grid')
    try {

        logout_btn.addEventListener('click', async () => {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            })
            window.location.href = '/login.html'
        })

        if (!response || !response.ok) {
            // auth failed even after refresh
            window.location.href = '/login.html'
            return
        }

        const data = await response.json()
        profileBtn.textContent = data.user.username[0]
        data.properties.forEach(property => {
            container.innerHTML += addPropertyCards(property);
        });


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

        function addPropertyCards(property) {
            return `
            <a href="/property.html?id=${property.id}" class="property-link">
                <div class="property-card">
                    <div class="property-image">
                        <div class="image-placeholder">
                            <img src=${property.image_url} alt="">
                        </div>
                        <button class="wishlist-btn">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>

                    <div class="property-details">
                        <h3 class="property-title">${property.title}</h3>
                        <p class="property-location">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${property.loc_city}, ${property.loc_country}</span>
                        </p>

                        <div class="property-info">
                            <span class="info-item">
                                <i class="fas fa-user-friends"></i>
                                <span>${property.guests} Guests</span>
                            </span>
                            <span class="info-item">
                                <i class="fas fa-bed"></i>
                                <span>${property.bedrooms} Bedrooms</span>
                            </span>
                            <span class="info-item">
                                <i class="fas fa-bath"></i>
                                <span>${property.bathrooms} Bathrooms</span>
                            </span>
                        </div>

                        <div class="property-rating">
                            <div class="stars">
                                <i class="fas fa-star"></i>
                                <span>Rating</span>
                            </div>
                            <span class="price">₹${property.property_rate}/night</span>
                        </div>
                    </div>
                </div>
            </a>
            `
        }
    } catch (err) {
        console.error('Dashboard error:', err)
        window.location.href = '/login.html'
    }

})