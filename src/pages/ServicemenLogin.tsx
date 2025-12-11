import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ChevronLeft, LogIn } from "react-feather";

const ServicemenLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;
  const { setIsGuestFn } = useAuth();
  const handleCustomer = () => {
    localStorage.setItem("role", role);
    navigate("/authlocation", { state: { role: role, isGuest: true } });
  };
  return (
    <>
      <div className="gred d-flex h-100vh justify-content-between direction-column">
        <div style={{ position: "absolute" }}>
          <button
            className="back-btn mb-3 mt-5 px-3 py-3"
            onClick={() => {
              setIsGuestFn(false);
              navigate("/select");
            }}
          >
            <ChevronLeft /> Back
          </button>
        </div>
        <div className="spalsh">
          <img src={logo}></img>
        </div>

        <div className="pop">
          <h4 className="lgntext">
            {role === "customer" ? "Login as Customer" : "Login as  Servicemen"}
          </h4>

          <button
            className="fill brds100 lgnbtns"
            onClick={() => {
              const fcmToken = (window as any).fcmToken || "";
              navigate("/servicemenregister", { state: { role: role, fcm_token: fcmToken } });
            }}
          >
            <LogIn size={20}></LogIn>
            Login / Signup
          </button>
          {/* <button
            className="outline mt-3 d-block"
            onClick={() =>
              navigate("/servicemenregister", { state: { role: role } })
            }
          >
            Register
          </button> */}

          {/* <button
            className="normal mt-2"
            onClick={() => navigate("/forgot-phone", { state: { role: role } })}
          >
            Forgot PIN
          </button> */}
          {role === "customer" && (
            <button className="btnskipss" onClick={handleCustomer}>
              Skip
            </button>
          )}
          <button className="normal">Powered by Aspirant Infotech</button>
        </div>
      </div>
    </>
  );
};

export default ServicemenLogin;
