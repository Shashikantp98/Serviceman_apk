import { useState, useRef, useEffect } from "react";
import React from "react";
import OtpInput from "../components/inputs/otp-input";
import { useLocation, useNavigate } from "react-router-dom";
import ApiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { ChevronLeft } from "react-feather";

const ServicemenPin = () => {
  const { login } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null); // Error state
  const location = useLocation();
  const phone_number = location.state?.phone_number;
  const user_type = location.state?.user_type;
  const [loading, setLoading] = useState(false);
  const [fcmReady, setFcmReady] = useState(false);
  const navigate = useNavigate();

  // Ref to track last submitted PIN
  const lastSubmittedPinRef = useRef<string | null>(null);

  // Check for FCM token availability
  React.useEffect(() => {
    const checkToken = () => {
      if ((window as any).fcmToken && (window as any).fcmToken !== "") {
        setFcmReady(true);
      } else {
        setTimeout(checkToken, 500);
      }
    };
    checkToken();
  }, []);

  const onSubmit = async (enteredPin: string) => {
    if (loading) return; // Prevent if API already in progress
    if (lastSubmittedPinRef.current === enteredPin) return; // Prevent multiple calls for same PIN

    lastSubmittedPinRef.current = enteredPin;
    setLoading(true);
    setError(null); // reset previous error

    try {
      // Get FCM token from global or navigation state
      const fcmToken = (window as any).fcmToken || "";
      console.log("Logging in with FCM Token:", fcmToken);
      const res: any = await ApiService.post("/user/loginUser", {
        phone_number,
        pin: enteredPin,
        user_type,
        fcm_token: fcmToken,
      });

      setLoading(false);
      login(res.data.token, user_type);

      // Update FCM token after login
      await ApiService.post("/user/updateFcmToken", {
        fcm_token: fcmToken,
        user_type
      });

      if (user_type === "customer") navigate("/home");
      if (user_type === "servicemen") navigate("/dashboard");
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.message || "Login failed"); // set error message
      setLoading(false);
      lastSubmittedPinRef.current = null; // allow retry
    }
  };

  // Debounce submission when 6 digits entered
  useEffect(() => {
    if (pin.length === 6) {
      const timer = setTimeout(() => {
        onSubmit(pin);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pin]);

  const handlePinChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setPin(numericValue);
  };

  return (
    <>
      <div style={{ position: "absolute" }}>
        <button
          className="back-btn mb-3 mt-5 px-3 py-3"
          style={{ color: "#000" }}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft /> Back
        </button>
      </div>

      <div className="px-5 pt-5 pb-3">
        <h3 className="head2 pt-5">Enter Pin</h3>
        <p className="text-center color-grey font-12">
          Enter your pin for login and security
        </p>
      </div>

      <div className="otp">
        <OtpInput
          length={6}
          onChange={handlePinChange}
          className="otp-input-container"
          inputClassName="input"
        />
      </div>

      {error && <p className="text-danger font-14 mt-1 text-center">{error}</p>}

      <p
        className="para2 mb-1 mt-4"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <b className="text-black d-block pt-1">
          Forgot PIN?{" "}
          <span
            className="text-decoration-underline"
            onClick={() =>
              navigate("/forgot-phone", { state: { role: user_type } })
            }
          >
            Click here
          </span>
        </b>
      </p>

      <div className="px-4 mt-5">
        <button
          className="fill_half"
          onClick={() => onSubmit(pin)}
          disabled={pin.length !== 6 || loading || !fcmReady}
        >
          {fcmReady ? (loading ? "Login..." : "Login") : "Getting device token..."}
        </button>
      </div>
    </>
  );
};

export default ServicemenPin;
