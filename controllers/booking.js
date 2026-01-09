const pool = require('@/config/db')

const bookingLogic = async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = req.user.id; // from auth middleware
        const { propertyId, checkin, checkout, guests } = req.body;

        // 1. Validate input
        if (!propertyId || !checkin || !checkout || !guests) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        if (new Date(checkout) <= new Date(checkin)) {
            return res.status(400).json({
                success: false,
                error: 'Checkout must be after check-in'
            });
        }

        // 2. Start transaction (CRITICAL)
        await client.query('BEGIN');

        // 🔒 AVAILABILITY ENFORCEMENT
        const conflict = await client.query(
            `
                SELECT 1
                FROM bookings
                WHERE property_id = $1
                AND status = 'confirmed'
                AND checkin_date < $3
                AND checkout_date > $2
                FOR UPDATE
            `,
            [propertyId, checkin, checkout]
        );

        if (conflict.rowCount > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                success: false,
                error: 'Dates already booked'
            });
        }

        // 4. Fetch price from DB (DO NOT TRUST FRONTEND)
        const priceResult = await client.query(
            'SELECT property_rate FROM property_details WHERE property_id = $1',
            [propertyId]
        );

        if (!priceResult.rowCount) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        const rate = priceResult.rows[0].property_rate;

        // 6. Calculate total (authoritative)
        const CLEANING_FEE = 75;
        const SERVICE_FEE = 113;

        const nights =
            (new Date(checkout) - new Date(checkin)) /
            (1000 * 60 * 60 * 24);

        const total =
            rate * nights +
            CLEANING_FEE +
            SERVICE_FEE;

        // 7. Insert booking
        const insertQuery = `
            INSERT INTO bookings
            (user_id, property_id, checkin_date, checkout_date, guests, total_price)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id;
        `;

        const booking = await client.query(insertQuery, [
            userId,
            propertyId,
            checkin,
            checkout,
            guests,
            total
        ]);

        // 8. Commit transaction
        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            bookingId: booking.rows[0].id
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Booking failed:', err);

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    } finally {
        client.release();
    }
};

const checkAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkin, checkout } = req.query;

        // 1. Validate input
        if (!checkin || !checkout) {
            return res.status(400).json({
                success: false,
                error: 'Check-in and check-out dates are required'
            });
        }

        // Optional but recommended: date order validation
        if (new Date(checkout) <= new Date(checkin)) {
            return res.status(400).json({
                success: false,
                error: 'Checkout date must be after check-in date'
            });
        }

        // 2. Availability query
        const query = `
            SELECT 1
            FROM bookings
            WHERE property_id = $1
              AND status = 'confirmed'
              AND checkin_date < $3
              AND checkout_date > $2
            LIMIT 1;
        `;

        const result = await pool.query(query, [
            id,
            checkin,
            checkout
        ]);

        // 3. Determine availability
        const isAvailable = result.rowCount === 0;

        // 4. Respond (IMPORTANT)
        return res.json({
            success: true,
            available: isAvailable
        });

    } catch (err) {
        console.error('Availability check failed:', err);

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

module.exports = { bookingLogic, checkAvailability }