require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const pool = require("./config/db");

const app = express();

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Auth Service Running");
});

app.use("/api/auth", authRoutes);

pool.query("SELECT NOW()")
    .then((result) => {
        console.log("Database Connected");
        console.log(result.rows[0]);
    })
    .catch((err) => {
        console.error("Database Connection Error");
        console.error(err);
    });

app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});
