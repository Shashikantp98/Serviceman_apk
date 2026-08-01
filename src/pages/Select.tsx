// import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
// import { useEffect } from "react";

const Select = () => {
  const navigate = useNavigate();
  const { setIsGuestFn } = useAuth();
  // const { isGuest } = useAuth();
  // Intentionally not auto-redirecting here — user should see the Select UI.
  return (
    <>
      
      <div className="spl_wrap">
        <div className="laygred" ></div>
      </div>


      <div className="pop">
        <h1 className="wlctext">Clean Home Happy You Always </h1>
        <h4 className="supporttext">We Provide all types of cleaning and repair services to our customers</h4>
        <button
          className="fill brds100"
          onClick={() => {
            setIsGuestFn(true);
            navigate("/servicemenregister", { state: { role: "customer" } });
          }}
        >
          Get Started
        </button>

       
        <button
          className="iamser"
          onClick={() => {
            setIsGuestFn(false);
            navigate("/servicemenregister", { state: { role: "servicemen" } });
          }}
        >
           Are you Servicemen? <b>Click</b>
        </button>
      </div>



    </>
  );
};

export default Select;
