const express = require('express')
const router = express.Router()

const { authJWT } = require('@/middleware/auth.middleware')
const { homePage } = require('@/controllers/listing')

router.get('/home', authJWT, homePage)

module.exports = router