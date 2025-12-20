require('dotenv').config()
require('module-alias/register')

const express = require('express')
const app = express()

app.use(express.static('public'));

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

let application = require('./routes/application')

app.use('/api', application)

app.listen(5000, () => {
    console.log('http://localhost:5000')
})
