const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const pool = require('@/config/db.js')

function initJwtStrategy(passport) {
    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    }

    passport.use(
        new JwtStrategy(opts, async (payload, done) => {
            const result = await pool.query(
                'SELECT id, username FROM user_data WHERE id = $1',
                [payload.userId]
            )

            if (result.rows.length === 0) {
                return done(null, false)
            }

            return done(null, result.rows[0])
        })
    )
}

module.exports = initJwtStrategy;