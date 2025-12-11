import { ChevronRight } from "react-feather";
import circle from "../assets/circle.png";
import { useNavigate } from "react-router-dom";

const Slider = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="gred d-flex h-100vh justify-content-between direction-column">
        <div className="d-flex justify-content-end p-3">
          <button className="skip" onClick={() => navigate("/select")}>
            Skip
          </button>
        </div>
        <div className="slider-circle p-4">
          <img src={circle}></img>
          <h2>
            We Provide Professional Home services at a very friendly price
          </h2>
        </div>
        <div className="p-4 d-flex justify-content-center">
          <button className="next" onClick={() => navigate("/slider2")}>
            <ChevronRight></ChevronRight>
          </button>
        </div>
      </div>
    </>
  );
};

export default Slider;
