const pool = require("../config/db");

const createUser = async (
    id,
    username,
    email,
    password,
    phoneNumber
) => {

    const query = `
        INSERT INTO users
        (id, username, email, password, phone_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const values = [
        id,
        username,
        email,
        password,
        phoneNumber
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows[0];
};

const findUserByEmail = async (email) => {

    const query = `
        SELECT *
        FROM users
        WHERE email = $1
    `;

    const result =
        await pool.query(query, [email]);

    return result.rows[0];
};

const findUserById = async (id) => {

    const query = `
        SELECT
            id,
            username,
            email,
            phone_number,
            created_at
        FROM users
        WHERE id = $1
    `;

    const result =
        await pool.query(query, [id]);

    return result.rows[0];
};

const findUserWithPasswordById = async (id) => {

    const query = `
        SELECT *
        FROM users
        WHERE id = $1
    `;

    const result =
        await pool.query(query, [id]);

    return result.rows[0];
};

const updateUserProfile = async (
    id,
    username,
    email,
    phoneNumber
) => {

    const query = `
        UPDATE users
        SET
            username = $1,
            email = $2,
            phone_number = $3
        WHERE id = $4
        RETURNING
            id,
            username,
            email,
            phone_number,
            created_at
    `;

    const values = [
        username,
        email,
        phoneNumber,
        id
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows[0];
};

const updateUserPassword = async (
    id,
    password
) => {

    const query = `
        UPDATE users
        SET password = $1
        WHERE id = $2
        RETURNING id
    `;

    const result = await pool.query(
        query,
        [
            password,
            id
        ]
    );

    return result.rows[0];
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    findUserWithPasswordById,
    updateUserProfile,
    updateUserPassword
};
