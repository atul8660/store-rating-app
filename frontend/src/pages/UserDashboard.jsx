import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function UserDashboard() {
    const [stores, setStores] = useState([]);

    const [nameSearch, setNameSearch] = useState("");
    const [addressSearch, setAddressSearch] = useState("");

    const [selectedRatings, setSelectedRatings] = useState({});

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [ratingMessage, setRatingMessage] = useState("");

    const fetchStores = async (name = "", address = "") => {
        try {
            setLoading(true);
            setMessage("");

            const params = {};

            if (name) {
                params.name = name;
            }

            if (address) {
                params.address = address;
            }

            const response = await api.get("/user/stores", {
                params
            });

            setStores(response.data.stores);
        } catch (error) {
            console.error("Fetch stores error:", error);

            setMessage(
                error.response?.data?.message ||
                "Failed to load stores"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const handleSearch = (event) => {
        event.preventDefault();

        fetchStores(nameSearch, addressSearch);
    };

    const clearSearch = () => {
        setNameSearch("");
        setAddressSearch("");
        fetchStores();
    };

    const handleRatingChange = (storeId, rating) => {
        setSelectedRatings((previous) => ({
            ...previous,
            [storeId]: rating
        }));
    };

    const handleSubmitRating = async (
        storeId,
        existingRating
    ) => {
        const rating = selectedRatings[storeId];

        if (!rating) {
            setRatingMessage(
                "Please select a rating first."
            );
            return;
        }

        try {
            let response;

            if (
                existingRating !== null &&
                existingRating !== undefined
            ) {
                response = await api.put(
                    `/user/ratings/${storeId}`,
                    { rating }
                );
            } else {
                response = await api.post(
                    "/user/ratings",
                    {
                        storeId,
                        rating
                    }
                );
            }

            setRatingMessage(response.data.message);

            await fetchStores(
                nameSearch,
                addressSearch
            );

            setSelectedRatings((previous) => ({
                ...previous,
                [storeId]: ""
            }));
        } catch (error) {
            console.error("Rating error:", error);

            setRatingMessage(
                error.response?.data?.message ||
                "Failed to submit rating"
            );
        }
    };

    return (
        <div>
            <Navbar />

            <main className="dashboard-page">
                <h1 className="page-title">
                    User Dashboard
                </h1>

                {/* Search */}
                <section className="section">
                    <h2 className="section-title">
                        Find a Store
                    </h2>

                    <form onSubmit={handleSearch}>
                        <div className="search-row">
                            <input
                                className="search-input"
                                type="text"
                                placeholder="Search by store name"
                                value={nameSearch}
                                onChange={(event) =>
                                    setNameSearch(
                                        event.target.value
                                    )
                                }
                            />

                            <input
                                className="search-input"
                                type="text"
                                placeholder="Search by address"
                                value={addressSearch}
                                onChange={(event) =>
                                    setAddressSearch(
                                        event.target.value
                                    )
                                }
                            />

                            <button
                                className="btn btn-primary"
                                type="submit"
                            >
                                Search
                            </button>

                            <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={clearSearch}
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </section>

                {/* Messages */}
                {ratingMessage && (
                    <div className="message message-success">
                        {ratingMessage}
                    </div>
                )}

                {message && (
                    <div className="message message-error">
                        {message}
                    </div>
                )}

                {loading && (
                    <div className="section">
                        <p>Loading stores...</p>
                    </div>
                )}

                {/* Store list */}
                {!loading && stores.length === 0 && !message && (
                    <div className="section">
                        <p>No stores found.</p>
                    </div>
                )}

                {!loading && stores.length > 0 && (
                    <section>
                        <div className="store-grid">
                            {stores.map((store) => (
                                <div
                                    className="store-card"
                                    key={store.id}
                                >
                                    <h2>{store.name}</h2>

                                    <p className="store-info">
                                        <strong>
                                            Address:
                                        </strong>{" "}
                                        {store.address}
                                    </p>

                                    <p className="store-info">
                                        <strong>
                                            Overall Rating:
                                        </strong>{" "}
                                        <span className="rating-value">
                                            {Number(
                                                store.overallRating
                                            ).toFixed(1)}{" "}
                                            / 5
                                        </span>
                                    </p>

                                    <p className="store-info">
                                        <strong>
                                            Your Rating:
                                        </strong>{" "}
                                        <span className="rating-value">
                                            {store.userRating ??
                                                "Not rated"}
                                        </span>
                                    </p>

                                    <div className="form-actions">
                                        <select
                                            className="search-select"
                                            value={
                                                selectedRatings[
                                                    store.id
                                                ] || ""
                                            }
                                            onChange={(event) =>
                                                handleRatingChange(
                                                    store.id,
                                                    Number(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select Rating
                                            </option>
                                            <option value="1">
                                                1
                                            </option>
                                            <option value="2">
                                                2
                                            </option>
                                            <option value="3">
                                                3
                                            </option>
                                            <option value="4">
                                                4
                                            </option>
                                            <option value="5">
                                                5
                                            </option>
                                        </select>

                                        <button
                                            className="btn btn-primary"
                                            type="button"
                                            onClick={() =>
                                                handleSubmitRating(
                                                    store.id,
                                                    store.userRating
                                                )
                                            }
                                        >
                                            {store.userRating !==
                                                null &&
                                            store.userRating !==
                                                undefined
                                                ? "Modify Rating"
                                                : "Submit Rating"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default UserDashboard;