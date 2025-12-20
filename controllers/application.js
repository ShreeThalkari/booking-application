const pool = require('@/config/db.js')
const bcrypt = require('bcrypt')

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


module.exports = {
    registerLogic
}