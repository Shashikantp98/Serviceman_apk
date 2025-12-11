import { ChevronRight } from "react-feather";
import maskgroup from "../assets/maskgroup.png";
import { useNavigate, useLocation } from "react-router-dom";

const Slider2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;
  return (
    <>
      <div className="gred d-flex h-100vh justify-content-between direction-column">
        <div className="d-flex justify-content-end p-3">
          <button
            className="skip"
            onClick={() => navigate("/select", { state: { role: role } })}
          >
            Skip
          </button>
        </div>
        <div className="slider-circle p-4">
          <img src={maskgroup}></img>
          <h2>
            Get Beauty parlor at your home & other Personal Grooming needs
          </h2>
        </div>
        <div className="p-4 d-flex justify-content-center">
          <button
            className="next"
            onClick={() => navigate("/select", { state: { role: role } })}
          >
            <ChevronRight></ChevronRight>
          </button>
        </div>
      </div>
    </>
  );
};

export default Slider2;
