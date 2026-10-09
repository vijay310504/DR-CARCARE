import {
    Bell,
    CheckCircle2,
    Clock3,
    Menu,
    Moon,
    Search,
    Settings,
    Sun,
    Wrench,
    X,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

import "./Topbar.css";

function Topbar({ onMenuClick }) {

    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [searchValue, setSearchValue] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    /*
     * =========================================
     * MOCK GLOBAL SEARCH
     * =========================================
     */

    const searchItems = [
        {
            label: "Customers",
            description: "Manage customer records",
            path: "/customers",
            keywords: "customer customers client clients",
        },
        {
            label: "Vehicles",
            description: "Manage vehicles",
            path: "/vehicles",
            keywords: "vehicle vehicles car cars",
        },
        {
            label: "Bookings",
            description: "View service bookings",
            path: "/bookings",
            keywords: "booking bookings appointment appointments",
        },
        {
            label: "Job Cards",
            description: "Manage workshop job cards",
            path: "/job-cards",
            keywords: "job card jobcards jobs workshop service",
        },
        {
            label: "Inspections",
            description: "Vehicle inspection records",
            path: "/inspections",
            keywords: "inspection inspections check checking",
        },
        {
            label: "Estimates",
            description: "Create and manage estimates",
            path: "/estimates",
            keywords: "estimate estimates quotation quote",
        },
        {
            label: "Technicians",
            description: "Manage workshop technicians",
            path: "/technicians",
            keywords: "technician technicians mechanic mechanics",
        },
        {
            label: "Inventory",
            description: "Manage spare parts and stock",
            path: "/inventory",
            keywords: "inventory stock parts spare",
        },
        {
            label: "Purchases",
            description: "Manage purchase orders",
            path: "/purchases",
            keywords: "purchase purchases supplier order",
        },
        {
            label: "Vendors",
            description: "Manage vendors",
            path: "/vendors",
            keywords: "vendor vendors supplier suppliers",
        },
        {
            label: "Invoices",
            description: "Manage invoices",
            path: "/invoices",
            keywords: "invoice invoices billing bill",
        },
        {
            label: "Payments",
            description: "Manage customer payments",
            path: "/payments",
            keywords: "payment payments received money",
        },
        {
            label: "Expenses",
            description: "Manage garage expenses",
            path: "/expenses",
            keywords: "expense expenses spending cost",
        },
        {
            label: "Accounting",
            description: "View financial records",
            path: "/accounting",
            keywords: "account accounting accounts finance financial",
        },
        {
            label: "Reports",
            description: "View business reports",
            path: "/reports",
            keywords: "report reports analytics analysis",
        },
        {
            label: "Reminders",
            description: "Manage customer reminders",
            path: "/reminders",
            keywords: "reminder reminders followup follow-up notification",
        },
        {
            label: "Settings",
            description: "Manage system settings",
            path: "/settings",
            keywords: "setting settings configuration system",
        },
    ];

    const filteredSearchItems =
        searchValue.trim().length === 0
            ? []
            : searchItems.filter((item) => {
                const searchText =
                    `${item.label} ${item.description} ${item.keywords}`
                        .toLowerCase();

                return searchText.includes(
                    searchValue.toLowerCase().trim()
                );
            }).slice(0, 7);

    const handleSearchChange = (event) => {
        setSearchValue(event.target.value);
        setShowSearchResults(true);
    };

    const handleSearchKeyDown = (event) => {

        if (event.key === "Escape") {
            setSearchValue("");
            setShowSearchResults(false);
            return;
        }

        if (event.key === "Enter") {

            if (filteredSearchItems.length > 0) {

                navigate(
                    filteredSearchItems[0].path
                );

                setSearchValue("");
                setShowSearchResults(false);
            }
        }
    };

    const handleSearchResultClick = (path) => {
        navigate(path);

        setSearchValue("");
        setShowSearchResults(false);
    };

    /*
     * =========================================
     * NOTIFICATIONS
     * =========================================
     */

    const notifications = [
        {
            id: 1,
            title: "Estimate awaiting approval",
            description: "EST-0012 requires customer approval.",
            icon: <Clock3 size={15} />,
            type: "warning",
            path: "/estimates",
        },
        {
            id: 2,
            title: "Payment pending",
            description: "2 invoices have outstanding payments.",
            icon: <Bell size={15} />,
            type: "danger",
            path: "/payments",
        },
        {
            id: 3,
            title: "Vehicle service due",
            description: "3 customer vehicles are due for service.",
            icon: <Wrench size={15} />,
            type: "info",
            path: "/reminders",
        },
        {
            id: 4,
            title: "Workshop running normally",
            description: "All active job cards are being tracked.",
            icon: <CheckCircle2 size={15} />,
            type: "success",
            path: "/job-cards",
        },
    ];

    const handleNotificationClick = (path) => {
        navigate(path);
        setShowNotifications(false);
    };

    /*
     * =========================================
     * PROFILE MENU
     * =========================================
     */

    const handleSettingsClick = () => {
        navigate("/settings");
        setShowProfileMenu(false);
    };

    const handleLogout = () => {
        const confirmed = window.confirm(
            "Are you sure you want to logout?"
        );

        if (confirmed) {
            logout();
            setShowProfileMenu(false);
            navigate("/login", { replace: true });
        }
    };

    return (
        <header className="app-topbar">

            {/* =========================================
                LEFT
            ========================================= */}

            <div className="topbar-left">

                <button
                    type="button"
                    className="mobile-menu-button"
                    onClick={onMenuClick}
                    aria-label="Open navigation"
                >
                    <Menu size={20} />
                </button>

                {/* SEARCH */}

                <div className="topbar-search">

                    <Search size={16} />

                    <input
                        type="text"
                        value={searchValue}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchKeyDown}
                        onFocus={() => {
                            if (searchValue.trim()) {
                                setShowSearchResults(true);
                            }
                        }}
                        placeholder="Search customers, vehicles..."
                    />

                    {searchValue && (
                        <button
                            type="button"
                            className="search-clear-button"
                            onClick={() => {
                                setSearchValue("");
                                setShowSearchResults(false);
                            }}
                            aria-label="Clear search"
                        >
                            <X size={14} />
                        </button>
                    )}

                    {!searchValue && (
                        <span className="search-shortcut">
                            /
                        </span>
                    )}

                    {/* SEARCH RESULTS */}

                    {showSearchResults &&
                        searchValue.trim() && (
                            <div className="search-results">

                                {filteredSearchItems.length > 0 ? (

                                    <>
                                        <div className="search-results-header">
                                            Search results
                                        </div>

                                        {filteredSearchItems.map(
                                            (item) => (
                                                <button
                                                    key={item.path}
                                                    type="button"
                                                    className="search-result-item"
                                                    onClick={() =>
                                                        handleSearchResultClick(
                                                            item.path
                                                        )
                                                    }
                                                >

                                                    <div className="search-result-icon">
                                                        <Search size={14} />
                                                    </div>

                                                    <div className="search-result-content">

                                                        <strong>
                                                            {item.label}
                                                        </strong>

                                                        <span>
                                                            {item.description}
                                                        </span>

                                                    </div>

                                                </button>
                                            )
                                        )}
                                    </>

                                ) : (

                                    <div className="search-no-results">
                                        <Search size={18} />
                                        <span>
                                            No matching module found
                                        </span>
                                    </div>

                                )}

                            </div>
                        )}

                </div>

            </div>


            {/* =========================================
                RIGHT
            ========================================= */}

            <div className="topbar-right">

                {/* THEME */}

                <button
                    type="button"
                    className="topbar-icon-button"
                    onClick={toggleTheme}
                    title={
                        theme === "light"
                            ? "Switch to dark mode"
                            : "Switch to light mode"
                    }
                >
                    {theme === "light" ? (
                        <Moon size={17} />
                    ) : (
                        <Sun size={17} />
                    )}
                </button>


                {/* NOTIFICATIONS */}

                <div className="topbar-dropdown-wrapper">

                    <button
                        type="button"
                        className="topbar-icon-button notification-button"
                        onClick={() => {
                            setShowNotifications(
                                (current) => !current
                            );

                            setShowProfileMenu(false);
                        }}
                        title="Notifications"
                        aria-label="Notifications"
                    >
                        <Bell size={17} />

                        <span />
                    </button>


                    {showNotifications && (
                        <div className="notification-panel">

                            <div className="notification-header">

                                <div>
                                    <strong>
                                        Notifications
                                    </strong>

                                    <span>
                                        Garage activity
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowNotifications(false)
                                    }
                                >
                                    <X size={15} />
                                </button>

                            </div>


                            <div className="notification-list">

                                {notifications.map(
                                    (notification) => (
                                        <button
                                            type="button"
                                            key={notification.id}
                                            className="notification-item"
                                            onClick={() =>
                                                handleNotificationClick(
                                                    notification.path
                                                )
                                            }
                                        >

                                            <div
                                                className={`notification-icon notification-${notification.type}`}
                                            >
                                                {
                                                    notification.icon
                                                }
                                            </div>

                                            <div className="notification-content">

                                                <strong>
                                                    {
                                                        notification.title
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        notification.description
                                                    }
                                                </span>

                                            </div>

                                        </button>
                                    )
                                )}

                            </div>


                            <button
                                type="button"
                                className="notification-view-all"
                                onClick={() => {
                                    navigate("/reminders");
                                    setShowNotifications(false);
                                }}
                            >
                                View all reminders
                            </button>

                        </div>
                    )}

                </div>


                <div className="topbar-divider" />


                {/* PROFILE */}

                <div className="topbar-dropdown-wrapper">

                    <button
                        type="button"
                        className="topbar-profile"
                        onClick={() => {
                            setShowProfileMenu(
                                (current) => !current
                            );

                            setShowNotifications(false);
                        }}
                        aria-label="Open user menu"
                    >

                        <div className="topbar-avatar">
                            V
                        </div>

                        <div className="topbar-profile-info">
                            <strong>
                                {user?.name || "Vijay N V"}
                            </strong>

                            <span>
                                Garage Owner
                            </span>
                        </div>

                    </button>


                    {showProfileMenu && (
                        <div className="profile-menu">

                            <div className="profile-menu-header">

                                <div className="profile-menu-avatar">
                                    V
                                </div>

                                <div>
                                    <span>
    Garage Owner
</span>

                                    <span>
                                        Garage Owner
                                    </span>
                                </div>

                            </div>


                            <div className="profile-menu-divider" />


                            <button
                                type="button"
                                onClick={handleSettingsClick}
                            >
                                <Settings size={16} />
                                <span>
                                    Settings
                                </span>
                            </button>


                            <button
                                type="button"
                                className="profile-logout-button"
                                onClick={handleLogout}
                            >
                                <span className="logout-dot" />
                                <span>
                                    Logout
                                </span>
                            </button>

                        </div>
                    )}

                </div>

            </div>

        </header>
    );
}

export default Topbar;