const { v4: uuidv4 } = require("uuid");

const redisClient = require("../config/redis");

const {
    createShortUrl,
    findUrlByShortCode,
    findUrlByUserAndOriginalUrl,
    incrementClickCount,
    getUrlsByUserId,
    deleteUrlByUserAndShortCode
} = require("../models/urlModel");

const generateShortCode = () => {

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let shortCode = "";

    for (let i = 0; i < 6; i++) {

        shortCode += characters.charAt(
            Math.floor(
                Math.random() * characters.length
            )
        );
    }

    return shortCode;
};

const shortenUrl = async (req, res) => {

    const { originalUrl } = req.body;

    if (!originalUrl) {
        return res.status(400).json({
            message: "Original URL is required"
        });
    }

    try {

        const urlId = uuidv4();

        const userId =
            req.user.id;

        const existingUrl =
            await findUrlByUserAndOriginalUrl(
                userId,
                originalUrl
            );

        if (existingUrl) {
            return res.status(200).json({
                message: "Short URL already exists",
                url: existingUrl
            });
        }

        const shortCode =
            generateShortCode();

        const url =
            await createShortUrl(
                urlId,
                userId,
                originalUrl,
                shortCode
            );

        return res.status(201).json({
            message: "Short URL created",
            url
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to create short URL"
        });

    }
};

const redirectUrl = async (req, res) => {

    const { shortCode } = req.params;

    try {

        let url;

        const cachedUrl =
            await redisClient.get(
                shortCode
            );

        if (cachedUrl) {

            console.log(
                "Cache Hit:",
                shortCode
            );

            url = JSON.parse(
                cachedUrl
            );

        } else {

            console.log(
                "Cache Miss:",
                shortCode
            );

            url =
                await findUrlByShortCode(
                    shortCode
                );

            if (!url) {
                return res.status(404).json({
                    message: "Short URL not found"
                });
            }

            await redisClient.set(
                shortCode,
                JSON.stringify(url)
            );
        }

        await incrementClickCount(
            shortCode
        );

        return res.redirect(
            url.original_url
        );

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Redirect failed"
        });

    }
};

const getMyUrls = async (req, res) => {

    try {

        const userId = req.user.id;

        const urls =
            await getUrlsByUserId(
                userId
            );

        return res.status(200).json({
            count: urls.length,
            urls
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch URLs"
        });

    }
};

const getUrlStats = async (req, res) => {

    const { shortCode } = req.params;

    try {

        const url =
            await findUrlByShortCode(
                shortCode
            );

        if (!url) {
            return res.status(404).json({
                message: "Short URL not found"
            });
        }

        return res.status(200).json({
            short_code: url.short_code,
            original_url: url.original_url,
            click_count: url.click_count,
            created_at: url.created_at
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch statistics"
        });

    }
};

const deleteUrl = async (req, res) => {

    const { shortCode } = req.params;

    try {

        const userId =
            req.user.id;

        const deletedUrl =
            await deleteUrlByUserAndShortCode(
                userId,
                shortCode
            );

        if (!deletedUrl) {
            return res.status(404).json({
                message: "Short URL not found"
            });
        }

        await redisClient.del(shortCode);

        return res.status(200).json({
            message: "Short URL deleted successfully",
            url: deletedUrl
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to delete short URL"
        });

    }
};

module.exports = {
    shortenUrl,
    redirectUrl,
    getMyUrls,
    getUrlStats,
    deleteUrl
};
