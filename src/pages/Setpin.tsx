import { useState } from "react";
import OtpInput from "../components/inputs/otp-input";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApiService from "../services/api";
import { ChevronLeft } from "react-feather";

const Setpin = () => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const location = useLocation();
  const phone_number = location.state?.phone_number;
  const country_code = location.state?.country_code;
  const user_type = location.state?.user_type;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = location.state?.token;
  const [isConfirmPIN, setisConfirmPIN] = useState(false);
  const onSubmit = () => {
    if (isConfirmPIN) {
      if (pin !== confirmPin) {
        toast.error("PINs do not match");
        return;
      }
      setLoading(true);
      const fcmToken = (window as any).fcmToken || "";
      console.log("Setting customer PIN with FCM Token:", fcmToken);
      
      ApiService.post(
        "/user/setCustomerPin",
        {
          confirm_pin: confirmPin,
          pin,
          fcm_token: fcmToken,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((res: any) => {
          console.log(res);
          toast.success(res.message);
          setLoading(false);
          navigate("/location", {
            state: {
              phone_number,
              country_code,
              user_type,
              token,
            },
          });
        })
        .catch((err: any) => {
          console.log(err);
          toast.error(err.response.data.message);
          setLoading(false);
        });
    } else {
      setisConfirmPIN(true);
    }
  };
  const handlePinChange = (value: string) => {
    setPin(value);
  };
  const handleConfirmPinChange = (value: string) => {
    setConfirmPin(value);
  };
  return (
    <>
      <div style={{ position: "absolute" }}>
        <button
          className="back-btn mb-3 mt-5 px-3 py-3"
          style={{ color: "#000" }}
          onClick={() => {
            navigate(-1);
          }}
        >
          <ChevronLeft /> Back
        </button>
      </div>
      <div className="px-5 pt-5 pb-3">
        <h3 className="head2 pt-5">
          {isConfirmPIN ? "Confirm PIN" : "Set Login PIN"}
        </h3>
        <p className="text-center color-grey font-12">
          {isConfirmPIN ? "Confirm your login PIN" : "Set your login PIN"}
        </p>
      </div>
      <div className="otp">
        {isConfirmPIN && (
          <OtpInput
            length={6}
            value={confirmPin}
            onChange={handleConfirmPinChange}
            className="otp-input-container"
            inputClassName="input"
          />
        )}
        {!isConfirmPIN && (
          <OtpInput
            length={6}
            value={pin}
            onChange={handlePinChange}
            className="otp-input-container"
            inputClassName="input"
          />
        )}
      </div>

      <div className="px-4 mt-5">
        <button
          className="fill_half"
          onClick={onSubmit}
          disabled={pin.length !== 6 || loading}
        >
          {loading ? "Setting..." : isConfirmPIN ? "Confirm" : "Set"}
        </button>
      </div>
    </>
  );
};

export default Setpin;
