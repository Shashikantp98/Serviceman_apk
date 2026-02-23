import React from "react";
import { Navigate, useLocation } from "react-router-dom";
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

  const location = useLocation();

  if (isAuthenticated) {
    // Allow certain navigations to public routes even when authenticated
    // e.g., navigate('/registration', { state: { allowWhenAuth: true } })
    if ((location.state as any)?.allowWhenAuth) {
      return <>{children}</>;
    }

    return (
      <Navigate to={role === "customer" ? "/home" : "/dashboard"} replace />
    );
  }

  return <>{children}</>;
};

export default PublicRoute;
