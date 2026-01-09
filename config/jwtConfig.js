const { Strategy: JwtStrategy } = require('passport-jwt');
const pool = require('@/config/db.js');

const cookieExtractor = (req) => {
    if (req && req.cookies) {
        return req.cookies.token; // MUST match cookie name
    }
    return null;
};

function initJwtStrategy(passport) {
    const opts = {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.JWT_SECRET
    };

    passport.use(
        new JwtStrategy(opts, async (payload, done) => {
            try {
                const result = await pool.query(
                    'SELECT id, username FROM user_data WHERE id = $1',
                    [payload.userId]
                );

                if (result.rows.length === 0) {
                    return done(null, false);
                }

                return done(null, result.rows[0]);
            } catch (err) {
                return done(err, false);
            }
        })
    );
}

module.exports = initJwtStrategy;
