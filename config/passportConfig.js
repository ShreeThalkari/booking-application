const { Strategy: LocalStrategy } = require('passport-local')
const bcrypt = require('bcrypt')
const pool = require('@/config/db')

function initialize(passport) {
    const authenticateUser = async (username, password, done) => {
        try {
            const result = await pool.query(
                'SELECT id, username, password FROM user_data WHERE username = $1',
                [username]
            )

            if (result.rows.length === 0) {
                return done(null, false, { message: 'Invalid credentials' })
            }

            const user = result.rows[0]
            const match = await bcrypt.compare(password, user.password)

            if (!match) {
                return done(null, false, { message: 'Invalid credentials' })
            }

            return done(null, user)
        } catch (err) {
            return done(err)
        }
    }
    passport.use(new LocalStrategy(
        {
            usernameField: "username",
            passwordField: "password"
        },
        authenticateUser
    ))
}

module.exports = initialize