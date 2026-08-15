import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function AdminDashboard() {
    // =========================
    // Dashboard statistics
    // =========================

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStores: 0,
        totalRatings: 0
    });

    // =========================
    // Users
    // =========================

    const [users, setUsers] = useState([]);

    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userAddress, setUserAddress] = useState("");
    const [userRole, setUserRole] = useState("");

    const [userSortBy, setUserSortBy] = useState("name");
    const [userOrder, setUserOrder] = useState("ASC");

    const [selectedUser, setSelectedUser] = useState(null);
    const [loadingUserDetails, setLoadingUserDetails] = useState(false);

    // =========================
    // Add User
    // =========================

    const [showUserForm, setShowUserForm] = useState(false);

    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "USER"
    });

    const [userFormMessage, setUserFormMessage] = useState("");

    // =========================
    // Stores
    // =========================

    const [stores, setStores] = useState([]);

    const [storeName, setStoreName] = useState("");
    const [storeEmail, setStoreEmail] = useState("");
    const [storeAddress, setStoreAddress] = useState("");

    const [storeSortBy, setStoreSortBy] = useState("name");
    const [storeOrder, setStoreOrder] = useState("ASC");

    // =========================
    // Add Store
    // =========================

    const [showStoreForm, setShowStoreForm] = useState(false);

    const [newStore, setNewStore] = useState({
        name: "",
        email: "",
        address: "",
        ownerId: ""
    });

    const [storeFormMessage, setStoreFormMessage] = useState("");

    // =========================
    // General
    // =========================

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    // =========================
    // Dashboard
    // =========================

    const fetchDashboard = async () => {
        try {
            const response = await api.get("/admin/dashboard");

            setStats(response.data.data);
        } catch (error) {
            console.error("Dashboard error:", error);

            setMessage(
                error.response?.data?.message ||
                "Failed to load dashboard"
            );
        }
    };

    // =========================
    // Users
    // =========================

    const fetchUsers = async () => {
        try {
            const params = {};

            if (userName) {
                params.name = userName;
            }

            if (userEmail) {
                params.email = userEmail;
            }

            if (userAddress) {
                params.address = userAddress;
            }

            if (userRole) {
                params.role = userRole;
            }

            params.sortBy = userSortBy;
            params.order = userOrder;

            const response = await api.get("/admin/users", {
                params
            });

            setUsers(response.data.users);
        } catch (error) {
            console.error("Users error:", error);

            setMessage(
                error.response?.data?.message ||
                "Failed to load users"
            );
        }
    };

    // =========================
    // User details
    // =========================

    const handleViewUserDetails = async (userId) => {
        try {
            setLoadingUserDetails(true);
            setMessage("");

            const response = await api.get(
                `/admin/users/${userId}`
            );

            setSelectedUser(response.data);
        } catch (error) {
            console.error(
                "User details error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to load user details"
            );
        } finally {
            setLoadingUserDetails(false);
        }
    };

    const closeUserDetails = () => {
        setSelectedUser(null);
    };

    // =========================
    // Stores
    // =========================

    const fetchStores = async () => {
        try {
            const params = {};

            if (storeName) {
                params.name = storeName;
            }

            if (storeEmail) {
                params.email = storeEmail;
            }

            if (storeAddress) {
                params.address = storeAddress;
            }

            params.sortBy = storeSortBy;
            params.order = storeOrder;

            const response = await api.get("/admin/stores", {
                params
            });

            setStores(response.data.stores);
        } catch (error) {
            console.error("Stores error:", error);

            setMessage(
                error.response?.data?.message ||
                "Failed to load stores"
            );
        }
    };

    // =========================
    // Initial load
    // =========================

    const fetchAll = async () => {
        try {
            setLoading(true);
            setMessage("");

            await Promise.all([
                fetchDashboard(),
                fetchUsers(),
                fetchStores()
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    // =========================
    // User search
    // =========================

    const handleUserSearch = (event) => {
        event.preventDefault();

        fetchUsers();
    };

    const clearUserSearch = () => {
        setUserName("");
        setUserEmail("");
        setUserAddress("");
        setUserRole("");

        setTimeout(() => {
            fetchUsers();
        }, 0);
    };

    // =========================
    // Store search
    // =========================

    const handleStoreSearch = (event) => {
        event.preventDefault();

        fetchStores();
    };

    const clearStoreSearch = () => {
        setStoreName("");
        setStoreEmail("");
        setStoreAddress("");

        setTimeout(() => {
            fetchStores();
        }, 0);
    };

    // =========================
    // Create User
    // =========================

    const handleUserFormChange = (event) => {
        const { name, value } = event.target;

        setNewUser((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleCreateUser = async (event) => {
        event.preventDefault();

        try {
            setUserFormMessage("");

            const response = await api.post(
                "/admin/users",
                newUser
            );

            setUserFormMessage(
                response.data.message
            );

            setNewUser({
                name: "",
                email: "",
                password: "",
                address: "",
                role: "USER"
            });

            await Promise.all([
                fetchUsers(),
                fetchDashboard()
            ]);
        } catch (error) {
            console.error(
                "Create user error:",
                error
            );

            setUserFormMessage(
                error.response?.data?.message ||
                "Failed to create user"
            );
        }
    };

    // =========================
    // Create Store
    // =========================

    const handleStoreFormChange = (event) => {
        const { name, value } = event.target;

        setNewStore((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleCreateStore = async (event) => {
        event.preventDefault();

        try {
            setStoreFormMessage("");

            const payload = {
                name: newStore.name,
                email: newStore.email,
                address: newStore.address
            };

            if (newStore.ownerId) {
                payload.ownerId = Number(
                    newStore.ownerId
                );
            }

            const response = await api.post(
                "/admin/stores",
                payload
            );

            setStoreFormMessage(
                response.data.message
            );

            setNewStore({
                name: "",
                email: "",
                address: "",
                ownerId: ""
            });

            await Promise.all([
                fetchStores(),
                fetchDashboard()
            ]);
        } catch (error) {
            console.error(
                "Create store error:",
                error
            );

            setStoreFormMessage(
                error.response?.data?.message ||
                "Failed to create store"
            );
        }
    };

    // =========================
    // Loading
    // =========================

    if (loading) {
        return (
            <div>
                <Navbar />

                <main className="dashboard-page">
                    <div className="section">
                        <h1 className="page-title">
                            Admin Dashboard
                        </h1>

                        <p>
                            Loading dashboard...
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    // =========================
    // UI
    // =========================

    return (
        <div>
            <Navbar />

            <main className="dashboard-page">
                <h1 className="page-title">
                    Admin Dashboard
                </h1>

                {message && (
                    <div className="message message-error">
                        {message}
                    </div>
                )}

                {/* =========================
                    Statistics
                ========================= */}

                <section className="section">
                    <h2 className="section-title">
                        Overview
                    </h2>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>
                                Total Users
                            </h3>

                            <p>
                                {stats.totalUsers}
                            </p>
                        </div>

                        <div className="stat-card">
                            <h3>
                                Total Stores
                            </h3>

                            <p>
                                {stats.totalStores}
                            </p>
                        </div>

                        <div className="stat-card">
                            <h3>
                                Total Ratings
                            </h3>

                            <p>
                                {stats.totalRatings}
                            </p>
                        </div>
                    </div>
                </section>

                {/* =========================
                    Users
                ========================= */}

                <section className="section">
                    <h2 className="section-title">
                        Manage Users
                    </h2>

                    <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() =>
                            setShowUserForm(
                                (previous) =>
                                    !previous
                            )
                        }
                    >
                        {showUserForm
                            ? "Hide Add User Form"
                            : "Add User"}
                    </button>

                    {showUserForm && (
                        <form
                            onSubmit={
                                handleCreateUser
                            }
                            style={{
                                marginTop: "20px"
                            }}
                        >
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            newUser.name
                                        }
                                        onChange={
                                            handleUserFormChange
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            newUser.email
                                        }
                                        onChange={
                                            handleUserFormChange
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={
                                            newUser.password
                                        }
                                        onChange={
                                            handleUserFormChange
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Role
                                    </label>

                                    <select
                                        name="role"
                                        value={
                                            newUser.role
                                        }
                                        onChange={
                                            handleUserFormChange
                                        }
                                    >
                                        <option value="USER">
                                            USER
                                        </option>

                                        <option value="ADMIN">
                                            ADMIN
                                        </option>

                                        <option value="OWNER">
                                            OWNER
                                        </option>
                                    </select>
                                </div>

                                <div
                                    className="form-group"
                                    style={{
                                        gridColumn:
                                            "1 / -1"
                                    }}
                                >
                                    <label>
                                        Address
                                    </label>

                                    <input
                                        type="text"
                                        name="address"
                                        value={
                                            newUser.address
                                        }
                                        onChange={
                                            handleUserFormChange
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    className="btn btn-success"
                                    type="submit"
                                >
                                    Create User
                                </button>
                            </div>

                            {userFormMessage && (
                                <div className="message message-info">
                                    {
                                        userFormMessage
                                    }
                                </div>
                            )}
                        </form>
                    )}

                    <hr />

                    <h3 className="section-title">
                        Search & Filter Users
                    </h3>

                    <form
                        onSubmit={
                            handleUserSearch
                        }
                    >
                        <div className="search-row">
                            <input
                                className="search-input"
                                type="text"
                                placeholder="Search by name"
                                value={
                                    userName
                                }
                                onChange={(
                                    event
                                ) =>
                                    setUserName(
                                        event.target
                                            .value
                                    )
                                }
                            />

                            <input
                                className="search-input"
                                type="text"
                                placeholder="Search by email"
                                value={
                                    userEmail
                                }
                                onChange={(
                                    event
                                ) =>
                                    setUserEmail(
                                        event.target
                                            .value
                                    )
                                }
                            />

                            <input
                                className="search-input"
                                type="text"
                                placeholder="Search by address"
                                value={
                                    userAddress
                                }
                                onChange={(
                                    event
                                ) =>
                                    setUserAddress(
                                        event.target
                                            .value
                                    )
                                }
                            />

                            <select
                                className="search-select"
                                value={
                                    userRole
                                }
                                onChange={(
                                    event
                                ) =>
                                    setUserRole(
                                        event.target
                                            .value
                                    )
                                }
                            >
                                <option value="">
                                    All Roles
                                </option>

                                <option value="USER">
                                    USER
                                </option>

                                <option value="ADMIN">
                                    ADMIN
                                </option>

                                <option value="OWNER">
                                    OWNER
                                </option>
                            </select>

                            <button
                                className="btn btn-primary"
                                type="submit"
                            >
                                Search
                            </button>

                            <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={
                                    clearUserSearch
                                }
                            >
                                Clear
                            </button>
                        </div>
                    </form>

                    <div className="search-row">
                        <select
                            className="search-select"
                            value={
                                userSortBy
                            }
                            onChange={(
                                event
                            ) =>
                                setUserSortBy(
                                    event.target
                                        .value
                                )
                            }
                        >
                            <option value="name">
                                Sort: Name
                            </option>

                            <option value="email">
                                Sort: Email
                            </option>

                            <option value="address">
                                Sort: Address
                            </option>

                            <option value="role">
                                Sort: Role
                            </option>
                        </select>

                        <select
                            className="search-select"
                            value={
                                userOrder
                            }
                            onChange={(
                                event
                            ) =>
                                setUserOrder(
                                    event.target
                                        .value
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

                        <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={
                                fetchUsers
                            }
                        >
                            Apply Sort
                        </button>
                    </div>

                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Address
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.length ===
                                0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                        >
                                            No users
                                            found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(
                                        (
                                            user
                                        ) => (
                                            <tr
                                                key={
                                                    user.id
                                                }
                                            >
                                                <td>
                                                    {
                                                        user.id
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        user.name
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        user.email
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        user.address
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        user.role
                                                    }
                                                </td>

                                                <td>
                                                    <button
                                                        className="btn btn-secondary"
                                                        type="button"
                                                        onClick={() =>
                                                            handleViewUserDetails(
                                                                user.id
                                                            )
                                                        }
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* =========================
                    User Details
                ========================= */}

                {selectedUser && (
                    <section className="section">
                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                                marginBottom:
                                    "16px"
                            }}
                        >
                            <h2 className="section-title">
                                User Details
                            </h2>

                            <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={
                                    closeUserDetails
                                }
                            >
                                Close
                            </button>
                        </div>

                        {loadingUserDetails ? (
                            <p>
                                Loading user details...
                            </p>
                        ) : (
                            <>
                                <p>
                                    <strong>
                                        Name:
                                    </strong>{" "}
                                    {
                                        selectedUser
                                            .user.name
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Email:
                                    </strong>{" "}
                                    {
                                        selectedUser
                                            .user.email
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Address:
                                    </strong>{" "}
                                    {
                                        selectedUser
                                            .user.address
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Role:
                                    </strong>{" "}
                                    {
                                        selectedUser
                                            .user.role
                                    }
                                </p>

                                {selectedUser
                                    .user
                                    .role ===
                                    "OWNER" && (
                                    <>
                                        <h3
                                            style={{
                                                marginTop:
                                                    "20px",
                                                marginBottom:
                                                    "10px"
                                            }}
                                        >
                                            Owner Store Details
                                        </h3>

                                        {selectedUser
                                            .stores
                                            .length ===
                                        0 ? (
                                            <p>
                                                No store assigned.
                                            </p>
                                        ) : (
                                            <div className="table-wrapper">
                                                <table className="data-table">
                                                    <thead>
                                                        <tr>
                                                            <th>
                                                                Store
                                                            </th>

                                                            <th>
                                                                Email
                                                            </th>

                                                            <th>
                                                                Address
                                                            </th>

                                                            <th>
                                                                Rating
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {selectedUser.stores.map(
                                                            (
                                                                store
                                                            ) => (
                                                                <tr
                                                                    key={
                                                                        store.id
                                                                    }
                                                                >
                                                                    <td>
                                                                        {
                                                                            store.name
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            store.email
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            store.address
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {Number(
                                                                            store.rating
                                                                        ).toFixed(
                                                                            1
                                                                        )}{" "}
                                                                        /
                                                                        5
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </section>
                )}

                {/* =========================
                    Stores
                ========================= */}

                <section className="section">
                    <h2 className="section-title">
                        Manage Stores
                    </h2>

                    <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() =>
                            setShowStoreForm(
                                (previous) =>
                                    !previous
                            )
                        }
                    >
                        {showStoreForm
                            ? "Hide Add Store Form"
                            : "Add Store"}
                    </button>

                    {showStoreForm && (
                        <form
                            onSubmit={
                                handleCreateStore
                            }
                            style={{
                                marginTop: "20px"
                            }}
                        >
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>
                                        Store Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            newStore.name
                                        }
                                        onChange={
                                            handleStoreFormChange
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            newStore.email
                                        }
                                        onChange={
                                            handleStoreFormChange
                                        }
                                        required
                                    />
                                </div>

                                <div
                                    className="form-group"
                                    style={{
                                        gridColumn:
                                            "1 / -1"
                                    }}
                                >
                                    <label>
                                        Address
                                    </label>

                                    <input
                                        type="text"
                                        name="address"
                                        value={
                                            newStore.address
                                        }
                                        onChange={
                                            handleStoreFormChange
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Owner ID
                                    </label>

                                    <input
                                        type="number"
                                        name="ownerId"
                                        value={
                                            newStore.ownerId
                                        }
                                        onChange={
                                            handleStoreFormChange
                                        }
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    className="btn btn-success"
                                    type="submit"
                                >
                                    Create Store
                                </button>
                            </div>

                            {storeFormMessage && (
                                <div className="message message-info">
                                    {
                                        storeFormMessage
                                    }
                                </div>
                            )}
                        </form>
                    )}

                    <hr />

                    <h3 className="section-title">
                        Search & Sort Stores
                    </h3>

                    <form
                        onSubmit={
                            handleStoreSearch
                        }
                    >
                        <div className="search-row">
                            <input
                                className="search-input"
                                type="text"
                                placeholder="Search by store name"
                                value={
                                    storeName
                                }
                                onChange={(
                                    event
                                ) =>
                                    setStoreName(
                                        event.target
                                            .value
                                    )
                                }
                            />

                            <input
                                className="search-input"
                                type="text"
                                placeholder="Search by email"
                                value={
                                    storeEmail
                                }
                                onChange={(
                                    event
                                ) =>
                                    setStoreEmail(
                                        event.target
                                            .value
                                    )
                                }
                            />

                            <input
                                className="search-input"
                                type="text"
                                placeholder="Search by address"
                                value={
                                    storeAddress
                                }
                                onChange={(
                                    event
                                ) =>
                                    setStoreAddress(
                                        event.target
                                            .value
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
                                onClick={
                                    clearStoreSearch
                                }
                            >
                                Clear
                            </button>
                        </div>
                    </form>

                    <div className="search-row">
                        <select
                            className="search-select"
                            value={
                                storeSortBy
                            }
                            onChange={(
                                event
                            ) =>
                                setStoreSortBy(
                                    event.target
                                        .value
                                )
                            }
                        >
                            <option value="name">
                                Sort: Name
                            </option>

                            <option value="email">
                                Sort: Email
                            </option>

                            <option value="address">
                                Sort: Address
                            </option>

                            <option value="rating">
                                Sort: Rating
                            </option>
                        </select>

                        <select
                            className="search-select"
                            value={
                                storeOrder
                            }
                            onChange={(
                                event
                            ) =>
                                setStoreOrder(
                                    event.target
                                        .value
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

                        <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={
                                fetchStores
                            }
                        >
                            Apply Sort
                        </button>
                    </div>

                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>
                                        ID
                                    </th>
                                    <th>
                                        Name
                                    </th>
                                    <th>
                                        Email
                                    </th>
                                    <th>
                                        Address
                                    </th>
                                    <th>
                                        Rating
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {stores.length ===
                                0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                        >
                                            No stores
                                            found.
                                        </td>
                                    </tr>
                                ) : (
                                    stores.map(
                                        (
                                            store
                                        ) => (
                                            <tr
                                                key={
                                                    store.id
                                                }
                                            >
                                                <td>
                                                    {
                                                        store.id
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        store.name
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        store.email
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        store.address
                                                    }
                                                </td>

                                                <td>
                                                    {Number(
                                                        store.rating
                                                    ).toFixed(
                                                        1
                                                    )}{" "}
                                                    / 5
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default AdminDashboard;