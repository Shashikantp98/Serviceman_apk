// import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Select.css";
import dlogo from "../assets/dlogo.png";

const Select = () => {
  const navigate = useNavigate();
  const { setIsGuestFn } = useAuth();
  // const { isGuest } = useAuth();
  // Intentionally not auto-redirecting here — user should see the Select UI.
  return (
    <div className="select-container">
      <div className="spl_wrap" />
      <div className="logo-watermark" />
      <div className="laygred" />

      <div className="pop">
        <div className="brand-badge">
          <img src={dlogo} alt="Instasevak" />
        </div>
        <h1 className="wlctext">Clean Home — Happy You</h1>
        <h4 className="supporttext">We provide all types of cleaning and repair services.</h4>

        <div className="button-stack">
          <button
            className="btn btn-primary"
            onClick={() => {
              setIsGuestFn(true);
              navigate("/servicemenregister", { state: { role: "customer" } });
            }}
          >
            {/* <span className="btn-icon">🏠</span> */}
            Customer
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => {
              setIsGuestFn(false);
              navigate("/servicemenregister", { state: { role: "servicemen" } });
            }}
          >
            <span className="btn-icon">🛠️</span>
            I'm a Serviceman
          </button>
        </div>
      </div>
    </div>
  );
};

export default Select;