import { useState } from "react";
import {
    Settings as SettingsIcon,
    Building2,
    Receipt,
    Bell,
    Palette,
    Clock3,
    Shield,
    Database,
    Save,
    RotateCcw,
    CheckCircle2,
} from "lucide-react";

import "./Settings.css";

const initialSettings = {
    garageName: "DR.CARCARE",
    phone: "+91 98765 43210",
    email: "drcarcare@gmail.com",
    address: "Rajapalayam, Tamil Nadu, India",
    gstNumber: "33ABCDE1234F1Z5",

    invoicePrefix: "INV-",
    defaultTax: "18",
    currency: "INR",
    invoiceFooter: "Thank you for choosing DR.CARCARE.",

    serviceReminders: true,
    paymentReminders: true,
    estimateNotifications: true,

    workingDays: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ],
    openingTime: "09:00",
    closingTime: "19:00",
    defaultServiceDuration: "60",

    compactMode: false,
};

const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

function Settings() {
    const [settings, setSettings] = useState(initialSettings);
    const [activeSection, setActiveSection] = useState("general");
    const [saved, setSaved] = useState(false);

    const updateSetting = (name, value) => {
        setSettings((previous) => ({
            ...previous,
            [name]: value,
        }));

        setSaved(false);
    };

    const toggleWorkingDay = (day) => {
        setSettings((previous) => {
            const exists = previous.workingDays.includes(day);

            return {
                ...previous,
                workingDays: exists
                    ? previous.workingDays.filter((item) => item !== day)
                    : [...previous.workingDays, day],
            };
        });

        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 3000);
    };

    const handleReset = () => {
        const confirmed = window.confirm(
            "Reset all settings to the default values?"
        );

        if (!confirmed) return;

        setSettings(initialSettings);
        setSaved(false);
    };

    const sections = [
        {
            id: "general",
            label: "General",
            icon: Building2,
        },
        {
            id: "invoice",
            label: "Invoice",
            icon: Receipt,
        },
        {
            id: "notifications",
            label: "Notifications",
            icon: Bell,
        },
        {
            id: "appearance",
            label: "Appearance",
            icon: Palette,
        },
        {
            id: "workshop",
            label: "Workshop",
            icon: Clock3,
        },
        {
            id: "security",
            label: "Security",
            icon: Shield,
        },
        {
            id: "system",
            label: "System",
            icon: Database,
        },
    ];

    return (
        <div className="settings-page">
            <div className="settings-header">
                <div className="settings-title">
                    <div className="settings-title-icon">
                        <SettingsIcon size={22} />
                    </div>

                    <div>
                        <h1>Settings</h1>
                        <p>
                            Manage your garage, invoice, workshop and system
                            preferences.
                        </p>
                    </div>
                </div>

                <div className="settings-header-actions">
                    <button
                        type="button"
                        className="settings-reset-button"
                        onClick={handleReset}
                    >
                        <RotateCcw size={17} />
                        Reset
                    </button>

                    <button
                        type="button"
                        className="settings-save-button"
                        onClick={handleSave}
                    >
                        {saved ? (
                            <>
                                <CheckCircle2 size={17} />
                                Saved
                            </>
                        ) : (
                            <>
                                <Save size={17} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="settings-layout">
                <aside className="settings-sidebar">
                    <div className="settings-sidebar-title">
                        SETTINGS
                    </div>

                    {sections.map((section) => {
                        const Icon = section.icon;

                        return (
                            <button
                                type="button"
                                key={section.id}
                                className={`settings-nav-item ${
                                    activeSection === section.id ? "active" : ""
                                }`}
                                onClick={() => setActiveSection(section.id)}
                            >
                                <Icon size={18} />
                                <span>{section.label}</span>
                            </button>
                        );
                    })}
                </aside>

                <main className="settings-content">
                    {activeSection === "general" && (
                        <section className="settings-section">
                            <SectionHeader
                                icon={Building2}
                                title="General Settings"
                                description="Basic information about your garage."
                            />

                            <div className="settings-card">
                                <div className="settings-form-grid">
                                    <FormField
                                        label="Garage Name"
                                        value={settings.garageName}
                                        onChange={(value) =>
                                            updateSetting("garageName", value)
                                        }
                                    />

                                    <FormField
                                        label="Phone Number"
                                        value={settings.phone}
                                        onChange={(value) =>
                                            updateSetting("phone", value)
                                        }
                                    />

                                    <FormField
                                        label="Email Address"
                                        type="email"
                                        value={settings.email}
                                        onChange={(value) =>
                                            updateSetting("email", value)
                                        }
                                    />

                                    <FormField
                                        label="GST Number"
                                        value={settings.gstNumber}
                                        onChange={(value) =>
                                            updateSetting("gstNumber", value)
                                        }
                                    />

                                    <div className="settings-form-group full-width">
                                        <label>Garage Address</label>

                                        <textarea
                                            value={settings.address}
                                            rows="3"
                                            onChange={(event) =>
                                                updateSetting(
                                                    "address",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeSection === "invoice" && (
                        <section className="settings-section">
                            <SectionHeader
                                icon={Receipt}
                                title="Invoice Settings"
                                description="Configure your billing and invoice preferences."
                            />

                            <div className="settings-card">
                                <div className="settings-form-grid">
                                    <FormField
                                        label="Invoice Prefix"
                                        value={settings.invoicePrefix}
                                        onChange={(value) =>
                                            updateSetting("invoicePrefix", value)
                                        }
                                    />

                                    <div className="settings-form-group">
                                        <label>Currency</label>

                                        <select
                                            value={settings.currency}
                                            onChange={(event) =>
                                                updateSetting(
                                                    "currency",
                                                    event.target.value
                                                )
                                            }
                                        >
                                            <option value="INR">
                                                INR - Indian Rupee
                                            </option>
                                            <option value="USD">
                                                USD - US Dollar
                                            </option>
                                            <option value="EUR">
                                                EUR - Euro
                                            </option>
                                        </select>
                                    </div>

                                    <div className="settings-form-group">
                                        <label>Default Tax</label>

                                        <div className="input-with-suffix">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={settings.defaultTax}
                                                onChange={(event) =>
                                                    updateSetting(
                                                        "defaultTax",
                                                        event.target.value
                                                    )
                                                }
                                            />
                                            <span>%</span>
                                        </div>
                                    </div>

                                    <div className="settings-info-box">
                                        <Receipt size={19} />

                                        <div>
                                            <strong>Invoice numbering</strong>
                                            <p>
                                                New invoices will use the configured
                                                prefix followed by an automatic number.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="settings-form-group full-width">
                                        <label>Invoice Footer</label>

                                        <textarea
                                            value={settings.invoiceFooter}
                                            rows="3"
                                            onChange={(event) =>
                                                updateSetting(
                                                    "invoiceFooter",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeSection === "notifications" && (
                        <section className="settings-section">
                            <SectionHeader
                                icon={Bell}
                                title="Notification Preferences"
                                description="Choose which workshop reminders should be enabled."
                            />

                            <div className="settings-card notification-card">
                                <ToggleSetting
                                    title="Service Reminders"
                                    description="Enable reminders for upcoming vehicle services."
                                    enabled={settings.serviceReminders}
                                    onChange={(value) =>
                                        updateSetting("serviceReminders", value)
                                    }
                                />

                                <ToggleSetting
                                    title="Payment Reminders"
                                    description="Enable reminders for pending customer payments."
                                    enabled={settings.paymentReminders}
                                    onChange={(value) =>
                                        updateSetting("paymentReminders", value)
                                    }
                                />

                                <ToggleSetting
                                    title="Estimate Notifications"
                                    description="Enable notifications for pending estimate approvals."
                                    enabled={settings.estimateNotifications}
                                    onChange={(value) =>
                                        updateSetting(
                                            "estimateNotifications",
                                            value
                                        )
                                    }
                                />
                            </div>
                        </section>
                    )}

                    {activeSection === "appearance" && (
                        <section className="settings-section">
                            <SectionHeader
                                icon={Palette}
                                title="Appearance"
                                description="Customize how DR.CARCARE looks and feels."
                            />

                            <div className="settings-card">
                                <div className="appearance-preview">
                                    <div className="appearance-preview-sidebar">
                                        <div className="preview-logo">DC</div>

                                        <div className="preview-line active" />
                                        <div className="preview-line" />
                                        <div className="preview-line" />
                                        <div className="preview-line" />
                                    </div>

                                    <div className="appearance-preview-content">
                                        <div className="preview-topbar" />

                                        <div className="preview-cards">
                                            <div />
                                            <div />
                                            <div />
                                        </div>

                                        <div className="preview-table">
                                            <span />
                                            <span />
                                            <span />
                                            <span />
                                        </div>
                                    </div>
                                </div>

                                <div className="appearance-info">
                                    <div>
                                        <h3>Theme</h3>
                                        <p>
                                            Use the theme toggle in the top navigation
                                            to switch between light and dark mode.
                                        </p>
                                    </div>
                                </div>

                                <ToggleSetting
                                    title="Compact Layout"
                                    description="Reduce spacing across tables and dashboard cards."
                                    enabled={settings.compactMode}
                                    onChange={(value) =>
                                        updateSetting("compactMode", value)
                                    }
                                />
                            </div>
                        </section>
                    )}

                    {activeSection === "workshop" && (
                        <section className="settings-section">
                            <SectionHeader
                                icon={Clock3}
                                title="Workshop Settings"
                                description="Configure your garage operating hours and service defaults."
                            />

                            <div className="settings-card">
                                <div className="settings-form-grid">
                                    <div className="settings-form-group">
                                        <label>Opening Time</label>

                                        <input
                                            type="time"
                                            value={settings.openingTime}
                                            onChange={(event) =>
                                                updateSetting(
                                                    "openingTime",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="settings-form-group">
                                        <label>Closing Time</label>

                                        <input
                                            type="time"
                                            value={settings.closingTime}
                                            onChange={(event) =>
                                                updateSetting(
                                                    "closingTime",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="settings-form-group">
                                        <label>
                                            Default Service Duration
                                        </label>

                                        <div className="input-with-suffix">
                                            <input
                                                type="number"
                                                min="15"
                                                value={
                                                    settings.defaultServiceDuration
                                                }
                                                onChange={(event) =>
                                                    updateSetting(
                                                        "defaultServiceDuration",
                                                        event.target.value
                                                    )
                                                }
                                            />

                                            <span>min</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="working-days-section">
                                    <h3>Working Days</h3>

                                    <div className="working-days">
                                        {weekDays.map((day) => {
                                            const active =
                                                settings.workingDays.includes(day);

                                            return (
                                                <button
                                                    type="button"
                                                    key={day}
                                                    className={`working-day ${
                                                        active ? "active" : ""
                                                    }`}
                                                    onClick={() =>
                                                        toggleWorkingDay(day)
                                                    }
                                                >
                                                    {day.slice(0, 3)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeSection === "security" && (
                        <section className="settings-section">
                            <SectionHeader
                                icon={Shield}
                                title="Security"
                                description="Manage your account security settings."
                            />

                            <div className="settings-card">
                                <div className="security-item">
                                    <div className="security-icon">
                                        <Shield size={20} />
                                    </div>

                                    <div>
                                        <h3>Password</h3>
                                        <p>
                                            Update your account password regularly to
                                            keep your garage data secure.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="outline-button"
                                        onClick={() =>
                                            window.alert(
                                                "Password change UI will be connected during backend integration."
                                            )
                                        }
                                    >
                                        Change Password
                                    </button>
                                </div>

                                <div className="security-item">
                                    <div className="security-icon">
                                        <CheckCircle2 size={20} />
                                    </div>

                                    <div>
                                        <h3>Account Status</h3>
                                        <p>
                                            Your DR.CARCARE account is currently
                                            active.
                                        </p>
                                    </div>

                                    <span className="active-account">
                    Active
                  </span>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeSection === "system" && (
                        <section className="settings-section">
                            <SectionHeader
                                icon={Database}
                                title="System"
                                description="System information and data management."
                            />

                            <div className="settings-card">
                                <div className="system-info-grid">
                                    <SystemInfo
                                        label="Application"
                                        value="DR.CARCARE"
                                    />

                                    <SystemInfo
                                        label="Version"
                                        value="1.0.0"
                                    />

                                    <SystemInfo
                                        label="Environment"
                                        value="Development"
                                    />

                                    <SystemInfo
                                        label="Database"
                                        value="MySQL"
                                    />

                                    <SystemInfo
                                        label="Backend"
                                        value="Spring Boot"
                                    />

                                    <SystemInfo
                                        label="Frontend"
                                        value="React + Vite"
                                    />
                                </div>

                                <div className="system-actions">
                                    <button
                                        type="button"
                                        className="system-action-button"
                                        onClick={() =>
                                            window.alert(
                                                "Data export will be connected during API integration."
                                            )
                                        }
                                    >
                                        <Database size={18} />
                                        Export Data
                                    </button>

                                    <button
                                        type="button"
                                        className="system-action-button"
                                        onClick={() =>
                                            window.alert(
                                                "Backup functionality will be connected during backend integration."
                                            )
                                        }
                                    >
                                        <Database size={18} />
                                        Backup Data
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}

function SectionHeader({
                           icon: Icon,
                           title,
                           description,
                       }) {
    return (
        <div className="settings-section-header">
            <div className="settings-section-icon">
                <Icon size={20} />
            </div>

            <div>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>
        </div>
    );
}

function FormField({
                       label,
                       value,
                       onChange,
                       type = "text",
                   }) {
    return (
        <div className="settings-form-group">
            <label>{label}</label>

            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}

function ToggleSetting({
                           title,
                           description,
                           enabled,
                           onChange,
                       }) {
    return (
        <div className="toggle-setting">
            <div>
                <h3>{title}</h3>
                <p>{description}</p>
            </div>

            <button
                type="button"
                className={`toggle-switch ${
                    enabled ? "enabled" : ""
                }`}
                onClick={() => onChange(!enabled)}
                aria-label={title}
            >
                <span />
            </button>
        </div>
    );
}

function SystemInfo({ label, value }) {
    return (
        <div className="system-info-item">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

export default Settings;