const pool = require('@/config/db')

const getPropertyById = async (req, res) => {
    const { id } = req.params;

    const query = `
                WITH image_data AS (
                    SELECT
                        listing_id,
                        MAX(image_url) FILTER (WHERE is_cover = true) AS cover_image,
                        ARRAY_AGG(image_url ORDER BY display_order)
                            FILTER (WHERE is_cover = false) AS side_images
                    FROM listing_images
                    GROUP BY listing_id
                ),
                amenity_data AS (
                    SELECT
                        la.listing_id,
                        ARRAY_AGG(a.name ORDER BY a.name) AS amenities
                    FROM listing_amenities la
                    JOIN amenities a ON a.id = la.amenity_id
                    GROUP BY la.listing_id
                )

                SELECT
                    l.id,
                    l.title,
                    l.loc_city,
                    l.loc_country,
                    u.username,
                    p.guests,
                    p.property_rate,
                    p.description,

                    img.cover_image,
                    COALESCE(img.side_images, '{}') AS side_images,
                    COALESCE(am.amenities, '{}') AS amenities

                FROM listing l
                JOIN user_data u ON u.id = l.host_id
                JOIN property_details p ON p.property_id = l.id
                LEFT JOIN image_data img ON img.listing_id = l.id
                LEFT JOIN amenity_data am ON am.listing_id = l.id
                WHERE l.id = $1;

    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Property not found' });
    }

    res.json(result.rows[0]); // single property
};

module.exports = { getPropertyById };
