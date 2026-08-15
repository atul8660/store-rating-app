const pool = require("../config/db");

const getStores = async (req,res) => {
    try{
        const{name, address} = req.query;

        const userId = req. user.userId;

        let query = `
            SELECT
                s.id,
                s.name,
                s.address,
                COALESCE(AVG(allRatings.rating), 0) AS overallRating,
                userRating.rating AS userRating
            FROM stores s
            LEFT JOIN ratings allRatings
                ON s.id = allRatings.store_id
            LEFT JOIN ratings userRating
                ON s.id = userRating.store_id
                AND userRating.user_id = ?
            WHERE 1 = 1
        `;

        const values = [userId];

        if(name){
            query += "AND s.name LIKE ?";
            values.push(`%${name}%`);
        }

        if(address){
            query += "AND s.address LIKE ?";
            values.push(`%${address}%`);
        }

        query += `
            GROUP BY
                s.id,
                s.name,
                s.address,
                userRating.rating
            ORDER BY s.name ASC
        `;

        const [stores] = await pool.query(query, values);

        res.status(200).json({
            success: true,
            count: stores.length,
            stores
        });

    } catch (error) {
        console.error("Get stores error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch stores"
        });
    }
};

const submitRating = async (req, res) => {
    try {
        const { storeId, rating } = req.body;
        const userId = req.user.userId;

        // Check required fields
        if (!storeId || rating === undefined) {
            return res.status(400).json({
                success: false,
                message: "Store ID and rating are required"
            });
        }

        // Rating must be between 1 and 5
        if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }

        // Check whether store exists
        const [stores] = await pool.query(
            "SELECT id FROM stores WHERE id = ?",
            [storeId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        // Check whether this user already rated this store
        const [existingRatings] = await pool.query(
            `SELECT id
             FROM ratings
             WHERE user_id = ? AND store_id = ?`,
            [userId, storeId]
        );

        if (existingRatings.length > 0) {
            return res.status(409).json({
                success: false,
                message: "You have already rated this store"
            });
        }

        // Insert rating
        const [result] = await pool.query(
            `INSERT INTO ratings (user_id, store_id, rating)
             VALUES (?, ?, ?)`,
            [userId, storeId, Number(rating)]
        );

        res.status(201).json({
            success: true,
            message: "Rating submitted successfully",
            ratingId: result.insertId
        });

    } catch (error) {
        console.error("Submit rating error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to submit rating"
        });
    }
};

const updateRating = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { rating } = req.body;
        const userId = req.user.userId;

        // Check rating
        if (rating === undefined) {
            return res.status(400).json({
                success: false,
                message: "Rating is required"
            });
        }

        if (
            !Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }

        // Check existing rating
        const [existingRatings] = await pool.query(
            `SELECT id
             FROM ratings
             WHERE user_id = ? AND store_id = ?`,
            [userId, storeId]
        );

        if (existingRatings.length === 0) {
            return res.status(404).json({
                success: false,
                message: "You have not rated this store yet"
            });
        }

        // Update rating
        await pool.query(
            `UPDATE ratings
             SET rating = ?
             WHERE user_id = ? AND store_id = ?`,
            [Number(rating), userId, storeId]
        );

        res.status(200).json({
            success: true,
            message: "Rating updated successfully"
        });

    } catch (error) {
        console.error("Update rating error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update rating"
        });
    }
};

module.exports = { 
    getStores, 
    submitRating,
    updateRating
 };