const express = require('express')
const path = require('path')
const router = express.Router()

const {
    registerLogic,
    loginLogic,
    refresh,
    logout
} = require('@/controllers/auth')

router.post('/login', loginLogic)

router.post('/register', registerLogic)

router.post('/refresh', refresh)

router.post('/logout', logout)

module.exports = router