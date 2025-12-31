document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('.properties-grid');
    const property_count = document.querySelector('.property-count')
    if (!container) return;

    try {
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

    } catch (err) {
        console.error(err);
    }
});

function createPropertyCard(property) {
    return `
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
                        $${property.property_rate}<span>/night</span>
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

