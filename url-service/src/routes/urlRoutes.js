const express = require("express");

const router = express.Router();

const authenticateUser =
    require("../middleware/authMiddleware");

const {
    shortenUrl,
    redirectUrl,
    getMyUrls,
    getUrlStats,
    deleteUrl
} = require("../controllers/urlController");

router.post(
    "/shorten",
    authenticateUser,
    shortenUrl
);

router.get(
    "/my-urls",
    authenticateUser,
    getMyUrls
);

router.get(
    "/stats/:shortCode",
    authenticateUser,
    getUrlStats
);

router.delete(
    "/:shortCode",
    authenticateUser,
    deleteUrl
);

router.get(
    "/:shortCode",
    redirectUrl
);

module.exports = router;
