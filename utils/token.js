const jwt = require('jsonwebtoken')
const crypto = require('crypto')


function generateAccessToken(user) {
    return jwt.sign(
        {
            userId: user.id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    )
}


function generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex')
}

module.exports = { generateAccessToken, generateRefreshToken };