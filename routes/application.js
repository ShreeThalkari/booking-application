const express = require('express')
const path = require('path')
const router = express.Router()

const {
    registerLogic
} = require('@/controllers/application')

// !router.post('/login', loginLogic)

router.post('/register', registerLogic)

module.exports = router