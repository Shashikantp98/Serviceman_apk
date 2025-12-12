import { useState } from "react";
import OtpInput from "../components/inputs/otp-input";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import CommonHeader from "./CommonHeader";
const UpdatePin = () => {
  const { role } = useAuth();
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleOtpChange = (value: string) => {
    setOtp(value);
  };
  const handlePinChange = (value: string) => {
    setPin(value);
  };
  const onSubmit = () => {
    setLoading(true);
    const url =
      role === "customer"
        ? "/user/updateCustomerPin"
        : "/servicemen/updateServicemenPin";
    ApiService.post(url, {
      old_pin: otp,
      new_pin: pin,
      confirm_pin: pin,
    })
      .then((res: any) => {
        console.log(res);
        toast.success(res.message);
        setLoading(false);
        navigate(-1);
      })
      .catch((err: any) => {
        console.log(err);
        toast.error(err.response.data.message);
        setLoading(false);
      });
  };
  return (
    <>
      <CommonHeader />
      <div className="container">
        <div className="row px-2 pt-3">
          <div className="px-5 pt-5 pb-3">
            <h3 className="head4 text-center pt-5">Update PIN</h3>
          </div>

          <div className="otp">
            <h5 className="font-14 mb-3 pt-4">Enter your Old PIN number</h5>
            <OtpInput
              length={6}
              onChange={handleOtpChange}
              className="otp-input-container"
              inputClassName="input"
            />
          </div>

          <div className="otp ">
            <h5 className="font-14 mb-3 mt-3 pt-4">Enter your New PIN number</h5>
            <OtpInput
              length={6}
              onChange={handlePinChange}
              className="otp-input-container"
              inputClassName="input"
            />
          </div>
          <div className="px-4 mt-5">
            <button
              className="fill"
              disabled={otp.length !== 6 || pin.length !== 6 || loading}
              onClick={onSubmit}
            >
              {loading ? "Loading..." : "Submit"}{" "}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdatePin;
