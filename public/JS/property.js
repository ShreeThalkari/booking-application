import { checkAuth } from './checkAuth.js'
document.addEventListener('DOMContentLoaded', async () => {
    const profileBtn = document.querySelector('.profile-btn');
    const profileDropdown = document.querySelector('.profile-dropdown');
    const root = document.getElementById('property-root')
    const loginBtn = document.getElementById('login-btn')   // Login / Signup
    const avatar = document.querySelector('.profile-btn')
    const signupBtn = document.getElementById('sign-up-btn')
    const logout_btn = document.getElementById('logout-btn')
    const auth = await checkAuth()
    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get('id');

    try {

        const res = await fetch(`/api/property/${propertyId}`, {
            credentials: 'include'
        });

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

        logout_btn.addEventListener('click', async () => {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            })
            window.location.href = '/login.html'
        })

        let nights = 0
        const data = await res.json();
        root.innerHTML = property_details(data.result, nights)

        const main_image = document.querySelector('.main-image')
        const side_images = document.querySelector('.side-images')
        const amenities_grid = document.querySelector('.amenities-grid')

        main_image.innerHTML = `
            <img src=${data.result.cover_image} alt="">
        `
        data.result.side_images.forEach(img => {
            side_images.innerHTML += `
                <img src=${img} alt="">
            `
        });

        data.result.amenities.forEach(data => {
            amenities_grid.innerHTML += `
                <div class="amenity-item">
                    <span> -> ${data}</span>
                </div>
            `
        })

        const guests_nos = document.querySelector(".guests-dropdown");
        guests_nos.innerHTML = "";

        const maxGuests = Number(data.result.guests);
        const limit = Math.min(maxGuests, 4);

        let guests = 1;

        for (let i = 1; i <= limit; i++) {
            guests_nos.innerHTML += `
                <option value="${i}">
                    ${i} ${i === 1 ? "guest" : "guests"}
                </option>
            `;
        }

        if (maxGuests > 5) {
            guests_nos.innerHTML += `
                <option value="5+">5+ guests</option>
            `;
        }

        guests_nos.addEventListener('change', (event) => {
            const value = event.target.value;

            guests = value === "5+" ? 5 : Number(value);
        });
        // Toggle dropdown
        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                profileDropdown.classList.toggle('show');
            });
        }

        // Close dropdown when clicking outside
        if (profileBtn && profileDropdown) {
            document.addEventListener('click', function (e) {
                if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                    profileDropdown.classList.remove('show');
                }
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && profileDropdown.classList.contains('show')) {
                    profileDropdown.classList.remove('show');
                }
            });
        }

        //? Date Booking

        let selectedCheckin = null;
        let selectedCheckout = null;

        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');

        const book_btn = document.querySelector('.btn-book')

        const bookedDates = [];

        dateDisable(bookedDates, data.dates.checkin_dates, data.dates.checkout_dates)

        console.log(bookedDates)

        if (checkinInput && checkoutInput && typeof flatpickr === 'function') {

            const checkoutPicker = flatpickr(checkoutInput, {
                minDate: "today",
                disable: bookedDates,
                dateFormat: "Y-m-d",
                onChange(selectedDates) {
                    if (!selectedDates.length || !selectedCheckin) return;

                    selectedCheckout = selectedDates[0];
                    nights = getNights(selectedCheckin, selectedCheckout);

                    // Update UI
                    document.getElementById('night_cnt').textContent =
                        `${data.result.property_rate} x ${nights} nights`

                    document.getElementById("subtotal").textContent =
                        `₹${data.result.property_rate * nights}`;

                    document.getElementById("total").textContent =
                        `₹${data.result.property_rate * nights + 75 + 113}`;

                    book_btn.disabled = false;
                }
            });

            flatpickr(checkinInput, {
                minDate: "today",
                disable: bookedDates,
                dateFormat: "Y-m-d",
                onChange(selectedDates) {
                    if (!selectedDates.length) return;

                    selectedCheckin = selectedDates[0];

                    const minCheckoutDate = new Date(selectedCheckin);
                    minCheckoutDate.setDate(minCheckoutDate.getDate() + 1);

                    const nextBlockedDate = findNextBlockedDate(selectedCheckin, bookedDates);

                    checkoutPicker.set("minDate", minCheckoutDate);

                    if (nextBlockedDate) {
                        checkoutPicker.set("maxDate", nextBlockedDate);
                    } else {
                        checkoutPicker.set("maxDate", null);
                    }

                    checkoutPicker.clear();


                    selectedCheckout = null;
                    nights = 0;

                    document.getElementById("subtotal").textContent = `₹0`;
                    document.getElementById("total").textContent =
                        `₹${75 + 113}`;
                }
            });

            document.querySelector('.btn-book').addEventListener('click', async (req, res) => {
                if (!auth.authenticated) {
                    alert('Please Login to book')
                    return
                }

                if (!guests || guests < 1) {
                    alert("Select number of guests");
                    return;
                }

                const isAvailable = await fetch(
                    `/api/property/${propertyId}/availability?checkin=${toYMD(selectedCheckin)}&checkout=${toYMD(selectedCheckout)}`,
                    {
                        credentials: 'include'
                    }
                )

                const availability = await isAvailable.json();

                if (!availability.available) {
                    alert("Dates are unavailable. Please choose some other dates.");
                    return;
                }

                const bookingPayload = {
                    propertyId: propertyId,
                    checkin: toYMD(selectedCheckin),
                    checkout: toYMD(selectedCheckout),
                    guests: guests
                }

                const response = await fetch('/api/booking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(bookingPayload)
                });

                const result = await response.json();

                if (!result.success) {
                    alert(result.error || "Booking failed");
                    return;
                }

                alert("Booking successful!");
                book_btn.disabled = true;
            })
        }


    } catch (err) {

    }

    function property_details(data, nights) {
        return `
        <section class="property-details">
            <div class="container">
                <div class="property-header">
                    <h1 class="property-title">${data.title}</h1>
                    <div class="property-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${data.loc_city}, ${data.loc_country}</span>
                    </div>
                </div>

                <div class="property-gallery">
                    <div class="main-image">
                        
                    </div>
                    <div class="side-images">
                        
                    </div>
                </div>

                <div class="property-content">
                    <div class="property-info">
                        <div class="host-section">
                            <div class="host-profile">
                                <div class="host-avatar">S</div>
                                <div class="host-details">
                                    <h3>Hosted by ${data.username}</h3>
                                    <p>Superhost • 5 years hosting</p>
                                </div>
                            </div>
                        </div>

                        <div class="property-description">
                            <h2>About this property</h2>
                            <p>${data.description}</p>
                        </div>

                        <div class="property-amenities">
                            <h2>Amenities</h2>
                            <div class="amenities-grid">
                                
                            </div>
                        </div>
                    </div>

                    <div class="booking-card">
                        <div class="booking-price">
                            <span class="price">₹${data.property_rate}</span>
                            <span class="period">/ night</span>
                        </div>

                        <div class="booking-dates">
                            <div class="date-input">
                                <label>Check-in</label>
                                <input id="checkin" required>
                            </div>
                            <div class="date-input">
                                <label>Check-out</label>
                                <input id="checkout" required>
                            </div>
                        </div>

                        <div class="guests-selector">
                            <label>Guests</label>
                            <select class="guests-dropdown">
                                
                            </select>
                        </div>

                        <div class="booking-summary">
                            <div class="summary-item">
                                <span id = 'night_cnt'>${data.property_rate} x ${nights} nights</span>
                                <span id="subtotal">₹${data.property_rate * nights}</span>
                            </div>
                            <div class="summary-item">
                                <span>Cleaning fee</span>
                                <span>₹75</span>
                            </div>
                            <div class="summary-item">
                                <span>Service fee</span>
                                <span>₹113</span>
                            </div>
                            <div class="summary-total">
                                <span>Total</span>
                                <span id="total">₹${data.property_rate * nights + 75 + 113}</span>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-book" disabled>Book Now</button>
                    </div>
                </div>
            </div>
        </section>
        `
    }

    function getNights(checkinDate, checkoutDate) {
        const MS_PER_DAY = 1000 * 60 * 60 * 24;
        return Math.round((checkoutDate - checkinDate) / MS_PER_DAY);
    }

    function toYMD(date) {
        return (
            date.getFullYear() + "-" +
            String(date.getMonth() + 1).padStart(2, "0") + "-" +
            String(date.getDate()).padStart(2, "0")
        );
    }

    function dateDisable(bookedDates, checkin, checkout) {
        for (let i = 0; i < checkin.length; i++) {

            const fromDate = new Date(checkin[i]);
            const toDate = new Date(checkout[i]);

            // make checkout EXCLUSIVE
            toDate.setDate(toDate.getDate() - 1);

            bookedDates.push({
                from: toYMD(fromDate),
                to: toYMD(toDate)
            });
        }
    }

    function findNextBlockedDate(checkinDate, bookedRanges) {
        let nextBlocked = null;

        bookedRanges.forEach(range => {
            const from = new Date(range.from);

            if (from > checkinDate) {
                if (!nextBlocked || from < nextBlocked) {
                    nextBlocked = from;
                }
            }
        });

        return nextBlocked;
    }


})
