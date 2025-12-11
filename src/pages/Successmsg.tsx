import { Check } from "react-feather";
import { useLocation, useNavigate } from "react-router-dom";
const Successmsg = () => {
  const { name, service_name, booking_date, booking_time } =
    useLocation().state;
  const navigate = useNavigate();
  return (
    <>
      <div className="wraps2 px-4">
        <div className="">
          <div>
            <div className="sucright">
              <Check></Check>
            </div>
          </div>
          <p className="color-blue text-center mb-2 pt-3">Great</p>
          <h3 className="head color-blue text-center pb-0 mb-3">
            Request Generate Successful{" "}
          </h3>
          <p className="font-14 text-center">
            Dear <b>{name}</b> you have successfully scheduled booking of{" "}
           <b>{service_name}</b> 
            for the upcoming date <b>{booking_date}</b> at <b>{booking_time}</b>. Our service
            provider will contact you soon.
          </p>
          <div className="row">
            <div className="col-12 pt-4">
              <button className="fill" onClick={() => navigate("/")}>
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Successmsg;
