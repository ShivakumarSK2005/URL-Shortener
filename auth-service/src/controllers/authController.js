const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const { createUser, findUserByEmail } = require("../models/userModel");

const getDatabaseErrorMessage = (error) => {
    if (error.code === "42P01") {
        return "Database table is missing. Create the users table in PostgreSQL.";
    }

    return "Registration failed";
};

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {
        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = uuidv4();

        const user = await createUser(
            userId,
            username,
            email,
            hashedPassword
        );

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: getDatabaseErrorMessage(error),
            code: error.code
        });
    }
};

const loginUser = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    try {

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Login failed"
        });

    }
};

module.exports = {
    registerUser,
    loginUser
};
