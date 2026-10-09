import { useState } from "react";
import testService from "../services/testService";

function ApiTest() {
    const [status, setStatus] = useState("Not tested");
    const [response, setResponse] = useState("");

    const testConnection = async () => {
        try {
            setStatus("Connecting...");
            setResponse("");

            const data =
                await testService.testBackendConnection();

            setStatus("Backend Connected");
            setResponse(
                typeof data === "string"
                    ? data
                    : JSON.stringify(data, null, 2)
            );
        } catch (error) {
            console.error(error);

            setStatus("Connection Failed");

            setResponse(
                error.response?.data
                    ? JSON.stringify(
                        error.response.data,
                        null,
                        2
                    )
                    : error.message
            );
        }
    };

    return (
        <div
            style={{
                padding: "40px",
                color: "var(--text)",
            }}
        >
            <h1>API Connection Test</h1>

            <button
                onClick={testConnection}
                style={{
                    padding: "10px 18px",
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                }}
            >
                Test Backend
            </button>

            <h3>Status</h3>

            <p>{status}</p>

            {response && (
                <>
                    <h3>Response</h3>

                    <pre
                        style={{
                            padding: "20px",
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {response}
                    </pre>
                </>
            )}
        </div>
    );
}

export default ApiTest;