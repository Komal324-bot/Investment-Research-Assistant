import { useState } from "react";
import { analyzeCompany } from "../services/api";
function ResearchForm() {

    const [company, setCompany] = useState("");
    const [response, setResponse] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {

    if (!company.trim()) {
        setError("Please enter a company name");
        setResponse(null);
        return;
    }

    try {
        setLoading(true);
        setError("");
        setResponse(null);

        const res = await analyzeCompany(company);

        console.log(res.data);   // keep this for debugging

        if (res.data) {
            setResponse(res.data);
        } else {
            setError("Invalid response received from server.");
        }

    } catch (err) {
        console.error(err);

        setError(
            err?.response?.data?.message ||
            err?.message ||
            "Unable to reach the backend."
        );
    } finally {
        setLoading(false);
    }
};
const getRecommendationColor = (recommendation) => {
    if (!recommendation) return "#555";

    switch (recommendation.toUpperCase()) {
        case "BUY":
            return "#16a34a";
        case "SELL":
            return "#dc2626";
        default:
            return "#f59e0b";
    }
};
return (
    <div className="container">

        <h1>Investment Research Assistant</h1>

        <div className="search-box">

            <input
                type="text"
                placeholder="Enter company name..."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleAnalyze();
                    }
                }}
            />

            <button
                onClick={handleAnalyze}
                disabled={loading}
            >
                {loading ? "Analyzing..." : "Analyze"}
            </button>

        </div>

        {error && (
            <div className="error">
                {error}
            </div>
        )}

        {loading && (
            <div className="loader"></div>
        )}

        {response && (

<div className="analysis-card">

    <h1>{response.company}</h1>

    <div className="info-grid">

        <div className="info-box">
            <h4>Sector</h4>
            <p>{response.sector}</p>
        </div>

        <div className="info-box">
            <h4>Market Cap</h4>
            <p>{response.marketCap}</p>
        </div>

        <div className="info-box">
            <h4>Risk Level</h4>
            <p>{response.riskLevel}</p>
        </div>

        <div className="info-box">
            <h4>Growth Potential</h4>
            <p>{response.growthPotential}</p>
        </div>

    </div>

    <div className="section">

        <h2>Company Overview</h2>

        <p>{response.companyOverview}</p>

    </div>

    <div className="grid">

        <div className="card">

            <h2>Pros</h2>

            <ul>
                {(response.pros || []).map((item, index) => (
                    <li key={index}>✅ {item}</li>
                ))}
            </ul>

        </div>

        <div className="card">

            <h2>Cons</h2>

            <ul>
                {(response.cons || []).map((item, index) => (
                    <li key={index}>❌ {item}</li>
                ))}
            </ul>

        </div>

    </div>

    <div className="recommendation">

        <h2>Recommendation</h2>

        <div
            className="recommendation-badge"
            style={{
                backgroundColor: getRecommendationColor(response.recommendation)
            }}
        >
            {response.recommendation}
        </div>

        <p>{response.reason}</p>

    </div>

    <div className="section">

        <h2>Top Competitors</h2>

        <div className="competitors">

            {(response.competitors || []).map((company, index) => (
                <span key={index} className="chip">
                    {company}
                </span>
            ))}

        </div>

    </div>

</div>

        )}

    </div>
);
}

export default ResearchForm;