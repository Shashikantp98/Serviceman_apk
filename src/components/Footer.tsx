import {
  File,
  FileText,
  Home,
  MessageSquare,
  User,
  DollarSign,
} from "react-feather";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LoginModal } from "./LoginModal";
import { useState } from "react";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, token, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleBookNow = (item: any) => {
    if (token == "guest") {
      setShowLoginModal(true);
    } else {
      navigate(item);
    }
  };
  return (
    <>
      <div className="footer">
        {role === "customer" && (
          <ul>
            <li 
              onClick={() => navigate("/home")}
              className={isActive("/home") ? "active" : ""}
            >
              <Home></Home>
              Home
            </li>
            <li 
              onClick={() => handleBookNow("/myrequest")}
              className={isActive("/myrequest") ? "active" : ""}
            >
              <File></File>
              Request
            </li>
            <li 
              onClick={() => handleBookNow("/supportlist")}
              className={isActive("/supportlist") ? "active" : ""}
            >
              <MessageSquare></MessageSquare>
              Support
            </li>
            <li 
              onClick={() => handleBookNow("/customerprofile")}
              className={isActive("/customerprofile") ? "active" : ""}
            >
              <User></User>
              Profile
            </li>
          </ul>
        )}
        {role === "servicemen" && (
          <ul>
            <li 
              onClick={() => navigate("/dashboard")}
              className={isActive("/dashboard") ? "active" : ""}
            >
              <Home></Home>
              Explore
            </li>
            <li 
              onClick={() => navigate("/bookinghistory")}
              className={isActive("/bookinghistory") ? "active" : ""}
            >
              <FileText />
              Booking
            </li>
            <li 
              onClick={() => navigate("/wallet")}
              className={isActive("/wallet") ? "active" : ""}
            >
              <DollarSign />
              Wallet
            </li>
            <li 
              onClick={() => navigate("/profile")}
              className={isActive("/profile") ? "active" : ""}
            >
              <User></User>
              Profile
            </li>
          </ul>
        )}
      </div>
      <LoginModal
        show={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        onConfirm={() => {
          logout();
          setShowLoginModal(false);
        }}
      />
    </>
  );
};

export default Footer;
