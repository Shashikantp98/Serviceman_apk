import { useState, useRef, useEffect } from "react";
import OtpInput from "../components/inputs/otp-input";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApiService from "../services/api";
import { ChevronLeft } from "react-feather";

const ServicemenOtp = () => {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const phone_number = location.state?.phone_number;
  const country_code = location.state?.country_code;
  const user_type = location.state?.user_type;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Ref to track last submitted OTP
  const lastSubmittedOtpRef = useRef<string | null>(null);

  const onSubmit = async (enteredOtp: string) => {
    if (loading) return; // Prevent if API already in progress
    if (lastSubmittedOtpRef.current === enteredOtp) return; // Prevent multiple calls for same OTP

    lastSubmittedOtpRef.current = enteredOtp;
    setLoading(true);

    try {
      const res: any = await ApiService.post("/user/verifyOtp", {
        phone_number,
        country_code,
        user_type,
        otp: enteredOtp,
        fcm_token: "",
      });

      setLoading(false);
      toast.success(res.message);
      navigate("/setpin", {
        state: {
          phone_number,
          country_code,
          user_type,
          token: res.data.token,
        },
      });
    } catch (err: any) {
      console.log(err);
      toast.error(err.response?.data?.message || "OTP verification failed");
      setLoading(false);
      lastSubmittedOtpRef.current = null; // allow retry on failure
    }
  };

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (otp.length === 6) {
      const timer = setTimeout(() => {
        onSubmit(otp);
      }, 200); // small delay
      return () => clearTimeout(timer);
    }
  }, [otp]);

  const handleOtpChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "");
    setOtp(numericValue);
  };

  const handleResendOtp = () => {
    const postData = { phone_number, country_code, user_type };
    setLoading(true);
    ApiService.post("/user/sendOtp", postData)
      .then((res: any) => {
        toast.success(res.message);
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.message || "Failed to resend OTP");
      })
      .finally(() => {
        setLoading(false);
      });
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
        <h3 className="head2 pt-5">Enter verification code</h3>
        <p className="text-center color-grey font-12">
          We have sent you a 6 digit verification code on <b>+91 {phone_number}</b>
        </p>
      </div>

      <div className="otp">
        <OtpInput
          length={6}
          onChange={handleOtpChange}
          className="otp-input-container"
          inputClassName="input"
        />
      </div>

      <p className="text-center color-grey font-12 pt-3">
        Didn't receive? <b onClick={handleResendOtp}>Resend</b>
      </p>

      {/* Optional fallback button */}
      <div className="px-4 mt-5">
        <button
          className="fill_half"
          onClick={() => onSubmit(otp)}
          disabled={otp.length !== 6 || loading}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </>
  );
};

export default ServicemenOtp;
