import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { setNavigator } from "../components/PushNavigate";
const AuthenticatedLayout: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
  return (
    <div>
      <Outlet />
      <Footer />
    </div>
  );
};

export default AuthenticatedLayout;
