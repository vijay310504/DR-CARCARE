import {
    BarChart3,
    Bell,
    BookOpen,
    Box,
    CalendarDays,
    Car,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    ClipboardCheck,
    ClipboardList,
    CreditCard,
    FileText,
    LayoutDashboard,
    Receipt,
    Settings,
    ShoppingCart,
    Store,
    UserRound,
    Users,
    Wrench,
    X,
} from "lucide-react";

import {
    NavLink,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

import "./Sidebar.css";


const menuSections = [
    {
        title: "WORKSPACE",
        items: [
            {
                label: "Dashboard",
                path: "/",
                icon: LayoutDashboard,
            },
            {
                label: "Customers",
                path: "/customers",
                icon: Users,
            },
            {
                label: "Vehicles",
                path: "/vehicles",
                icon: Car,
            },
            {
                label: "Bookings",
                path: "/bookings",
                icon: CalendarDays,
            },
        ],
    },

    {
        title: "WORKSHOP",
        items: [
            {
                label: "Job Cards",
                path: "/job-cards",
                icon: ClipboardList,
            },
            {
                label: "Inspections",
                path: "/inspections",
                icon: ClipboardCheck,
            },
            {
                label: "Estimates",
                path: "/estimates",
                icon: FileText,
            },
            {
                label: "Technicians",
                path: "/technicians",
                icon: Wrench,
            },
        ],
    },

    {
        title: "INVENTORY",
        items: [
            {
                label: "Inventory",
                path: "/inventory",
                icon: Box,
            },
            {
                label: "Purchases",
                path: "/purchases",
                icon: ShoppingCart,
            },
            {
                label: "Vendors",
                path: "/vendors",
                icon: Store,
            },
        ],
    },

    {
        title: "FINANCE",
        items: [
            {
                label: "Invoices",
                path: "/invoices",
                icon: Receipt,
            },
            {
                label: "Payments",
                path: "/payments",
                icon: CreditCard,
            },
            {
                label: "Expenses",
                path: "/expenses",
                icon: CircleDollarSign,
            },
            {
                label: "Accounting",
                path: "/accounting",
                icon: BookOpen,
            },
        ],
    },

    {
        title: "MANAGEMENT",
        items: [
            {
                label: "Reports",
                path: "/reports",
                icon: BarChart3,
            },
            {
                label: "Reminders",
                path: "/reminders",
                icon: Bell,
            },
        ],
    },
];


function Sidebar({
                     collapsed,
                     mobileOpen,
                     onClose,
                     onToggle,
                 }) {

    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);


    const handleSettings = () => {
        navigate("/settings");
        setShowUserMenu(false);
    };


    const handleLogout = () => {
        const confirmed = window.confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmed) {
            return;
        }

        logout();
        setShowUserMenu(false);
        navigate("/login", { replace: true });

        if (onClose) {
            onClose();
        }
    };


    return (
        <>

            {/* MOBILE OVERLAY */}

            {mobileOpen && (
                <div
                    className="sidebar-mobile-overlay"
                    onClick={onClose}
                />
            )}


            <aside
                className={[
                    "app-sidebar",
                    collapsed
                        ? "sidebar-collapsed"
                        : "",
                    mobileOpen
                        ? "sidebar-mobile-open"
                        : "",
                ].join(" ")}
            >

                {/* =========================================
                    BRAND
                ========================================= */}

                <div className="sidebar-brand">

                    <div className="brand-mark">
                        <Car size={20} />
                    </div>


                    {!collapsed && (
                        <div className="brand-content">
                            <strong>
                                DR.CARCARE
                            </strong>

                            <span>
                                Garage Management
                            </span>
                        </div>
                    )}


                    {mobileOpen && (
                        <button
                            type="button"
                            className="sidebar-mobile-close"
                            onClick={onClose}
                        >
                            <X size={18} />
                        </button>
                    )}

                </div>


                {/* =========================================
                    NAVIGATION
                ========================================= */}

                <nav className="sidebar-navigation">

                    {menuSections.map(
                        (section) => (

                            <div
                                className="sidebar-section"
                                key={section.title}
                            >

                                {!collapsed && (
                                    <div className="sidebar-section-title">
                                        {section.title}
                                    </div>
                                )}


                                {section.items.map(
                                    (item) => {

                                        const Icon =
                                            item.icon;


                                        const isCurrent =
                                            location.pathname ===
                                            item.path ||
                                            (
                                                item.path !== "/" &&
                                                location.pathname.startsWith(
                                                    `${item.path}/`
                                                )
                                            );


                                        return (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                onClick={onClose}
                                                className={() =>
                                                    [
                                                        "sidebar-nav-item",
                                                        isCurrent
                                                            ? "sidebar-nav-item-active"
                                                            : "",
                                                    ].join(" ")
                                                }
                                                title={
                                                    collapsed
                                                        ? item.label
                                                        : undefined
                                                }
                                            >

                                                <Icon
                                                    size={18}
                                                />

                                                {!collapsed && (
                                                    <span>
                                                        {
                                                            item.label
                                                        }
                                                    </span>
                                                )}

                                            </NavLink>
                                        );
                                    }
                                )}

                            </div>
                        )
                    )}

                </nav>


                {/* =========================================
                    BOTTOM
                ========================================= */}

                <div className="sidebar-bottom">

                    {/* SETTINGS */}

                    <NavLink
                        to="/settings"
                        onClick={onClose}
                        className={({ isActive }) =>
                            [
                                "sidebar-nav-item",
                                isActive
                                    ? "sidebar-nav-item-active"
                                    : "",
                            ].join(" ")
                        }
                        title={
                            collapsed
                                ? "Settings"
                                : undefined
                        }
                    >

                        <Settings size={18} />

                        {!collapsed && (
                            <span>
                                Settings
                            </span>
                        )}

                    </NavLink>


                    {/* USER */}

                    <div className="sidebar-user-wrapper">

                        <button
                            type="button"
                            className="sidebar-user"
                            onClick={() =>
                                setShowUserMenu(
                                    (current) =>
                                        !current
                                )
                            }
                            title={
                                collapsed
                                    ? "User menu"
                                    : undefined
                            }
                        >

                            <div className="sidebar-user-avatar">
                                V
                            </div>


                            {!collapsed && (
                                <div className="sidebar-user-info">

                                    <strong>
                                        {user?.name || "Vijay N V"}
                                    </strong>

                                    <span>
    Garage Owner
</span>

                                </div>
                            )}

                        </button>


                        {/* USER MENU */}

                        {showUserMenu && (
                            <div
                                className={[
                                    "sidebar-user-menu",
                                    collapsed
                                        ? "sidebar-user-menu-collapsed"
                                        : "",
                                ].join(" ")}
                            >

                                <div className="sidebar-user-menu-header">

                                    <div className="sidebar-user-menu-avatar">
                                        V
                                    </div>

                                    <div>
                                        <strong>
                                            {user?.name || "Vijay N V"}
                                        </strong>

                                        <span>
    Garage Owner
</span>
                                    </div>

                                </div>


                                <div className="sidebar-user-menu-divider" />


                                <button
                                    type="button"
                                    onClick={handleSettings}
                                >
                                    <Settings size={15} />
                                    Settings
                                </button>


                                <button
                                    type="button"
                                    className="sidebar-logout-button"
                                    onClick={handleLogout}
                                >
                                    <UserRound size={15} />
                                    Logout
                                </button>

                            </div>
                        )}

                    </div>


                    {/* COLLAPSE */}

                    <button
                        type="button"
                        className="sidebar-collapse-button"
                        onClick={onToggle}
                        title={
                            collapsed
                                ? "Expand sidebar"
                                : "Collapse sidebar"
                        }
                    >

                        {collapsed ? (
                            <ChevronRight
                                size={17}
                            />
                        ) : (
                            <ChevronLeft
                                size={17}
                            />
                        )}


                        {!collapsed && (
                            <span>
                                Collapse
                            </span>
                        )}

                    </button>

                </div>

            </aside>

        </>
    );
}


export default Sidebar;