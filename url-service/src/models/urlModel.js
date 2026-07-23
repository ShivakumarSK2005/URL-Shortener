const pool = require("../config/db");

const createShortUrl = async (
    id,
    userId,
    originalUrl,
    shortCode
) => {

    const query = `
        INSERT INTO urls
        (
            id,
            user_id,
            original_url,
            short_code
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4
        )
        RETURNING *
    `;

    const values = [
        id,
        userId,
        originalUrl,
        shortCode
    ];

    const result =
        await pool.query(
            query,
            values
        );

    return result.rows[0];
};

const findUrlByShortCode = async (shortCode) => {

    const query = `
        SELECT *
        FROM urls
        WHERE short_code = $1
    `;

    const result = await pool.query(
        query,
        [shortCode]
    );

    return result.rows[0];
};

const findUrlByUserAndOriginalUrl = async (
    userId,
    originalUrl
) => {

    const query = `
        SELECT *
        FROM urls
        WHERE user_id = $1
        AND original_url = $2
        ORDER BY created_at ASC
        LIMIT 1
    `;

    const result = await pool.query(
        query,
        [
            userId,
            originalUrl
        ]
    );

    return result.rows[0];
};

const incrementClickCount = async (shortCode) => {

    const query = `
        UPDATE urls
        SET click_count = click_count + 1
        WHERE short_code = $1
    `;

    await pool.query(
        query,
        [shortCode]
    );
};

const getUrlsByUserId = async (userId) => {

    const query = `
        SELECT
            id,
            original_url,
            short_code,
            click_count,
            created_at
        FROM urls
        WHERE user_id = $1
        ORDER BY created_at DESC
    `;

    const result = await pool.query(
        query,
        [userId]
    );

    return result.rows;
};

const deleteUrlByUserAndShortCode = async (
    userId,
    shortCode
) => {

    const query = `
        DELETE FROM urls
        WHERE user_id = $1
        AND short_code = $2
        RETURNING *
    `;

    const result = await pool.query(
        query,
        [
            userId,
            shortCode
        ]
    );

    return result.rows[0];
};


module.exports = {
    createShortUrl,
    findUrlByShortCode,
    findUrlByUserAndOriginalUrl,
    incrementClickCount,
    getUrlsByUserId,
    deleteUrlByUserAndShortCode
};
