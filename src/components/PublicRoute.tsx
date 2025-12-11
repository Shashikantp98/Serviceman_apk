import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
// import SectionLoader from "../components/SectionLoader";

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="full-page-loader">
        <div className="loader-spinner"></div>
        <p>Please wait while we verify your authentication.</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate to={role === "customer" ? "/home" : "/dashboard"} replace />
    );
  }

  return <>{children}</>;
};

export default PublicRoute;
