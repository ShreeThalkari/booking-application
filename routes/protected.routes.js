const express = require('express')
const router = express.Router()

const { authJWT } = require('@/middleware/auth.middleware')
const { homePage, authChecker } = require('@/controllers/listing')
const { bookingLogic } = require('@/controllers/booking')

router.get('/home', authJWT, homePage)

router.get('/me', authJWT, authChecker)

router.post('/booking', authJWT, bookingLogic)


module.exports = router