# 🏡 Property Booking & Availability Management System

A **full-stack web application** that enables users to browse properties, view real-time availability, and make conflict-free bookings with secure authentication and intelligent date-selection logic.

The system follows **real-world hotel booking rules** such as exclusive checkout, back-to-back reservations, and backend-verified availability.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- Secure user authentication using **Passport.js** and **JWT**
- Role-based access control for users and hosts
- Protected routes for bookings and property management

### 📅 Smart Booking System
- Real-time date availability with conflict prevention
- Checkout dates treated as **exclusive**, allowing back-to-back bookings
- Prevents selecting date ranges that cross already booked dates
- Dynamic checkout limits based on the next unavailable date

### 🧠 Backend-Verified Availability
- Frontend calendar logic synchronized with backend SQL availability checks
- Prevents overlapping reservations and race conditions
- Final availability validation before booking confirmation

### 🖼️ Image Management
- Integrated **Cloudinary** for secure image storage
- Optimized image delivery using Cloudinary CDN
- Supports cover images and multiple images per property

### 💰 Dynamic Pricing
- Automatic price calculation based on number of nights
- Additional service and cleaning fee handling
- Real-time UI updates on date selection

### 🏘️ Property Management
- Property listing with amenities, images, and host details
- Dynamic guest selection based on property capacity
- Responsive UI built using HTML and CSS

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Flatpickr (date picker)

### Backend
- Node.js
- Express.js
- Passport.js
- JWT (JSON Web Tokens)

### Database
- PostgreSQL
- SQL-based availability validation
- Indexed date queries for performance

### Cloud & Tools
- Cloudinary (image storage & delivery)
- RESTful APIs
- Git & GitHub

---

## 🧩 Booking Logic (Core Design)

### Booking Rules
- **Check-in date** → inclusive  
- **Check-out date** → exclusive  
- Only occupied nights are blocked
- Checkout day remains available for new bookings

## ⚙️ Installation & Setup
```
### 1️⃣ Clone the repository
git clone https://github.com/your-username/property-booking-system.git
cd property-booking-system

### 2️⃣ Install dependencies
npm install

### 3️⃣ Environment variables

Create a .env file:

PORT=3000

DATABASE_URL=your_postgres_url

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=xxxx

CLOUDINARY_API_KEY=xxxx

CLOUDINARY_API_SECRET=xxxx

### 4️⃣ Run the application
npm start
```
## 🔐 Security Considerations

- JWT-based stateless authentication

- Protected booking routes

- Backend availability validation

- Secure media handling via Cloudinary

- Optional soft-delete strategy for expired bookings

## 📈 Future Enhancements

- Reviews and ratings system

- Host dashboard and analytics

- Payment gateway integration

- Admin moderation panel

## 🎯 Key Learnings

- Designing real-world booking systems

- Synchronizing frontend UI rules with backend validation

- Preventing race conditions in reservation systems

- Implementing secure authentication and authorization

- Integrating third-party cloud services

## 👨‍💻 Author

Shree Thalkari

IT Engineering Student | Full-Stack Developer

📍 Pune, India
