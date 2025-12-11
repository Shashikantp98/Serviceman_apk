import logo from "../assets/dlogo.png";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import Input from "../components/inputs/input";
import ApiService from "../services/api";
import { toast } from "react-toastify";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeft } from "react-feather";
const ForgotPhone = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;
  const [loading, setLoading] = useState(false);
  const storeSchema = yup.object({
    country_code: yup.string().default("+91"),
    phone_number: yup
      .string()
      .required("Phone number is required")
      .matches(/^[+]?[\d\s\-()]{10,15}$/, "Please enter a valid phone number"),
    user_type: yup.string().default(role),
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<any>({
    resolver: yupResolver(storeSchema as any),
    mode: "onChange",
  });
  const onSubmit = (data: any) => {
    setLoading(true);
    ApiService.post("/user/forgotPin", data)
      .then((res: any) => {
        console.log(res);
        setLoading(false);

        toast.success(res.message);
        navigate("/forgot-otp", {
          state: {
            phone_number: data.phone_number,
            country_code: data.country_code,
            user_type: data.user_type,
          },
        });
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
        toast.error(err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
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
      <div className="h-100vh gred2 pt-5">
        <div className="cir">
          <img src={logo}></img>
        </div>
        <div className="px-4 pt-5">
          <h6>Enter Mobile Number</h6>
          <Input
            control={control}
            name="phone_number"
            label=""
            type="text"
            placeholder="Enter phone number"
            inputMode="numeric"
            maxLength={12}
            error={errors.phone_number?.message?.toString()}
          />
          <p className="color-grey font-12 mt-2">
            An OTP will be sent on given phone number for verification.Standard
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

export default ForgotPhone;
