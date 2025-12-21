require('dotenv').config()
require('module-alias/register')

const express = require('express')
const passport = require('passport')
const cookieParser = require('cookie-parser')

const initLocal = require('./config/passportConfig')
const initJwt = require('./config/jwtConfig')
const application = require('./routes/application')
const protectedRoutes = require('./routes/protected.routes')

const app = express()


app.use(cookieParser())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(passport.initialize())
initLocal(passport)
initJwt(passport)

app.use('/api', application)
app.use('/api', protectedRoutes)

app.listen(5000, () => {
    console.log('http://localhost:5000')
})
