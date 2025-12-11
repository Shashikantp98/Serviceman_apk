import { useForm } from "react-hook-form";
import type { SubmitHandler, Resolver } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FileInput from "../components/inputs/FileInput";
import Input from "../components/inputs/input";
import ApiService from "../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Select from "../components/inputs/Select";
import { toast } from "react-toastify";
import QRCode from "react-qr-code";
import { useSectionLoader } from "../utils/useSectionLoader";

interface FormValues {
  file: FileList;
  description: string;
  booking_id: string;
  payment_amount: string;
  payment_method: string;
  otp: string;
  phone_number: string;
  is_fully_paid: boolean;
}

const Capture = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [is_fully_paid, setis_fully_paid] = useState<boolean | null>(null);
  const [qr_data, setQr_data] = useState("");
  const [razorpay_link_id, setRazorpay_link_id] = useState("");
  const [paymentLoaded, setPaymentLoaded] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // FULL PAGE LOADER
  const captureLoader = useSectionLoader("capture-page");

  const validationSchema = Yup.object().shape({
    file: Yup.mixed<FileList>().test(
      "file-required",
      "Image is required",
      (value) => value && value.length > 0
    ),
    description: Yup.string().required("Description is required"),
    booking_id: Yup.string().notRequired(),
    phone_number: Yup.string().notRequired(),
    payment_amount: Yup.string().required("Payment Amount is required"),
    is_fully_paid: Yup.boolean(),
    payment_method: Yup.string().when("is_fully_paid", {
      is: false,
      then: (schema) => schema.required("Payment Method is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    otp: Yup.string().required("OTP is required"),
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as Resolver<FormValues>,
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setIsLoading(true);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "file") formData.append(key, (value as FileList)[0]);
      else formData.append(key, String(value));
    });

    ApiService.post("/servicemen/completePaymentForBooking", formData)
      .then((res: any) => {
        toast.success(res.message);
        setIsLoading(false);

        if (watch("payment_method") === "online") {
          setQr_data(res.data.qr_data);
          setRazorpay_link_id(res.data.razorpay_link_id);
        } else {
          navigate("/projectinfo/" + id);
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message);
        setIsLoading(false);
      });
  };

  const sendCompletionOtp = async () => {
    return ApiService.post("/servicemen/sendCompletionOtp", {
      booking_id: id,
    })
      .then((res: any) => {
        setis_fully_paid(res.data.is_fully_paid);
        setValue("is_fully_paid", res.data.is_fully_paid);
      })
      .catch((err) => console.log(err));
  };

  const getRequestDetails = async () => {
    return ApiService.post("/servicemen/getBookingDetailsForServiceman", {
      booking_id: id,
    })
      .then((res: any) => {
        setValue("booking_id", res.data.booking_id);
        setValue("payment_amount", res.data.booking_amount);
        setValue("phone_number", res.data.customer?.phone_number || "");
      })
      .catch((err) => console.log(err));
  };

  // Prevent double OTP
  const otpSentRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      captureLoader.setLoading(true);

      // STEP 1 → ALWAYS FETCH DETAILS FIRST
      await getRequestDetails();

      // STEP 2 → Send OTP ONLY ONCE
      if (!otpSentRef.current) {
        otpSentRef.current = true; // mark as sent
        await sendCompletionOtp();
      }

      setPaymentLoaded(true);
      captureLoader.setLoading(false);
    };

    init();
  }, [id]);

  let interval: any;

  useEffect(() => {
    if (razorpay_link_id) {
      interval = setInterval(() => {
        verifyPaymentCompletion();
      }, 5000);
    }
  }, [razorpay_link_id]);

  const verifyPaymentCompletion = () => {
    ApiService.post("/servicemen/verifyPaymentCompletion", {
      booking_id: id,
      razorpay_link_id: razorpay_link_id,
    })
      .then((res: any) => {
        toast.success(res.message);
        clearInterval(interval);
        navigate("/projectinfo/" + id);
      })
      .catch(() => { });
  };

  // FULL PAGE LOADER
  if (captureLoader.loading || !paymentLoaded || is_fully_paid === null) {
    return (
      <div className="full-page-loader">
        <div className="loader-spinner"></div>
        <p>Loading payment details...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row px-2 pt-3">
        <div className="col-12 pt-2">
          <h1 className="head4">Capture Image</h1>
        </div>
      </div>

      {qr_data && (
        <div className="qr-payment-container">
          <div className="qr-payment-card">
            <div className="qr-payment-header">
              <h2 className="qr-payment-title">Scan to Pay</h2>
              <p className="qr-payment-subtitle">Complete your payment instantly</p>
            </div>
            
            <div className="qr-code-wrapper">
              <QRCode value={qr_data} size={260} />
            </div>
            
            <div className="qr-payment-info">
              <p className="qr-payment-amount">Amount to Pay</p>
              <div className="amount-display">
                <span className="amount-value">₹{watch("payment_amount")}</span>
              </div>
            </div>
            
            <div className="qr-payment-instructions">
              <p className="instruction-title">How to pay:</p>
              <p className="instruction-text">
                Open Google Pay, PhonePe, Paytm, or any UPI app and scan this QR code. Amount will be pre-filled.
              </p>
            </div>
            
            <div className="qr-payment-footer">
              <p className="footer-note">Payment will be verified automatically</p>
            </div>
          </div>
        </div>
      )}

      {!qr_data && (
        <div className="row px-2">
          <div className="col-12 pt-2">
            <FileInput
              name="file"
              label="Image"
              control={control}
              error={errors.file?.message}
            />
          </div>

          <div className="col-12 pt-2 text-center">
            {watch("file") && watch("file").length > 0 && (
              <img
                className="preview-image-small"
                src={URL.createObjectURL(watch("file")[0])}
                alt="Preview"
                onClick={() => setShowImageModal(true)}
              />
            )}
          </div>

          <div className="col-12 pt-3">
            <Input
              control={control}
              name="description"
              label="Description"
              type="text"
              placeholder="Enter Description"
              error={errors.description?.message}
            />
          </div>

          {is_fully_paid === false && (
            <div className="col-12 pt-3">
              <Select
                control={control}
                name="payment_method"
                label="Payment Method"
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "online", label: "Online" },
                ]}
                error={errors.payment_method?.message}
              />
            </div>
          )}

          <div className="col-12 pt-3">
            <Input
              control={control}
              name="otp"
              label="OTP"
              type="text"
              placeholder="Enter OTP"
              inputMode="numeric"
              maxLength={6}
              error={errors.otp?.message}
            />
          </div>

          <div className="col-12 pt-3" style={{ marginBottom: "120px" }}>
            <button
              className="fill"
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Submit"}
            </button>
          </div>
        </div>
      )}

      {/* Image Modal Popup */}
      {showImageModal && watch("file") && watch("file").length > 0 && (
        <div
          className="modal-overlay"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setShowImageModal(false)}
            >
              ✕
            </button>
            <img
              src={URL.createObjectURL(watch("file")[0])}
              alt="Full view"
              className="modal-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Capture;
