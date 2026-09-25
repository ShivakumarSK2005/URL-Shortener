const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const {
    createUser,
    findUserByEmail,
    findUserById,
    findUserWithPasswordById,
    updateUserProfile,
    updateUserPassword
} = require("../models/userModel");

const getDatabaseErrorMessage = (error) => {
    if (error.code === "42P01") {
        return "Database table is missing. Create the users table in PostgreSQL.";
    }

    return "Registration failed";
};

const registerUser = async (req, res) => {
    const { username, email, password, phoneNumber } = req.body;

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
            hashedPassword,
            phoneNumber || null
        );

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone_number: user.phone_number,
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

const getProfile = async (req, res) => {

    try {

        const user =
            await findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            user
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch profile"
        });

    }
};

const updateProfile = async (req, res) => {

    const { username, email, phoneNumber } = req.body;

    if (!username || !email) {
        return res.status(400).json({
            message: "Username and email are required"
        });
    }

    try {

        const existingUser =
            await findUserByEmail(email);

        if (
            existingUser &&
            existingUser.id !== req.user.id
        ) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const user =
            await updateUserProfile(
                req.user.id,
                username,
                email,
                phoneNumber || null
            );

        return res.status(200).json({
            message: "Profile updated successfully",
            user
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to update profile"
        });

    }
};

const changePassword = async (req, res) => {

    const {
        currentPassword,
        newPassword
    } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            message: "Current password and new password are required"
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            message: "New password must be at least 6 characters"
        });
    }

    try {

        const user =
            await findUserWithPasswordById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch =
            await bcrypt.compare(
                currentPassword,
                user.password
            );

        if (!isMatch) {
            return res.status(401).json({
                message: "Current password is incorrect"
            });
        }

        const hashedPassword =
            await bcrypt.hash(newPassword, 10);

        await updateUserPassword(
            req.user.id,
            hashedPassword
        );

        return res.status(200).json({
            message: "Password changed successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to change password"
        });

    }
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    changePassword
};
