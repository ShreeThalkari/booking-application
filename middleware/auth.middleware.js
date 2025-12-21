const passport = require('passport')

const authJWT = passport.authenticate('jwt', { session: false })

module.exports = { authJWT }