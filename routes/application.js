const express = require('express')
const path = require('path')
const router = express.Router()

const {
    registerLogic,
    loginLogic,
    refresh,
    logout,
} = require('@/controllers/auth')

const {
    listingLogic
} = require('@/controllers/listing')

const {
    getPropertyById
} = require('@/controllers/property')

const { checkAvailability } = require('@/controllers/booking')

router.post('/login', loginLogic)

router.post('/register', registerLogic)

router.post('/refresh', refresh)

router.post('/logout', logout)

router.get('/index', listingLogic)

router.get('/property/:id', getPropertyById)

router.get('/property/:id/availability', checkAvailability)

module.exports = router