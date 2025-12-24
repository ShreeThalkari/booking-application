const pool = require('@/config/db');

const homePage = async (req, res) => {
    try {
        const query = `
            SELECT
                l.id,
                l.title,
                l.loc_country,
                l.loc_city,
                p.guests,
                p.bedrooms,
                p.bathrooms,
                p.property_rate,
                i.image_url
            FROM listing l
            JOIN property_details p
                ON l.id = p.property_id
            LEFT JOIN listing_images i
                ON l.id = i.listing_id
            AND i.is_cover = true
            ORDER BY l.id DESC
            LIMIT $1;
        `;

        const result = await pool.query(query, [3]);

        res.status(200).json({
            user: req.user,
            properties: result.rows,
            message: 'Welcome to dashboard'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to load homepage listings'
        });
    }
};

module.exports = { homePage };
