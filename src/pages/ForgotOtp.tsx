import { useState } from "react";
import OtpInput from "../components/inputs/otp-input";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApiService from "../services/api";
import { ChevronLeft } from "react-feather";
const ForgotOtp = () => {
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const location = useLocation();
  const phone_number = location.state?.phone_number;
  const country_code = location.state?.country_code;
  const user_type = location.state?.user_type;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleOtpChange = (value: string) => {
    setOtp(value);
  };
  const onSubmit = () => {
    setLoading(true);
    ApiService.post("/user/resetCustomerPin", {
      phone_number,
      country_code,
      user_type,
      otp,
      new_pin: pin,
      confirm_pin: pin,
      fcm_token: "",
    })
      .then((res: any) => {
        console.log(res);
        toast.success(res.message);
        setLoading(false);
        navigate("/servicemenlogin", {
          state: {
            phone_number,
            country_code,
            role: user_type,
          },
        });
      })
      .catch((err: any) => {
        console.log(err);
        toast.error(err.response.data.message);
        setLoading(false);
      });
  };
  const handlePinChange = (value: string) => {
    setPin(value);
  };
  return (
    <>
      <div style={{ position: "absolute" }}>
        <button
          className="back-btn mb-3 mt-4 px-3 py-3"
          style={{ color: "#000" }}
          onClick={() => {
            navigate(-1);
          }}
        >
          <ChevronLeft /> Back
        </button>
      </div>
      <div className="px-5 pt-5 pb-3">
        <h3 className="head2 pt-5">Enter verification code</h3>
        <p className="text-center color-grey font-12">
          We have sent you a 6 digit verification code on{" "}
          <b className="">+91 {phone_number}</b>
        </p>
      </div>
      <div className="otp ">
        <OtpInput
          length={6}
          onChange={handleOtpChange}
          className="otp-input-container"
          inputClassName="input"
        />
      </div>
      <div className="px-5 pt-5 pb-3">
        <h3 className="head2 pt-5">Enter New PIN</h3>
      </div>
      <div className="otp ">
        <OtpInput
          length={6}
          onChange={handlePinChange}
          className="otp-input-container"
          inputClassName="input"
        />
      </div>
      <div className="px-4 mt-5">
        <button
          className="fill_half"
          disabled={otp.length !== 6 || pin.length !== 6 || loading}
          onClick={onSubmit}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </>
  );
};

export default ForgotOtp;
