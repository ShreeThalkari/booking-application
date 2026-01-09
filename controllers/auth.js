const pool = require('@/config/db.js')
const bcrypt = require('bcrypt')
const {
    generateAccessToken,
    generateRefreshToken
} = require('@/utils/token')
const passport = require('passport');

const registerLogic = async (req, res) => {
    const { first_name, last_name, username, email, password, c_password } = req.body;
    const errors = [];

    try {
        const emailCheck = await pool.query(
            'SELECT EXISTS (SELECT 1 FROM user_data WHERE email = $1)',
            [email]
        );

        const usernameCheck = await pool.query(
            'SELECT EXISTS (SELECT 1 FROM user_data WHERE username = $1)',
            [username]
        );

        if (emailCheck.rows[0].exists) {
            errors.push({ message: 'Email is already used' });
        }

        if (usernameCheck.rows[0].exists) {
            errors.push({ message: 'Username already exists' });
        }

        if (!password || password.length < 6) {
            errors.push({ message: 'Password must be at least 6 characters' });
        }

        if (password !== c_password) {
            errors.push({ message: 'Passwords do not match' });
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO user_data (first_name, last_name, email, username, password) VALUES ($1, $2, $3, $4, $5)`,
            [first_name, last_name, email, username, hashedPassword]
        );

        return res.status(201).json({
            success: true,
            message: 'You are now registered. Please log in.'
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const loginLogic = (req, res, next) => {
    passport.authenticate('local', { session: false }, async (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({
                errors: [{ message: info?.message || 'Invalid credentials' }]
            })
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();

        await pool.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at)
             VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
            [user.id, refreshToken]
        )

        res
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            .json({ accessToken })
    })(req, res, next)
}

// controllers/auth.js
const refresh = async (req, res) => {
    const oldRefreshToken = req.cookies.refreshToken
    if (!oldRefreshToken) return res.sendStatus(401)

    // 1️⃣ Check token exists and is valid
    const result = await pool.query(
        `SELECT user_id FROM refresh_tokens
         WHERE token = $1 AND expires_at > NOW()`,
        [oldRefreshToken]
    )

    if (result.rows.length === 0) {
        return res.sendStatus(403) // token reuse or expired
    }

    const userId = result.rows[0].user_id

    // 2️⃣ DELETE old refresh token (rotation)
    await pool.query(
        'DELETE FROM refresh_tokens WHERE token = $1',
        [oldRefreshToken]
    )

    // 3️⃣ Generate new tokens
    const newAccessToken = generateAccessToken({ id: userId })
    const newRefreshToken = generateRefreshToken()

    // 4️⃣ Store new refresh token
    await pool.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [userId, newRefreshToken]
    )

    // 5️⃣ Set new refresh token cookie
    res
        .cookie('token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        })
        .cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .json({ success: true })
}


const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken

    if (refreshToken) {
        await pool.query(
            'DELETE FROM refresh_tokens WHERE token = $1',
            [refreshToken]
        )
    }

    res.clearCookie('refreshToken')
    res.sendStatus(204)
}

module.exports = {
    registerLogic,
    loginLogic,
    refresh,
    logout
}