const pool = require("../config/db");

const getDashboard = async (req, res) => {
    try {
        const ownerId = req.user.userId;

        const [stores] = await pool.query(
            `SELECT id, name, email, address
             FROM stores
             WHERE owner_id = ?`,
            [ownerId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No store assigned to this owner"
            });
        }

        const store = stores[0];

        const [ratingData] = await pool.query(
            `SELECT
                r.rating,
                u.id AS userId,
                u.name AS userName,
                u.email AS userEmail
             FROM ratings r
             INNER JOIN users u ON r.user_id = u.id
             WHERE r.store_id = ?`,
            [store.id]
        );

        const [averageData] = await pool.query(
            `SELECT COALESCE(AVG(rating), 0) AS averageRating
             FROM ratings
             WHERE store_id = ?`,
            [store.id]
        );

        res.status(200).json({
            success: true,
            store: {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address
            },
            averageRating: Number(averageData[0].averageRating),
            totalRatings: ratingData.length,
            ratings: ratingData
        });

    } catch (error) {
        console.error("Owner dashboard error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch owner dashboard"
        });
    }
};

module.exports = {
    getDashboard
};