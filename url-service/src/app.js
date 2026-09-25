require("dotenv").config();

require("./config/db");

require("./config/redis");

const express = require("express");
const cors = require("cors");

const urlRoutes = require("./routes/urlRoutes");

const app = express();

app.use(cors());
app.use((req, res, next) => {
    if (req.url.startsWith("//")) {
        req.url = req.url.replace(/^\/+/, "/");
    }
    next();
});
app.use(express.json());
app.use("/api/urls", urlRoutes);

app.get("/", (req, res) => {
    res.send("URL Service Running");
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`URL Service running on port ${PORT}`);
});
