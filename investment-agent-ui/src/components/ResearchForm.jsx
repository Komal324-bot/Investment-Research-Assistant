import { useState } from "react";
import { analyzeCompany } from "../services/api";
function ResearchForm() {

    const [company, setCompany] = useState("");
    const [response, setResponse] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {

        if (!company.trim()) {
            setError("Please enter a company name");
            setResponse("");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setResponse("");

            const res = await analyzeCompany(company);
            setResponse(res?.data?.status || "No response received from the server.");

        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || err?.message || "Unable to reach the backend. Make sure the Spring app is running on port 8080.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: "800px",
            margin: "40px auto",
            fontFamily: "Arial"
        }}>

            <h1>Investment Research Assistant</h1>

            <input
                type="text"
                placeholder="Enter company name..."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "16px"
                }}
            />

            <button
                onClick={handleAnalyze}
                style={{
                    marginTop: "15px",
                    padding: "12px 25px",
                    cursor: "pointer"
                }}
            >
                Analyze
            </button>

            {loading && (
                <p>Analyzing with Gemini...</p>
            )}

            {error && (
                <div style={{ marginTop: "20px", color: "crimson" }}>
                    {error}
                </div>
            )}

            {response && (
                <div
                    style={{
                        marginTop: "30px",
                        border: "1px solid #ddd",
                        padding: "20px",
                        borderRadius: "10px",
                        whiteSpace: "pre-wrap"
                    }}
                >
                    <h2>Analysis</h2>

                    {response}
                </div>
            )}

        </div>
    );
}

export default ResearchForm;