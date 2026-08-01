import { useState, useRef, useEffect } from "react";
import OtpInput from "../components/inputs/otp-input";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApiService from "../services/api";
import { Smartphone } from "react-feather";//ChevronLeft
import { useAuth } from "../contexts/AuthContext";

const ServicemenOtp = () => {
  const { login } = useAuth();
  const [otp, setOtp] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const location = useLocation();
  const phone_number = location.state?.phone_number;
  const country_code = location.state?.country_code;
  const user_type = location.state?.user_type;
  const is_existing = location.state?.is_existing;
  const showReferralInput = is_existing === false || is_existing === 'false';
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
      const payload: any = {
        phone_number,
        country_code,
        user_type,
        otp: enteredOtp,
        fcm_token: "",
      };

      if (showReferralInput && referralCode) {
        payload.referral_code = referralCode;
      }

      const res: any = await ApiService.post("/user/verifyOtp", payload);

      setLoading(false);
      toast.success(res.message);

      if (is_existing) {
        // Existing user — log them in directly
        login(res.data.token, user_type);
        if (user_type === "customer") navigate("/home");
        else navigate("/dashboard");
      } else {
        // New user — go through onboarding
        navigate("/location", {
          state: {
            phone_number,
            country_code,
            user_type,
            token: res.data.token,
          },
        });
      }
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
     <div className="h-100vh  pt-5">
        <div className="px-4 mt-2">
            <button className="gobackbtn" onClick={() => navigate(-1)}>
            Go Back
            </button>
        </div>
         <div className="px-4 pt-5 mt-5">
            <Smartphone size={40} className="mb-2 color-green " />
            <h6 className="onboard_head pb-3">Enter verification code</h6>
            
            <div className="otp">
        <OtpInput
          length={6}
          onChange={handleOtpChange}
          className="otp-input-container"
          inputClassName="input"
        />
            </div>

            {showReferralInput && (
              <div className="pt-3">
                <label className="lbl d-block">Referral Code (optional)</label>
                <input
                  type="text"
                  className="form-control mt-1 npt_cmn2"
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                />
              </div>
            )}

             <p className="text-center color-grey font-16 pt-4">
        Didn't receive? <b className="newgr" onClick={handleResendOtp}>Resend</b>
      </p>

             <button
          className="fill mt-3"
          onClick={() => onSubmit(otp)}
          disabled={otp.length !== 6 || loading}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
         </div>
     </div>

    

      

     

    
    </>
  );
};

export default ServicemenOtp;
