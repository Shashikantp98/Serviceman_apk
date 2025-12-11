import logo from "../assets/logo.png";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
const Splash = () => {
  const navigate = useNavigate();
  const { isGuest } = useAuth();

  useEffect(() => {
    setTimeout(() => {
      navigate(!isGuest ? "/select" : "/servicemenlogin", {
        state: { role: "customer" },
      });
    }, 2000);
  }, []);
  return (
    <>
      <div className="spalsh">
        <img src={logo}></img>
      </div>
    </>
  );
};

export default Splash;
