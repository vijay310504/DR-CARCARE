import { useState } from "react";

import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import ApiTest from "./pages/ApiTest";
import Dashboard from "./pages/Dashboard/Dashboard";
import Customers from "./pages/Customers/Customers";
import Vehicles from "./pages/Vehicles/Vehicles";
import Bookings from "./pages/Bookings/Bookings";
import JobCards from "./pages/JobCards/JobCards";
import Login from "./pages/Login/Login";
import Inspections from "./pages/Inspections/Inspections";
import Estimates from "./pages/Estimates/Estimates";
import Technicians from "./pages/Technicians/Technicians";
import Inventory from "./pages/Inventory/Inventory.jsx";
import Vendors from "./pages/Vendors/Vendors";
import Purchases from "./pages/Purchases/Purchases";
import Invoices from "./pages/Invoices/Invoices";
import Payments from "./pages/Payments/Payments";
import Expenses from "./pages/Expenses/Expenses";
import Accounting from "./pages/Accounting/Accounting";
import Reminders from "./pages/Reminders/Reminders";
import Reports from "./pages/Reports/Reports";
import Settings from "./pages/Settings/Settings";
import ProtectedRoute from "./components/common/ProtectedRoute";
import "./App.css";

function PlaceholderPage({ title }) {
    return (
        <div className="placeholder-page">

            <div className="placeholder-icon">
                🚗
            </div>

            <span className="placeholder-eyebrow">
        DR.CARCARE
      </span>

            <h1>{title}</h1>

            <p>
                This module is part of the next frontend
                development phase.
            </p>

        </div>
    );
}

function App() {
    const [sidebarCollapsed, setSidebarCollapsed] =
        useState(false);

    const [mobileSidebarOpen, setMobileSidebarOpen] =
        useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed(
            (current) => !current
        );
    };

    const openMobileSidebar = () => {
        setMobileSidebarOpen(true);
    };

    const closeMobileSidebar = () => {
        setMobileSidebarOpen(false);
    };

    return (
        <div className="app-shell">

            <Sidebar
                collapsed={sidebarCollapsed}
                mobileOpen={mobileSidebarOpen}
                onClose={closeMobileSidebar}
                onToggle={toggleSidebar}
            />

            <Topbar
                onMenuClick={openMobileSidebar}
            />


            <div
                className={[
                    "app-main",
                    sidebarCollapsed
                        ? "app-main-collapsed"
                        : "",
                ].join(" ")}
            >

                <Routes>

                    <Route
                        path="/"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />

                    <Route
                        path="/customers"
                        element={<Customers />}
                    />

                    <Route
                        path="/vehicles"
                        element={<Vehicles />}
                    />

                    <Route
                        path="/bookings"
                        element={<Bookings />}
                    />

                    <Route path="/job-cards" element={<JobCards />} />

                    <Route path="/inspections" element={<Inspections />} />
                    <Route path="/estimates" element={<Estimates />} />

                    <Route path="/technicians" element={<Technicians />} />

                    <Route path="/inventory" element={<Inventory />} />

                    <Route path="/vendors" element={<Vendors />} />

                    <Route path="/purchases" element={<Purchases />} />

                    <Route path="/invoices" element={<Invoices />} />

                    <Route path="/payments" element={<Payments />} />

                    <Route path="/expenses" element={<Expenses />} />

                    <Route path="/accounting" element={<Accounting />} />

                    <Route path="/reminders" element={<Reminders />} />

                    <Route path="/reports" element={<Reports />} />

                    <Route path="/settings" element={<Settings />} />

                    <Route path="/api-test" element={<ApiTest />} />

                    <Route path="/login" element={<Login />} />

                    <Route path="*" element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />
                </Routes>
            </div>
        </div>
    );
}
export default App;