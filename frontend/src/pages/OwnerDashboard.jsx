import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function OwnerDashboard() {
    const [store, setStore] = useState(null);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [ratings, setRatings] = useState([]);

    const [sortBy, setSortBy] = useState("userName");
    const [order, setOrder] = useState("ASC");

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setMessage("");

            const response = await api.get("/owner/dashboard");

            setStore(response.data.store);
            setAverageRating(response.data.averageRating);
            setTotalRatings(response.data.totalRatings);
            setRatings(response.data.ratings);
        } catch (error) {
            console.error("Owner dashboard error:", error);

            setMessage(
                error.response?.data?.message ||
                "Failed to load owner dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const sortedRatings = [...ratings].sort((a, b) => {
        let first;
        let second;

        if (sortBy === "userName") {
            first = a.userName.toLowerCase();
            second = b.userName.toLowerCase();
        } else if (sortBy === "userEmail") {
            first = a.userEmail.toLowerCase();
            second = b.userEmail.toLowerCase();
        } else {
            first = Number(a.rating);
            second = Number(b.rating);
        }

        if (first < second) {
            return order === "ASC" ? -1 : 1;
        }

        if (first > second) {
            return order === "ASC" ? 1 : -1;
        }

        return 0;
    });

    if (loading) {
        return (
            <div>
                <Navbar />

                <main className="dashboard-page">
                    <div className="section">
                        <h1 className="page-title">
                            Store Owner Dashboard
                        </h1>

                        <p>Loading dashboard...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div>
            <Navbar />

            <main className="dashboard-page">
                <h1 className="page-title">
                    Store Owner Dashboard
                </h1>

                {message && (
                    <div className="message message-error">
                        {message}
                    </div>
                )}

                {store && (
                    <section className="section">
                        <h2 className="section-title">
                            My Store
                        </h2>

                        <div className="store-card">
                            <h2>{store.name}</h2>

                            <p className="store-info">
                                <strong>Email:</strong>{" "}
                                {store.email}
                            </p>

                            <p className="store-info">
                                <strong>Address:</strong>{" "}
                                {store.address}
                            </p>
                        </div>
                    </section>
                )}

                <section className="section">
                    <h2 className="section-title">
                        Rating Summary
                    </h2>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>Average Rating</h3>

                            <p>
                                {Number(
                                    averageRating
                                ).toFixed(1)}{" "}
                                / 5
                            </p>
                        </div>

                        <div className="stat-card">
                            <h3>Total Ratings</h3>

                            <p>{totalRatings}</p>
                        </div>
                    </div>
                </section>

                <section className="section">
                    <h2 className="section-title">
                        Users Who Submitted Ratings
                    </h2>

                    {ratings.length === 0 ? (
                        <p>
                            No ratings have been submitted yet.
                        </p>
                    ) : (
                        <>
                            <div className="search-row">
                                <select
                                    className="search-select"
                                    value={sortBy}
                                    onChange={(event) =>
                                        setSortBy(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="userName">
                                        Sort: Name
                                    </option>

                                    <option value="userEmail">
                                        Sort: Email
                                    </option>

                                    <option value="rating">
                                        Sort: Rating
                                    </option>
                                </select>

                                <select
                                    className="search-select"
                                    value={order}
                                    onChange={(event) =>
                                        setOrder(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="ASC">
                                        Ascending
                                    </option>

                                    <option value="DESC">
                                        Descending
                                    </option>
                                </select>
                            </div>

                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Rating</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {sortedRatings.map(
                                            (rating, index) => (
                                                <tr
                                                    key={`${rating.userId}-${index}`}
                                                >
                                                    <td>
                                                        {
                                                            rating.userName
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            rating.userEmail
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            rating.rating
                                                        }{" "}
                                                        / 5
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}

export default OwnerDashboard;