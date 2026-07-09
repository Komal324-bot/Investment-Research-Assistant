import React, { useState } from "react";
import ResearchForm from "./components/ResearchForm";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return <ResearchForm darkMode={darkMode} setDarkMode={setDarkMode} />;
}