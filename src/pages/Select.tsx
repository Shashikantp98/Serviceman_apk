import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

const Select = () => {
  const navigate = useNavigate();
  const { setIsGuestFn } = useAuth();
  const { isGuest } = useAuth();
  useEffect(() => {
    navigate(!isGuest ? "/select" : "/servicemenregister", {
      state: { role: "customer" },
    });
  }, []);
  return (
    <>
      <div className="spalsh">
        <img src={logo}></img>
      </div>
      <div className="pop">
        <h1 className="wlctext">👋 Hello! Welcome</h1>
        <h4 className="head">What type of account  you like to create?</h4>
        {/* <button
          className="fill brds100"
          onClick={() => {
            setIsGuestFn(false);
            navigate("/servicemenlogin", { state: { role: "servicemen" } });
          }}
        >
          Servicemen
        </button> */}
        <button
          className="fill brds100"
          onClick={() => {
            setIsGuestFn(true);
            navigate("/servicemenlogin", { state: { role: "customer" } });
          }}
        >
          Customer
        </button>
         <button
          className="outline brds100 mt-3 d-block"
          onClick={() => {
            setIsGuestFn(false);
            navigate("/servicemenlogin", { state: { role: "servicemen" } });
          }}
        >
          Serviceman
        </button>
      </div>
    </>
  );
};

export default Select;
