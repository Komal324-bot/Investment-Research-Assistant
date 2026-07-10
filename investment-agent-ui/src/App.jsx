import React, { useState } from "react";
import ResearchForm from "./components/ResearchForm";
import AuthPage from "./pages/AuthPage";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppContent() {
  const [darkMode, setDarkMode] = useState(false);
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage darkMode={darkMode} setDarkMode={setDarkMode} />;
  }

  return <ResearchForm darkMode={darkMode} setDarkMode={setDarkMode} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}