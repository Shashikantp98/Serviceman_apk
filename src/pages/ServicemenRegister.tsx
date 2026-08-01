// import logo from "../assets/dlogo.png";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useLocation } from "react-router-dom";
import Input from "../components/inputs/input";
import ApiService from "../services/api";
import { useState } from "react";
import { Smartphone } from "react-feather";

const ServicemenRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;
  const [loading, setLoading] = useState(false);

  // ✅ Yup validation schema
  const storeSchema = yup.object({
    country_code: yup.string().default("+91"),
    phone_number: yup
      .string()
      .required("Phone number is required")
      .matches(/^[6-9]\d{9,11}$/, "Invalid Phone number, Phone number must start with 6, 7, 8, or 9 and be 10 digits"),
    user_type: yup.string().default(role),
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<any>({
    resolver: yupResolver(storeSchema),
    mode: "onSubmit", // validation triggers only on submit
  });

  const onSubmit = (data: any) => {
    setLoading(true);

    // Get FCM token from global or localStorage (iOS persists here)
    let fcmToken = (window as any).fcmToken || "";

    // Fallback to localStorage for iOS - check immediately before sending
    if (!fcmToken) {
      fcmToken = localStorage.getItem('fcm_token_ios') || "";
      if (fcmToken) {
        console.log("Using FCM token from localStorage:", fcmToken);
        // Update window.fcmToken for future use
        (window as any).fcmToken = fcmToken;
      }
    }

    if (!fcmToken) {
      console.warn("⚠️ No FCM token available!");
    }

    const payload = {
      ...data,
      fcm_token: fcmToken,
    };
    ApiService.post("/user/sendOtp", payload)
      .then((res: any) => {
        setLoading(false);
        navigate("/servicemenotp", {
          state: {
            phone_number: data.phone_number,
            country_code: data.country_code,
            user_type: data.user_type,
            is_existing: res.data.is_existing,
          },
        });
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
      });
  };

  const handleGoBack = () => {
    console.log("Go Back clicked -> navigating to /select");
    navigate("/select", { state: { allowWhenAuth: true } });
  };

  return (
    <>
     

      <div className="h-100vh  pt-5">
       
      <div className="px-4 mt-2">
        <button type="button" className="gobackbtn" onClick={handleGoBack}>
        Go Back
       </button>
      </div>

        <div className="px-4 pt-5 mt-5">

          <Smartphone size={40} className="mb-2 color-green " />
          <h6 className="onboard_head">Enter Mobile Number</h6>

          <Input
         
            control={control}
            name="phone_number"
            label=""
            type="text"
            placeholder="Enter phone number"
            inputMode="numeric"
            maxLength={10}
            // ✅ Only allow numbers
            onKeyDown={(e: React.KeyboardEvent) => {
              if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                e.preventDefault();
              }
            }}
          />

          {/* ✅ Show error below input */}
          {errors.phone_number && (
            <p className="text-danger font-12 mt-2">
              {errors.phone_number.message?.toString()}
            </p>
          )}

          <p className="color-grey font-12 mt-3">
            An OTP will be sent on given phone number for verification. Standard
            message and data rates apply.
          </p>

          <button
            className="fill mt-3"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? "Continue..." : "Continue"}
          </button>
        </div>
      </div>
    </>
  );
};

export default ServicemenRegister;
