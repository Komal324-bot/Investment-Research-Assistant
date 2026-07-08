import { useState } from "react";
import api from "../services/api";

function Home() {

    const [company, setCompany] = useState("");
    const [result, setResult] = useState(null);

    const analyze = async () => {

        try {

            const response = await api.post("/api/research", {
                company: company
            });

            setResult(response.data);

        } catch (error) {
            console.error(error);
            alert("Backend Error");
        }

    };

    return (
        <div style={{ padding: "40px" }}>

            <h1>Investment Research Agent</h1>

            <input
                type="text"
                placeholder="Enter Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
            />

            <button onClick={analyze}>
                Analyze
            </button>

            {result && (

                <div style={{ marginTop: "20px" }}>

                    <h3>Response</h3>

                    <p><b>Company :</b> {result.company}</p>

                    <p><b>Status :</b> {result.status}</p>

                </div>

            )}

        </div>
    );

}

export default Home;